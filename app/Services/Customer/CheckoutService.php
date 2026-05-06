<?php

namespace App\Services\Customer;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Actions\Stock\ReleaseStockReservationAction;
use App\Actions\Vouchers\ReleaseVoucherReservationAction;
use App\Services\Integrations\BiteshipService;
use App\Services\Integrations\MidtransService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private readonly BiteshipService $biteship,
        private readonly MidtransService $midtrans,
        private readonly SiteSettingService $settings,
        private readonly ReleaseStockReservationAction $releaseStock,
        private readonly ReleaseVoucherReservationAction $releaseVoucher,
    ) {}

    public function pageData(User $user): array
    {
        $this->forgetExpiredCheckoutSession();

        $items = $this->cartItems($user);
        $addresses = $this->addresses($user);
        $voucherCode = session('checkout.voucher_code');
        $voucher = is_string($voucherCode) ? $this->validVoucher($voucherCode, (float) $items->sum('subtotal')) : null;
        $discount = $voucher ? $this->discountAmount($voucher, (float) $items->sum('subtotal')) : 0.0;
        $rate = $this->selectedRate();

        return [
            'cartItems' => $items->values()->all(),
            'addresses' => $addresses,
            'defaultAddressId' => collect($addresses)->firstWhere('is_default', true)['id'] ?? ($addresses[0]['id'] ?? null),
            'appliedVoucher' => $voucher ? $this->voucherPayload($voucher, $discount) : null,
            'selectedShippingRate' => $rate,
            'summary' => $this->summary($items, (float) ($rate['price'] ?? 0), $discount),
        ];
    }

    public function shippingRates(User $user, int $addressId): array
    {
        $address = $this->ownedAddress($user, $addressId);
        if (! filled($address->postal_code)) {
            throw ValidationException::withMessages(['customer_address_id' => 'Alamat belum memiliki postal code.']);
        }

        $items = $this->cartItems($user);
        if ($items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Keranjang kosong.']);
        }

        $rates = $this->biteship->shippingRates($address->postal_code, $this->biteshipItems($items));
        session([
            'checkout.shipping_rates' => $rates,
            'checkout.customer_address_id' => $address->id,
            'checkout.cart_hash' => $this->cartHash($items),
            'checkout.rates_generated_at' => now()->toIso8601String(),
            'checkout.rates_expires_at' => now()->addMinutes($this->shippingRateTtlMinutes())->toIso8601String(),
            'checkout.session_expires_at' => now()->addMinutes($this->checkoutSessionTtlMinutes())->toIso8601String(),
        ]);

        return $rates;
    }

    public function selectShippingRate(string $rateId): array
    {
        $this->forgetExpiredCheckoutSession();

        $rate = collect(session('checkout.shipping_rates', []))->firstWhere('id', $rateId);

        if (! $rate) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir.']);
        }

        session(['checkout.shipping_rate_id' => $rateId]);
        session([
            'checkout.selected_rate_binding' => [
                'shipping_rate_id' => $rateId,
                'customer_address_id' => session('checkout.customer_address_id'),
                'cart_hash' => session('checkout.cart_hash'),
                'selected_at' => now()->toIso8601String(),
            ],
        ]);

        return $rate;
    }

    public function applyVoucher(User $user, string $code): array
    {
        $this->forgetExpiredCheckoutSession();

        $items = $this->cartItems($user);
        $voucher = $this->validVoucher($code, (float) $items->sum('subtotal'));
        $discount = $this->discountAmount($voucher, (float) $items->sum('subtotal'));

        session(['checkout.voucher_code' => $voucher->code]);
        session()->forget(['checkout.shipping_rates', 'checkout.shipping_rate_id', 'checkout.selected_rate_binding']);

        return [
            'voucher' => $this->voucherPayload($voucher, $discount),
            'summary' => $this->summary($items, (float) ($this->selectedRate()['price'] ?? 0), $discount),
        ];
    }

    public function removeVoucher(User $user): array
    {
        session()->forget('checkout.voucher_code');
        session()->forget(['checkout.shipping_rates', 'checkout.shipping_rate_id', 'checkout.selected_rate_binding']);
        $items = $this->cartItems($user);

        return [
            'voucher' => null,
            'summary' => $this->summary($items, (float) ($this->selectedRate()['price'] ?? 0), 0.0),
        ];
    }

    public function placeOrder(User $user, array $payload): array
    {
        $this->forgetExpiredCheckoutSession();

        $idempotencyKey = (string) $payload['idempotency_key'];
        $existingOrder = Order::query()
            ->with('payment')
            ->where('user_id', $user->id)
            ->where('checkout_idempotency_key', $idempotencyKey)
            ->first();

        if ($existingOrder) {
            if ($existingOrder->payment?->midtrans_redirect_url) {
                return [
                    'order_id' => $existingOrder->id,
                    'payment_id' => $existingOrder->payment->id,
                    'redirect_url' => $existingOrder->payment->midtrans_redirect_url,
                ];
            }

            throw ValidationException::withMessages(['checkout' => 'Checkout sebelumnya masih diproses atau gagal. Muat ulang checkout untuk mencoba lagi.']);
        }

        $this->validateSelectedShippingRate($user, (int) $payload['customer_address_id'], (string) $payload['shipping_rate_id']);

        $payment = DB::transaction(function () use ($user, $payload): Payment {
            $address = $this->ownedAddress($user, (int) $payload['customer_address_id']);
            $rate = $this->rateFromPayload((string) $payload['shipping_rate_id']);
            $items = $this->lockedCartItems($user);

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Keranjang kosong.']);
            }

            $subtotal = 0.0;
            foreach ($items as $item) {
                $variant = ProductVariant::query()
                    ->with('product.primaryImage:id,product_id,image_url')
                    ->whereKey($item->product_variant_id)
                    ->lockForUpdate()
                    ->first();
                $product = $variant?->product;
                $available = $variant ? max(0, $variant->stock - $variant->reserved_stock) : 0;

                if (! $variant || ! $product || $product->status !== 'published' || ! $variant->is_active || $available < $item->quantity) {
                    throw ValidationException::withMessages(['cart' => "Stok {$product?->name} tidak mencukupi."]);
                }

                $currentPrice = $this->currentUnitPrice($variant);

                if ($this->minorUnits($item->price_snapshot) !== $this->minorUnits($currentPrice)) {
                    $item->forceFill(['price_snapshot' => $currentPrice])->save();

                    throw ValidationException::withMessages(['cart' => "Harga {$product->name} berubah. Tinjau ulang keranjang dan pilih ulang ongkir."]);
                }

                $item->setRelation('variant', $variant);
                $item->setRelation('product', $product);
                $subtotal += (float) $item->price_snapshot * $item->quantity;
            }

            $voucher = null;
            $discount = 0.0;
            $voucherCode = session('checkout.voucher_code');
            if (is_string($voucherCode)) {
                $voucher = Voucher::query()->where('code', Str::upper(trim($voucherCode)))->lockForUpdate()->first();
                if (! $voucher) {
                    throw ValidationException::withMessages(['voucher_code' => 'Voucher tidak valid untuk order ini.']);
                }
                $this->assertValidVoucher($voucher, $subtotal);
                $discount = $this->discountAmount($voucher, $subtotal);
                $voucher->increment('used_count');
            }

            $serviceFee = (float) ($this->settings->first(['payment_service_fee'], '0') ?: 0);
            $order = Order::query()->create([
                'user_id' => $user->id,
                'customer_address_id' => $address->id,
                'order_number' => $this->orderNumber(),
                'checkout_idempotency_key' => $payload['idempotency_key'],
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => $address->recipient_phone,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'shipping_cost' => (float) $rate['price'],
                'service_fee' => $serviceFee,
                'grand_total' => max(0, $subtotal + (float) $rate['price'] + $serviceFee - $discount),
                'voucher_id' => $voucher?->id,
                'voucher_code' => $voucher?->code,
                'payment_status' => 'pending',
                'order_status' => 'pending_payment',
                'shipping_status' => 'not_created',
                'no_return_refund_agreed' => (bool) ($payload['no_return_refund_agreed'] ?? false),
                'no_return_refund_agreed_at' => ! empty($payload['no_return_refund_agreed']) ? now() : null,
                'notes' => $payload['notes'] ?? null,
            ]);

            $order->address()->create([
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->recipient_phone,
                'province' => $address->province,
                'city' => $address->city,
                'district' => $address->district,
                'subdistrict' => $address->subdistrict,
                'postal_code' => $address->postal_code,
                'biteship_area_id' => $address->biteship_area_id,
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
                'full_address' => $address->full_address,
                'note' => $address->note,
            ]);

            foreach ($items as $item) {
                $variant = $item->variant;
                $product = $item->product;
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'variant_sku' => $variant->sku,
                    'color_name' => $variant->color_name,
                    'size' => $variant->size,
                    'price' => $item->price_snapshot,
                    'quantity' => $item->quantity,
                    'subtotal' => (float) $item->price_snapshot * $item->quantity,
                    'weight' => max(1, (int) $product->weight) * $item->quantity,
                    'length' => $product->length,
                    'width' => $product->width,
                    'height' => $product->height,
                    'product_image_url' => $variant->image_url ?? $product->primaryImage?->image_url,
                ]);
                $variant->increment('reserved_stock', $item->quantity);
            }

            $order->shipment()->create([
                'shipping_provider' => 'biteship',
                'courier_company' => $rate['courier_company'],
                'courier_type' => $rate['courier_type'],
                'courier_service_name' => $rate['courier_service_name'],
                'delivery_type' => 'now',
                'shipping_cost' => $rate['price'],
                'insurance_cost' => 0,
                'estimated_delivery' => $rate['duration'],
                'shipping_status' => 'not_created',
                'raw_rate_response' => $rate['raw'] ?? $rate,
            ]);

            $payment = $order->payment()->create([
                'payment_provider' => 'midtrans',
                'midtrans_order_id' => $order->order_number,
                'gross_amount' => $order->grand_total,
                'currency' => 'IDR',
                'transaction_status' => 'pending',
                'expires_at' => now()->addMinutes((int) ($this->settings->first(['payment_expiry_duration'], '1440') ?: 1440)),
            ]);

            return $payment;
        });

        try {
            $snap = $this->midtrans->createSnapTransaction($payment->order()->with(['items', 'address'])->firstOrFail());
            DB::transaction(function () use ($payment, $snap): void {
                $payment->refresh()->update([
                    'midtrans_snap_token' => $snap['token'] ?? null,
                    'midtrans_redirect_url' => $snap['redirect_url'] ?? null,
                    'raw_response' => $snap,
                ]);
            });
        } catch (\Throwable $exception) {
            DB::transaction(function () use ($payment): void {
                $order = $payment->order()->lockForUpdate()->firstOrFail();
                $this->releaseStock->execute($order);
                $this->releaseVoucher->execute($order);
                $order->update(['payment_status' => 'failed', 'order_status' => 'payment_failed', 'cancelled_at' => now()]);
                $payment->update(['transaction_status' => 'snap_failed', 'raw_response' => ['error' => $exception->getMessage()]]);
            });

            throw ValidationException::withMessages(['payment' => 'Gagal membuat transaksi Midtrans. Silakan coba lagi.']);
        }

        $cart = Cart::query()->firstWhere('user_id', $user->id);
        $cart?->items()->delete();
        $this->forgetCheckoutSession();
        $payment->refresh();

        return [
            'order_id' => $payment->order_id,
            'payment_id' => $payment->id,
            'redirect_url' => $payment->midtrans_redirect_url,
        ];
    }

    private function cartItems(User $user): Collection
    {
        return $this->cartQuery($user)
            ->get()
            ->map(function (CartItem $item): array {
                $product = $item->product;
                $variant = $item->variant;
                $availableStock = $variant ? max(0, $variant->stock - $variant->reserved_stock) : 0;

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'title' => $product?->name ?? 'Produk tidak tersedia',
                    'sku' => $product?->sku,
                    'variant_sku' => $variant?->sku,
                    'color' => $variant?->color_name,
                    'size' => $variant?->size,
                    'image' => $variant?->image_url ?? $product?->primaryImage?->image_url,
                    'price' => (float) $item->price_snapshot,
                    'quantity' => $item->quantity,
                    'weight' => max(1, (int) ($product?->weight ?? 1)) * $item->quantity,
                    'available_stock' => $availableStock,
                    'is_available' => $product?->status === 'published' && (bool) $variant?->is_active && $availableStock >= $item->quantity,
                    'subtotal' => (float) $item->price_snapshot * $item->quantity,
                ];
            });
    }

    private function lockedCartItems(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $this->cartQuery($user)
            ->lockForUpdate()
            ->get();
    }

    private function cartQuery(User $user): Builder
    {
        return CartItem::query()
            ->with([
                'product.primaryImage:id,product_id,image_url',
                'variant',
            ])
            ->whereHas('cart', fn ($query) => $query->where('user_id', $user->id))
            ->latest('id');
    }

    private function addresses(User $user): array
    {
        return CustomerAddress::query()
            ->where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->latest()
            ->get()
            ->map(fn (CustomerAddress $address): array => [
                'id' => $address->id,
                'label' => $address->label,
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->recipient_phone,
                'province' => $address->province,
                'city' => $address->city,
                'district' => $address->district,
                'subdistrict' => $address->subdistrict,
                'postal_code' => $address->postal_code,
                'biteship_area_id' => $address->biteship_area_id,
                'full_address' => $address->full_address,
                'note' => $address->note,
                'is_default' => $address->is_default,
            ])
            ->values()
            ->all();
    }

    private function biteshipItems(Collection $items): array
    {
        return $items->map(fn (array $item): array => [
            'name' => mb_substr($item['title'], 0, 100),
            'description' => $item['variant_sku'] ?? $item['sku'] ?? $item['title'],
            'value' => (int) round($item['price']),
            'quantity' => $item['quantity'],
            'weight' => max(1, (int) ceil($item['weight'] / max(1, (int) $item['quantity']))),
        ])->values()->all();
    }

    private function validateSelectedShippingRate(User $user, int $addressId, string $rateId): void
    {
        $this->ownedAddress($user, $addressId);

        $binding = session('checkout.selected_rate_binding');
        $expiresAt = session('checkout.rates_expires_at');

        if (! is_array($binding) || ! is_string($expiresAt)) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir.']);
        }

        if (now()->greaterThan(\Carbon\CarbonImmutable::parse($expiresAt))) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Ongkir sudah kedaluwarsa. Pilih ulang ongkir.']);
        }

        if ((int) ($binding['customer_address_id'] ?? 0) !== $addressId || (string) ($binding['shipping_rate_id'] ?? '') !== $rateId) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir untuk alamat ini.']);
        }

        if ((string) ($binding['cart_hash'] ?? '') !== $this->cartHash($this->cartItems($user))) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Keranjang berubah. Pilih ulang ongkir.']);
        }

        if (! collect(session('checkout.shipping_rates', []))->firstWhere('id', $rateId)) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir.']);
        }

        $this->assertProviderRateStillMatches($user, $addressId, $rateId);
    }

    private function assertProviderRateStillMatches(User $user, int $addressId, string $rateId): void
    {
        $address = $this->ownedAddress($user, $addressId);
        $sessionRate = collect(session('checkout.shipping_rates', []))->firstWhere('id', $rateId);

        if (! $sessionRate) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir.']);
        }

        try {
            $freshRate = collect($this->biteship->shippingRates($address->postal_code, $this->biteshipItems($this->cartItems($user))))
                ->firstWhere('id', $rateId);
        } catch (ValidationException $exception) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Gagal memvalidasi ongkir. Pilih ulang ongkir.']);
        }

        if (! $freshRate || ! $this->shippingRateMatches($sessionRate, $freshRate)) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Ongkir berubah. Pilih ulang ongkir.']);
        }

        session(['checkout.shipping_rates' => collect(session('checkout.shipping_rates', []))->map(fn (array $rate): array => $rate['id'] === $rateId ? $freshRate : $rate)->values()->all()]);
    }

    private function shippingRateMatches(array $sessionRate, array $freshRate): bool
    {
        foreach (['courier_company', 'courier_type', 'courier_service_name', 'duration'] as $key) {
            if ((string) ($sessionRate[$key] ?? '') !== (string) ($freshRate[$key] ?? '')) {
                return false;
            }
        }

        return (int) round((float) ($sessionRate['price'] ?? 0)) === (int) round((float) ($freshRate['price'] ?? 0));
    }

    private function minorUnits(string|float|int $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    private function currentUnitPrice(ProductVariant $variant): float
    {
        return (float) (($variant->product?->sale_price ?? $variant->product?->base_price ?? 0) + $variant->additional_price);
    }

    private function forgetExpiredCheckoutSession(): void
    {
        $expiresAt = session('checkout.session_expires_at') ?: session('checkout.rates_expires_at');

        if (is_string($expiresAt) && now()->greaterThan(\Carbon\CarbonImmutable::parse($expiresAt))) {
            $this->forgetCheckoutSession();
        }
    }

    private function forgetCheckoutSession(): void
    {
        session()->forget($this->checkoutSessionKeys());
    }

    private function checkoutSessionKeys(): array
    {
        return [
            'checkout.voucher_code',
            'checkout.shipping_rates',
            'checkout.shipping_rate_id',
            'checkout.customer_address_id',
            'checkout.cart_hash',
            'checkout.rates_generated_at',
            'checkout.rates_expires_at',
            'checkout.session_expires_at',
            'checkout.selected_rate_binding',
        ];
    }

    private function cartHash(Collection $items): string
    {
        $voucherCode = session('checkout.voucher_code');

        return hash('sha256', json_encode([
            'voucher' => is_string($voucherCode) ? Str::upper($voucherCode) : null,
            'items' => $items->sortBy('id')->map(fn (array $item): array => [
                'id' => $item['id'],
                'product_variant_id' => $item['product_variant_id'],
                'quantity' => $item['quantity'],
                'price' => number_format((float) $item['price'], 2, '.', ''),
            ])->values()->all(),
        ], JSON_THROW_ON_ERROR));
    }

    private function shippingRateTtlMinutes(): int
    {
        return max(1, (int) config('services.checkout.shipping_rate_ttl_minutes', 15));
    }

    private function checkoutSessionTtlMinutes(): int
    {
        return max($this->shippingRateTtlMinutes(), (int) config('services.checkout.session_ttl_minutes', 30));
    }

    private function summary(Collection $items, float $shipping, float $discount): array
    {
        $subtotal = (float) $items->sum('subtotal');

        return [
            'item_count' => (int) $items->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'discount' => $discount,
            'service_fee' => (float) ($this->settings->first(['payment_service_fee'], '0') ?: 0),
            'total' => max(0, $subtotal + $shipping + (float) ($this->settings->first(['payment_service_fee'], '0') ?: 0) - $discount),
        ];
    }

    private function ownedAddress(User $user, int $addressId): CustomerAddress
    {
        return CustomerAddress::query()
            ->where('user_id', $user->id)
            ->whereKey($addressId)
            ->firstOrFail();
    }

    private function validVoucher(string $code, float $subtotal): Voucher
    {
        $voucher = Voucher::query()->where('code', Str::upper(trim($code)))->first();

        if (! $voucher) {
            throw ValidationException::withMessages(['voucher_code' => 'Voucher tidak valid untuk order ini.']);
        }

        $this->assertValidVoucher($voucher, $subtotal);

        return $voucher;
    }

    private function assertValidVoucher(Voucher $voucher, float $subtotal): void
    {
        if (
            ! $voucher->is_active
            || ($voucher->starts_at && $voucher->starts_at->isFuture())
            || ($voucher->ends_at && $voucher->ends_at->isPast())
            || ($voucher->usage_limit !== null && $voucher->used_count >= $voucher->usage_limit)
            || ($voucher->min_order_amount !== null && $subtotal < (float) $voucher->min_order_amount)
        ) {
            throw ValidationException::withMessages(['voucher_code' => 'Voucher tidak valid untuk order ini.']);
        }
    }

    private function discountAmount(Voucher $voucher, float $subtotal): float
    {
        $discount = $voucher->discount_type === 'percentage'
            ? $subtotal * ((float) $voucher->discount_value / 100)
            : (float) $voucher->discount_value;

        if ($voucher->max_discount !== null) {
            $discount = min($discount, (float) $voucher->max_discount);
        }

        return min($subtotal, $discount);
    }

    private function voucherPayload(Voucher $voucher, float $discount): array
    {
        return [
            'code' => $voucher->code,
            'name' => $voucher->name,
            'discount' => $discount,
        ];
    }

    private function selectedRate(): ?array
    {
        $rateId = session('checkout.shipping_rate_id');

        return is_string($rateId)
            ? collect(session('checkout.shipping_rates', []))->firstWhere('id', $rateId)
            : null;
    }

    private function rateFromPayload(string $rateId): array
    {
        $rate = collect(session('checkout.shipping_rates', []))->firstWhere('id', $rateId);

        if (! $rate) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ongkir terlebih dahulu.']);
        }

        return $rate;
    }

    private function orderNumber(): string
    {
        do {
            $number = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }
}
