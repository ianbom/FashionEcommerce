<?php

namespace App\Services\Customer;

use App\Actions\Payments\ManageManualPaymentAction;
use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\Admin\ShipmentManagementService;
use App\Services\Integrations\MidtransService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public const SORTS = ['created_at', 'order_number', 'grand_total', 'payment_status', 'order_status'];

    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly SiteSettingService $settings,
    ) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->trim()->toString(),
            'order_status' => $this->allowed($request->string('order_status')->toString(), OrderStatus::values()),
            'payment_status' => $this->allowed($request->string('payment_status')->toString(), PaymentStatus::values()),
            'sort' => $this->allowed($request->string('sort')->toString(), self::SORTS, 'created_at'),
            'direction' => $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc',
            'per_page' => $this->perPage((int) $request->integer('per_page', 10)),
        ];

        return [
            'orders' => Order::query()
                ->with([
                    'items' => fn ($query) => $query->select([
                        'id',
                        'order_id',
                        'product_name',
                        'color_name',
                        'size',
                        'quantity',
                        'product_image_url',
                    ])->oldest('id'),
                    'shipment:id,order_id,waybill_id,label_url,courier_company,courier_type,raw_order_response',
                    'payment:id,order_id,midtrans_redirect_url',
                ])
                ->withCount('items')
                ->whereBelongsTo($request->user())
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('order_number', 'like', "%{$filters['search']}%")
                    ->orWhereHas('items', fn ($query) => $query->where('product_name', 'like', "%{$filters['search']}%"))))
                ->when($filters['order_status'] !== '', fn ($query) => $query->where('order_status', $filters['order_status']))
                ->when($filters['payment_status'] !== '', fn ($query) => $query->where('payment_status', $filters['payment_status']))
                ->orderBy($filters['sort'], $filters['direction'])
                ->orderByDesc('id')
                ->paginate($filters['per_page'])
                ->withQueryString()
                ->through(fn (Order $order): array => $this->row($order)),
            'filters' => $filters,
            'options' => [
                'orderStatuses' => OrderStatus::values(),
                'paymentStatuses' => PaymentStatus::values(),
                'sorts' => self::SORTS,
                'directions' => ['desc', 'asc'],
                'perPages' => [5, 10, 15, 25],
            ],
        ];
    }

    public function detailData(Request $request, Order $order): array
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 404);

        $order->load([
            'items' => fn ($query) => $query->with('product:id,slug')->oldest('id'),
            'address',
            'payment.logs' => fn ($query) => $query->latest(),
            'shipment.trackings' => fn ($query) => $query->latest('happened_at'),
        ]);

        return [
            'order' => $this->detail($order),
            'support' => [
                'whatsapp_url' => $this->whatsappUrl($order),
            ],
        ];
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 404);
        $order->load('payment');
        $payment = $order->payment;
        if ($payment && $order->payment_status === 'cancelled') {
            return back()->with('success', 'Order sudah dibatalkan.');
        }
        if (! $payment || $order->payment_status !== 'pending') {
            throw ValidationException::withMessages(['order' => 'Order hanya dapat dibatalkan sebelum pembayaran berhasil.']);
        }
        if ($payment->payment_provider === 'manual') {
            app(ManageManualPaymentAction::class)->cancel($payment);
        } elseif ($payment->payment_provider === 'midtrans') {
            app(SyncMidtransPaymentAction::class)->cancel($payment);
        } else {
            throw ValidationException::withMessages(['order' => 'Provider pembayaran tidak mendukung pembatalan ini.']);
        }
        $status = $order->refresh()->payment_status;
        if ($status === 'expired') {
            return back()->with('success', 'Pembayaran sudah kedaluwarsa. Pesanan tidak dapat dibayar lagi.');
        }
        if ($status === 'paid') {
            throw ValidationException::withMessages(['payment' => 'Pembayaran sudah berhasil. Pesanan tidak dapat dibatalkan.']);
        }
        if ($status !== 'cancelled') {
            throw ValidationException::withMessages(['order' => 'Status pembayaran telah berubah; order tidak dibatalkan.']);
        }

        return back()->with('success', 'Order berhasil dibatalkan.');
    }

    public function syncPayment(Request $request, Order $order): RedirectResponse
    {
        abort_unless((int) $order->user_id === (int) $request->user()->id, 404);
        $order->load('payment');
        if (! $order->payment || ! $this->paymentActions($order)['can_sync']) {
            throw ValidationException::withMessages(['payment' => 'Pembayaran ini tidak memerlukan sinkronisasi customer.']);
        }
        app(SyncMidtransPaymentAction::class)->execute($order->payment, 'customer_sync');

        return back()->with('success', 'Status pembayaran diperbarui.');
    }

    private function paymentActions(Order $order): array
    {
        $payment = $order->payment;
        $midtrans = $payment?->payment_provider === 'midtrans';
        $pending = $order->payment_status === 'pending' && ! $order->stock_released_at;
        $creation = data_get($payment?->raw_response, 'snap_creation_state');
        $uncertain = in_array($creation, ['new', 'creating', 'uncertain'], true) || (bool) data_get($payment?->raw_response, 'snap_creation_uncertain');
        $canResume = $midtrans && $pending && ! $uncertain && filled($payment->midtrans_snap_token)
            && (! $payment->expires_at || $payment->expires_at->isFuture()) && $this->midtrans->validRedirectUrl($payment->midtrans_redirect_url);

        return [
            'can_resume' => $canResume,
            'can_sync' => $midtrans && in_array($order->payment_status, ['pending', 'manual_review'], true),
            'can_cancel' => $pending && ($payment?->payment_provider === 'manual' || ($midtrans && ! $uncertain)),
            'requires_reconciliation' => $midtrans && ($order->payment_status === 'manual_review' || ($pending && $uncertain)),
            'failure_reason' => $payment?->failure_reason,
            'resume_url' => $canResume ? $payment->midtrans_redirect_url : null,
        ];
    }

    private function row(Order $order): array
    {
        $items = $order->items->take(2)->map(fn ($item): array => [
            'id' => $item->id,
            'title' => $item->product_name,
            'color' => $item->color_name,
            'size' => $item->size,
            'qty' => $item->quantity,
            'image' => $item->product_image_url,
        ])->values();

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'created_at' => $order->created_at?->toDateTimeString(),
            'created_date' => $order->created_at?->toFormattedDateString(),
            'created_time' => $order->created_at?->format('h:i A'),
            'payment_status' => $order->payment_status,
            'order_status' => $order->order_status,
            'shipping_status' => $order->shipping_status,
            'grand_total' => (float) $order->grand_total,
            'items' => $items,
            'items_count' => $order->items_count,
            'extra_items' => max(0, (int) $order->items_count - $items->count()),
            'shipment' => [
                'waybill_id' => $order->shipment?->waybill_id,
                'courier' => $order->shipment?->courier_company,
                'service' => $order->shipment?->courier_type,
                'tracking_url' => $this->trackingUrl($order->shipment),
            ],
            'payment' => [
                ...$this->paymentActions($order),
                'midtrans_redirect_url' => $this->paymentActions($order)['resume_url'],
            ],
        ];
    }

    private function detail(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'customer_phone' => $order->customer_phone,
            'created_at' => $order->created_at?->toDateTimeString(),
            'created_date' => $order->created_at?->toFormattedDateString(),
            'created_time' => $order->created_at?->format('h:i A'),
            'payment_status' => $order->payment_status,
            'order_status' => $order->order_status,
            'shipping_status' => $order->shipping_status,
            'subtotal' => (float) $order->subtotal,
            'shipping_issue' => $order->shipment ? app(ShipmentManagementService::class)->shippingIssue($order->shipment) : null,
            'discount_amount' => (float) $order->discount_amount,
            'shipping_cost' => (float) $order->shipping_cost,
            'service_fee' => (float) $order->service_fee,
            'grand_total' => (float) $order->grand_total,
            'voucher_code' => $order->voucher_code,
            'notes' => $order->notes,
            'paid_at' => $order->paid_at?->toDateTimeString(),
            'cancelled_at' => $order->cancelled_at?->toDateTimeString(),
            'expired_at' => $order->expired_at?->toDateTimeString(),
            'completed_at' => $order->completed_at?->toDateTimeString(),
            'items' => $order->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'product_slug' => $item->product?->slug,
                'variant_sku' => $item->variant_sku,
                'color_name' => $item->color_name,
                'size' => $item->size,
                'price' => (float) $item->price,
                'quantity' => (int) $item->quantity,
                'subtotal' => (float) $item->subtotal,
                'weight' => $item->weight,
                'product_image_url' => $item->product_image_url,
            ])->values(),
            'address' => $order->address ? [
                'recipient_name' => $order->address->recipient_name,
                'recipient_phone' => $order->address->recipient_phone,
                'province' => $order->address->province,
                'city' => $order->address->city,
                'district' => $order->address->district,
                'subdistrict' => $order->address->subdistrict,
                'postal_code' => $order->address->postal_code,
                'full_address' => $order->address->full_address,
                'note' => $order->address->note,
            ] : null,
            'payment' => $order->payment ? [
                ...$this->paymentActions($order),
                'payment_provider' => $order->payment->payment_provider,
                'payment_method' => $order->payment->payment_method,
                'requested_payment_method' => $order->payment->requested_payment_method,
                'requested_payment_method_label' => $order->payment->requested_payment_method_label,
                'midtrans_order_id' => $order->payment->midtrans_order_id,
                'midtrans_transaction_id' => $order->payment->midtrans_transaction_id,
                'midtrans_snap_token' => $order->payment->midtrans_snap_token,
                'midtrans_redirect_url' => $order->payment->midtrans_redirect_url,
                'transaction_status' => $order->payment->transaction_status,
                'fraud_status' => $order->payment->fraud_status,
                'gross_amount' => (float) $order->payment->gross_amount,
                'currency' => $order->payment->currency,
                'paid_at' => $order->payment->paid_at?->toDateTimeString(),
                'expired_at' => $order->payment->expired_at?->toDateTimeString(),
            ] : null,
            'payment_logs' => $order->payment?->logs?->map(fn ($log): array => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'transaction_status' => $log->transaction_status,
                'processed_at' => $log->processed_at?->toDateTimeString(),
                'created_at' => $log->created_at?->toDateTimeString(),
            ])->values() ?? [],
            'shipment' => $order->shipment ? [
                'shipping_provider' => $order->shipment->shipping_provider,
                'biteship_order_id' => $order->shipment->biteship_order_id,
                'biteship_tracking_id' => $order->shipment->biteship_tracking_id,
                'waybill_id' => $order->shipment->waybill_id,
                'label_url' => $order->shipment->label_url,
                'courier_company' => $order->shipment->courier_company,
                'courier_type' => $order->shipment->courier_type,
                'courier_service_name' => $order->shipment->courier_service_name,
                'delivery_type' => $order->shipment->delivery_type,
                'shipping_cost' => (float) $order->shipment->shipping_cost,
                'insurance_cost' => (float) $order->shipment->insurance_cost,
                'estimated_delivery' => $order->shipment->estimated_delivery,
                'shipping_status' => $order->shipment->shipping_status,
                'shipped_at' => $order->shipment->shipped_at?->toDateTimeString(),
                'delivered_at' => $order->shipment->delivered_at?->toDateTimeString(),
                'cancelled_at' => $order->shipment->cancelled_at?->toDateTimeString(),
                'raw_order_response' => $order->shipment->raw_order_response,
                'tracking_url' => $this->trackingUrl($order->shipment),
            ] : null,
            'trackings' => $order->shipment?->trackings?->map(fn ($tracking): array => [
                'id' => $tracking->id,
                'status' => $tracking->status,
                'description' => $tracking->description,
                'location' => $tracking->location,
                'happened_at' => $tracking->happened_at?->toDateTimeString(),
            ])->values() ?? [],
        ];
    }

    private function allowed(string $value, array $allowed, string $default = ''): string
    {
        return in_array($value, $allowed, true) ? $value : $default;
    }

    private function trackingUrl(?Shipment $shipment): ?string
    {
        if (! $shipment) {
            return null;
        }

        foreach ([
            $shipment->label_url,
            Arr::get($shipment->raw_order_response, 'courier.link'),
            Arr::get($shipment->raw_order_response, 'courier_link'),
        ] as $url) {
            if (is_string($url) && filter_var($url, FILTER_VALIDATE_URL) && in_array(strtolower((string) parse_url($url, PHP_URL_SCHEME)), ['http', 'https'], true)) {
                return $url;
            }
        }

        return null;
    }

    private function whatsappUrl(Order $order): ?string
    {
        $phone = SiteSettingService::normalizePhone($this->settings->get('store_phone'));
        if ($phone === null) {
            return null;
        }

        $message = rawurlencode("Halo, saya butuh bantuan untuk pesanan {$order->order_number}.");

        return "https://wa.me/{$phone}?text={$message}";
    }

    private function perPage(int $value): int
    {
        return in_array($value, [5, 10, 15, 25], true) ? $value : 10;
    }
}
