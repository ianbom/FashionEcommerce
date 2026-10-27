<?php

namespace App\Services\Customer;

use App\Actions\Payments\CreateMidtransSnapAction;
use App\Enums\MidtransPaymentMethod;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Integrations\BiteshipService;
use App\Services\Integrations\MidtransService;
use App\Services\Settings\SiteSettingService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private readonly BiteshipService $biteship,
        private readonly SiteSettingService $settings,
        private readonly MidtransService $midtrans,
        private readonly CreateMidtransSnapAction $createSnap,
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
            'storeLocation' => [
                'latitude' => $this->settings->get('store_latitude'),
                'longitude' => $this->settings->get('store_longitude'),
            ],
            'paymentGateway' => ['provider' => 'midtrans', 'methods' => MidtransPaymentMethod::options()],
            'appliedVoucher' => $voucher ? $this->voucherPayload($voucher, $discount) : null,
            'selectedShippingRate' => $rate,
            'summary' => $this->summary($items, (float) ($rate['price'] ?? 0), $discount),
        ];
    }

    public function cartAvailability(User $user): array
    {
        $items = $this->cartItems($user);

        return [
            'is_empty' => $items->isEmpty(),
            'has_unavailable_items' => $items->contains(fn (array $item): bool => ! $item['is_available']),
        ];
    }

    public function shippingRates(User $user, int $addressId): array
    {
        $address = $this->ownedAddress($user, $addressId);
        if (! filled($address->postal_code)) {
            throw ValidationException::withMessages(['customer_address_id' => 'Alamat belum memiliki postal code.']);
        }

        if (! $this->hasCoordinates($address)) {
            throw ValidationException::withMessages(['customer_address_id' => 'Alamat belum memiliki koordinat. Lengkapi alamat dari buku alamat.']);
        }

        $items = $this->cartItems($user);
        if ($items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Keranjang kosong.']);
        }

        $rates = $this->biteship->shippingRates([
            'postal_code' => $address->postal_code,
            'biteship_area_id' => $address->biteship_area_id,
            'latitude' => $address->latitude,
            'longitude' => $address->longitude,
        ], $this->biteshipItems($items));
        session([
            'checkout.shipping_rates' => $rates,
            'checkout.customer_address_id' => $address->id,
            'checkout.address_hash' => $this->addressHash($address),
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
                'address_hash' => session('checkout.address_hash'),
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

        return [
            'voucher' => $this->voucherPayload($voucher, $discount),
            'summary' => $this->summary($items, (float) ($this->selectedRate()['price'] ?? 0), $discount),
        ];
    }

    public function removeVoucher(User $user): array
    {
        $this->forgetExpiredCheckoutSession();
        session()->forget('checkout.voucher_code');
        $items = $this->cartItems($user);

        return [
            'voucher' => null,
            'summary' => $this->summary($items, (float) ($this->selectedRate()['price'] ?? 0), 0.0),
        ];
    }

    public function placeOrder(User $user, array $payload): array
    {
        $requestedMethod = validator($payload, [
            'payment_method' => ['required', 'string', Rule::in(MidtransPaymentMethod::values())],
        ])->validate()['payment_method'];
        $this->forgetExpiredCheckoutSession();

        $idempotencyKey = (string) $payload['idempotency_key'];
        $existingOrder = Order::query()
            ->with('payment')
            ->where('user_id', $user->id)
            ->where('checkout_idempotency_key', $idempotencyKey)
            ->first();

        if ($existingOrder?->payment) {
            $this->assertPaymentMethodUnchanged($existingOrder->payment, $requestedMethod);

            return $this->createSnap->execute($existingOrder->payment);
        }

        $this->midtrans->assertConfigured();
        $this->validateSelectedShippingRate($user, (int) $payload['customer_address_id'], (string) $payload['shipping_rate_id']);
        $verifiedAddressHash = $this->addressHash($this->ownedAddress($user, (int) $payload['customer_address_id']));

        $payment = DB::transaction(function () use ($user, $payload, $verifiedAddressHash, $requestedMethod): ?Payment {
            $cart = Cart::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $existing = Order::query()->where('user_id', $user->id)->where('checkout_idempotency_key', $payload['idempotency_key'])->first();
            if ($existing?->payment) {
                $this->assertPaymentMethodUnchanged($existing->payment, $requestedMethod);

                return $existing->payment;
            }
            $address = CustomerAddress::query()->where('user_id', $user->id)->whereKey($payload['customer_address_id'])->lockForUpdate()->firstOrFail();
            if ($this->addressHash($address) !== $verifiedAddressHash || $verifiedAddressHash !== session('checkout.selected_rate_binding.address_hash')) {
                throw ValidationException::withMessages(['shipping_rate_id' => 'Alamat berubah. Pilih ulang ongkir.']);
            }
            $rate = $this->rateFromPayload((string) $payload['shipping_rate_id']);
            $items = $this->lockedCartItems($user);

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Keranjang kosong.']);
            }

            $products = Product::query()->with('primaryImage:id,product_id,image_url')->whereIn('id', $items->pluck('product_id'))->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $items = $items->sortBy('product_variant_id');
            $subtotal = 0.0;
            $priceChanged = false;
            foreach ($items as $item) {
                $variant = ProductVariant::query()
                    ->whereKey($item->product_variant_id)
                    ->lockForUpdate()
                    ->first();
                $product = $products->get($item->product_id);
                $variant?->setRelation('product', $product);
                $available = $variant ? max(0, $variant->stock - $variant->reserved_stock) : 0;

                if (! $variant || ! $product || $variant->product_id !== $product->id || $product->status !== 'published' || ! $variant->is_active || $available < $item->quantity) {
                    throw ValidationException::withMessages(['cart' => "Stok {$product?->name} tidak mencukupi."]);
                }

                $currentPrice = $this->currentUnitPrice($variant);

                if ($this->minorUnits($item->price_snapshot) !== $this->minorUnits($currentPrice)) {
                    $item->forceFill(['price_snapshot' => $currentPrice])->save();

                    $priceChanged = true;
                }

                $item->setRelation('variant', $variant);
                $item->setRelation('product', $product);
                $subtotal += (float) $item->price_snapshot * $item->quantity;
            }

            if ($priceChanged) {
                return null;
            }
            $packages = $items->map(fn ($item): array => [
                'id' => $item->id,
                'product_variant_id' => $item->product_variant_id,
                'title' => $item->product->name,
                'sku' => $item->product->sku,
                'variant_sku' => $item->variant->sku,
                'price' => (float) $item->price_snapshot,
                'quantity' => $item->quantity,
                'weight' => (float) $item->product->weight * $item->quantity,
                'length' => $item->product->length,
                'width' => $item->product->width,
                'height' => $item->product->height,
            ]);
            if ($this->cartHash($packages) !== session('checkout.selected_rate_binding.cart_hash')) {
                throw ValidationException::withMessages(['shipping_rate_id' => 'Paket berubah. Pilih ulang ongkir.']);
            }
            $this->biteshipItems($packages);
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

            $serviceFee = round((float) ($this->settings->first(['payment_service_fee'], '0') ?: 0), 2);
            $subtotal = round($subtotal, 2);
            $discount = round($discount, 2);
            $grandTotal = round(max(0, $subtotal + round((float) $rate['price'], 2) + $serviceFee - $discount), 0, PHP_ROUND_HALF_UP);
            if (! is_finite($grandTotal) || $grandTotal < 1) {
                throw ValidationException::withMessages(['payment' => 'Total pembayaran Midtrans harus minimal Rp1.']);
            }
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
                'grand_total' => $grandTotal,
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
                'requested_payment_method' => $requestedMethod,
                'midtrans_order_id' => $order->order_number,
                'gross_amount' => $order->grand_total,
                'currency' => 'IDR',
                'transaction_status' => 'pending',
                'expires_at' => $order->created_at->copy()->addMinutes($this->midtrans->expiryMinutes()),
                'raw_response' => ['snap_creation_state' => 'new'],
            ]);

            $cart->items()->whereIn('id', $items->pluck('id'))->delete();

            return $payment;
        });
        if ($payment === null) {
            $this->forgetCheckoutSession();
            throw ValidationException::withMessages(['cart' => 'Harga berubah. Tinjau ulang keranjang dan pilih ulang ongkir.']);
        }

        $result = $this->createSnap->execute($payment);
        $this->forgetCheckoutSession();
        if ($result['payment_state'] === 'failed') {
            session()->flash('warning', 'Pembayaran ditolak. Item tersedia dipulihkan ke keranjang; periksa kembali sebelum checkout.');
        }

        return $result;
    }

    private function assertPaymentMethodUnchanged(Payment $payment, string $requestedMethod): void
    {
        if ($payment->requested_payment_method !== null && $payment->requested_payment_method !== $requestedMethod) {
            throw ValidationException::withMessages(['payment_method' => 'Metode pembayaran pesanan ini sudah dipilih. Lanjutkan pembayaran melalui detail pesanan; jangan membuat pembayaran ulang.']);
        }
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
                    'weight' => (float) ($product?->weight ?? 0) * $item->quantity,
                    'length' => $product?->length,
                    'width' => $product?->width,
                    'height' => $product?->height,
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
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
                'full_address' => $address->full_address,
                'note' => $address->note,
                'is_default' => $address->is_default,
            ])
            ->values()
            ->all();
    }

    private function biteshipItems(Collection $items): array
    {
        foreach ($items as $item) {
            foreach (['weight', 'length', 'width', 'height'] as $key) {
                $value = $item[$key];
                if (($key === 'weight' || $value !== null) && (! is_numeric($value) || ! is_finite((float) $value) || (float) $value < ($key === 'weight' ? 1 : 0))) {
                    throw ValidationException::withMessages(['cart' => 'Ukuran paket produk tidak valid.']);
                }
            }
        }

        return $items->map(fn (array $item): array => array_filter([
            'name' => mb_substr($item['title'], 0, 100),
            'description' => $item['variant_sku'] ?? $item['sku'] ?? $item['title'],
            'value' => (int) round($item['price']),
            'quantity' => $item['quantity'],
            'weight' => max(1, (int) ceil($item['weight'] / max(1, (int) $item['quantity']))),
            'length' => $item['length'],
            'width' => $item['width'],
            'height' => $item['height'],
            'category' => 'fashion',
        ], fn ($value): bool => filled($value) || $value === 0))->values()->all();
    }

    private function validateSelectedShippingRate(User $user, int $addressId, string $rateId): void
    {
        $this->ownedAddress($user, $addressId);

        $binding = session('checkout.selected_rate_binding');
        $expiresAt = session('checkout.rates_expires_at');

        if (! is_array($binding) || ! is_string($expiresAt)) {
            throw ValidationException::withMessages(['shipping_rate_id' => 'Pilih ulang ongkir.']);
        }

        if (now()->greaterThan(CarbonImmutable::parse($expiresAt))) {
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
            $freshRate = collect($this->biteship->shippingRates([
                'postal_code' => $address->postal_code,
                'biteship_area_id' => $address->biteship_area_id,
                'latitude' => $address->latitude,
                'longitude' => $address->longitude,
            ], $this->biteshipItems($this->cartItems($user))))
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

    private function hasCoordinates(CustomerAddress $address): bool
    {
        return is_numeric($address->latitude) && is_numeric($address->longitude);
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

        if (is_string($expiresAt) && now()->greaterThan(CarbonImmutable::parse($expiresAt))) {
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
            'checkout.address_hash',
            'checkout.rates_generated_at',
            'checkout.rates_expires_at',
            'checkout.session_expires_at',
            'checkout.selected_rate_binding',
        ];
    }

    private function addressHash(CustomerAddress $address): string
    {
        return hash('sha256', json_encode($address->only(['recipient_name', 'recipient_phone', 'province', 'city', 'district', 'subdistrict', 'postal_code', 'biteship_area_id', 'latitude', 'longitude', 'full_address', 'note']), JSON_THROW_ON_ERROR));
    }

    private function cartHash(Collection $items): string
    {
        return hash('sha256', json_encode([
            'items' => $items->sortBy('id')->map(fn (array $item): array => [
                'id' => $item['id'],
                'product_variant_id' => $item['product_variant_id'],
                'quantity' => $item['quantity'],
                'price' => number_format((float) $item['price'], 2, '.', ''),
                'package' => array_map(fn ($value) => $value === null ? null : (float) $value, [$item['weight'], $item['length'], $item['width'], $item['height']]),
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
        $subtotal = round((float) $items->sum('subtotal'), 2);
        $shipping = round($shipping, 2);
        $discount = round($discount, 2);
        $serviceFee = round((float) ($this->settings->first(['payment_service_fee'], '0') ?: 0), 2);
        $rawTotal = max(0, $subtotal + $shipping + $serviceFee - $discount);
        $total = round($rawTotal, 0, PHP_ROUND_HALF_UP);

        return [
            'item_count' => (int) $items->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'discount' => $discount,
            'service_fee' => $serviceFee,
            'rounding_adjustment' => round($total - $rawTotal, 2),
            'total' => $total,
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
