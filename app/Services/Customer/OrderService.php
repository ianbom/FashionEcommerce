<?php

namespace App\Services\Customer;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderService
{
    public const ORDER_STATUSES = ['pending_payment', 'paid', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled', 'expired'];

    public const PAYMENT_STATUSES = ['pending', 'paid', 'expired', 'failed', 'cancelled'];

    public const SORTS = ['created_at', 'order_number', 'grand_total', 'payment_status', 'order_status'];

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->trim()->toString(),
            'order_status' => $this->allowed($request->string('order_status')->toString(), self::ORDER_STATUSES),
            'payment_status' => $this->allowed($request->string('payment_status')->toString(), self::PAYMENT_STATUSES),
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
                    'shipment:id,order_id,waybill_id,courier_company,courier_type',
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
                'orderStatuses' => self::ORDER_STATUSES,
                'paymentStatuses' => self::PAYMENT_STATUSES,
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
            ],
            'payment' => [
                'midtrans_redirect_url' => $order->payment?->midtrans_redirect_url,
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
                'payment_provider' => $order->payment->payment_provider,
                'payment_method' => $order->payment->payment_method,
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

    private function perPage(int $value): int
    {
        return in_array($value, [5, 10, 15, 25], true) ? $value : 10;
    }
}
