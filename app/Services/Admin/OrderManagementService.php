<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderManagementService
{
    use ResolvesAdminPagination;

    public const PAYMENT_STATUSES = ['pending', 'paid', 'expired', 'failed', 'cancelled'];

    public const ORDER_STATUSES = ['pending_payment', 'paid', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled', 'expired'];

    public const SHIPPING_STATUSES = ['not_created', 'confirmed', 'allocated', 'picked', 'in_transit', 'delivered', 'cancelled', 'problem'];

    public function __construct(private readonly NotificationService $notifications) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'payment_status' => $request->string('payment_status')->toString(),
            'order_status' => $request->string('order_status')->toString(),
            'shipping_status' => $request->string('shipping_status')->toString(),
            'courier' => $request->string('courier')->toString(),
            'voucher_code' => $request->string('voucher_code')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        return [
            'orders' => Order::query()
                ->with('shipment:id,order_id,courier_company,courier_type,waybill_id')
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('order_number', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_name', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_email', 'like', "%{$filters['search']}%")
                    ->orWhere('customer_phone', 'like', "%{$filters['search']}%")))
                ->when($filters['payment_status'] !== '', fn ($query) => $query->where('payment_status', $filters['payment_status']))
                ->when($filters['order_status'] !== '', fn ($query) => $query->where('order_status', $filters['order_status']))
                ->when($filters['shipping_status'] !== '', fn ($query) => $query->where('shipping_status', $filters['shipping_status']))
                ->when($filters['voucher_code'] !== '', fn ($query) => $query->where('voucher_code', $filters['voucher_code']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->when($filters['courier'] !== '', fn ($query) => $query->whereHas('shipment', fn ($query) => $query->where('courier_company', $filters['courier'])))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Order $order): array => $this->row($order)),
            'filters' => $filters,
            'options' => $this->options(),
            'stats' => [
                'total' => Order::query()->count(),
                'new_orders' => Order::query()->where('order_status', 'pending_payment')->count(),
                'processing' => Order::query()->where('order_status', 'processing')->count(),
                'shipped' => Order::query()->where('shipping_status', 'shipped')->count(),
                'completed' => Order::query()->where('order_status', 'completed')->count(),
                'cancelled' => Order::query()->where('order_status', 'cancelled')->count(),
            ],
        ];
    }

    public function detailData(Order $order): array
    {
        $order->load([
            'items.variant:id,sku,color_name,size',
            'address',
            'payment.logs' => fn ($query) => $query->latest(),
            'shipment.trackings' => fn ($query) => $query->latest('happened_at'),
        ]);

        return [
            'order' => $this->detail($order),
            'options' => $this->options(),
        ];
    }

    public function updateStatus(Order $order, string $target): void
    {
        if ($target === 'cancelled' && $order->payment_status === 'paid') {
            throw ValidationException::withMessages(['status' => 'Order paid tidak bisa dibatalkan dari dashboard tanpa flow khusus.']);
        }

        $allowed = match ($target) {
            'processing' => in_array($order->order_status, ['paid', 'processing'], true) && $order->payment_status === 'paid',
            'ready_to_ship' => in_array($order->order_status, ['processing', 'ready_to_ship'], true) && $order->payment_status === 'paid',
            'completed' => in_array($order->order_status, ['delivered', 'completed'], true),
            'cancelled' => $order->payment_status !== 'paid' && in_array($order->order_status, ['pending_payment', 'cancelled'], true),
            default => false,
        };

        if (! $allowed) {
            throw ValidationException::withMessages(['status' => 'Perubahan status tidak sesuai flow order.']);
        }

        $payload = ['order_status' => $target];

        if ($target === 'cancelled') {
            $payload['payment_status'] = 'cancelled';
            $payload['cancelled_at'] = now();
        }

        if ($target === 'completed') {
            $payload['completed_at'] = now();
        }

        $order->update($payload);
        $this->notifications->forOrder($order->fresh(), 'Order status updated', "Order {$order->order_number} sekarang berstatus {$target}.", 'order');
    }

    public function updateNotes(Order $order, ?string $notes): void
    {
        $order->update(['notes' => $notes]);
    }

    public function options(): array
    {
        return [
            'paymentStatuses' => self::PAYMENT_STATUSES,
            'orderStatuses' => self::ORDER_STATUSES,
            'shippingStatuses' => self::SHIPPING_STATUSES,
        ];
    }

    public function row(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'customer_phone' => $order->customer_phone,
            'grand_total' => $order->grand_total,
            'payment_status' => $order->payment_status,
            'order_status' => $order->order_status,
            'shipping_status' => $order->shipping_status,
            'courier' => $order->shipment?->courier_company,
            'waybill_id' => $order->shipment?->waybill_id,
            'created_at' => $order->created_at?->toFormattedDateString(),
        ];
    }

    private function detail(Order $order): array
    {
        return [
            ...$this->row($order),
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'service_fee' => $order->service_fee,
            'voucher_code' => $order->voucher_code,
            'notes' => $order->notes,
            'paid_at' => $order->paid_at?->toDateTimeString(),
            'cancelled_at' => $order->cancelled_at?->toDateTimeString(),
            'expired_at' => $order->expired_at?->toDateTimeString(),
            'completed_at' => $order->completed_at?->toDateTimeString(),
            'no_return_refund_agreed' => $order->no_return_refund_agreed,
            'no_return_refund_agreed_at' => $order->no_return_refund_agreed_at?->toDateTimeString(),
            'items' => $order->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'variant_sku' => $item->variant_sku,
                'color_name' => $item->color_name,
                'size' => $item->size,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
                'weight' => $item->weight,
                'product_image_url' => $item->product_image_url,
            ])->values(),
            'address' => $order->address,
            'payment' => $order->payment,
            'payment_logs' => $order->payment?->logs?->map(fn ($log): array => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'transaction_status' => $log->transaction_status,
                'processed_at' => $log->processed_at?->toDateTimeString(),
                'created_at' => $log->created_at?->toDateTimeString(),
            ])->values() ?? [],
            'shipment' => $order->shipment,
            'trackings' => $order->shipment?->trackings?->map(fn ($tracking): array => [
                'id' => $tracking->id,
                'status' => $tracking->status,
                'description' => $tracking->description,
                'location' => $tracking->location,
                'happened_at' => $tracking->happened_at?->toDateTimeString(),
            ])->values() ?? [],
        ];
    }
}
