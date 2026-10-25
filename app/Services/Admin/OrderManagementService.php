<?php

namespace App\Services\Admin;

use App\Actions\Payments\ManageManualPaymentAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingStatus;
use App\Models\AdminActivityLog;
use App\Models\Order;
use App\Models\StockLog;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderManagementService
{
    use ResolvesAdminPagination;

    public function __construct(
        private readonly NotificationService $notifications,
        private readonly ManageManualPaymentAction $manualPayment,
    ) {}

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
                'shipped' => Order::query()->where('shipping_status', ShippingStatus::InTransit->value)->count(),
                'completed' => Order::query()->where('order_status', OrderStatus::Completed->value)->count(),
                'cancelled' => Order::query()->where('order_status', OrderStatus::Cancelled->value)->count(),
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

    public function availableActions(Order $order): array
    {
        if ($order->payment_status !== 'paid') {
            return [];
        }
        $actions = match ($order->order_status) {
            'paid' => ['processing'], 'processing' => ['ready_to_ship'],
            'delivered' => $order->shipping_status === 'delivered' && $order->shipment?->shipping_status === 'delivered' ? ['completed'] : [],
            default => [],
        };
        if ($order->shipment && $order->shipping_status === $order->shipment->shipping_status
            && (app(ShipmentManagementService::class)->shippingIssue($order->shipment)['is_terminal'] ?? false)
            && ! in_array($order->order_status, ['completed', 'shipment_failed', 'refunded'], true)) {
            $actions[] = 'shipment_failed';
        }

        return $actions;
    }

    public function updateStatus(Order $order, string $target, ?string $reason = null): void
    {
        DB::transaction(function () use ($order, $target, $reason): void {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $shipment = $order->shipment()->lockForUpdate()->first();
            $order->setRelation('shipment', $shipment);
            if ($target === $order->order_status && $target !== 'cancelled') {
                return;
            }
            if (! in_array($target, $this->availableActions($order), true)) {
                throw ValidationException::withMessages(['status' => 'Perubahan status tidak sesuai flow order.']);
            }
            $reason = trim((string) $reason);
            if ($target === 'shipment_failed' && ($reason === '' || mb_strlen($reason) > 1000)) {
                throw ValidationException::withMessages(['reason' => 'Alasan wajib diisi, maksimal 1000 karakter.']);
            }
            $before = $order->order_status;
            $values = ['order_status' => $target];
            if ($target === 'completed') {
                $values['completed_at'] = $order->completed_at ?? now();
            }
            $order->update($values);
            AdminActivityLog::query()->create([
                'user_id' => auth()->id(), 'action' => $target === 'shipment_failed' ? 'admin_order_failure' : 'order_status',
                'module' => 'orders', 'reference_type' => 'order', 'reference_id' => $order->id,
                'old_values' => ['order_status' => $before], 'new_values' => ['order_status' => $target, 'reason' => $reason],
            ]);
            $this->notifications->forOrder($order, 'Order status updated', "Order {$order->order_number} sekarang berstatus {$target}.", 'order');
        });
    }

    public function verifyManualPayment(Order $order): void
    {
        $payment = $order->payment;

        if (! $payment) {
            throw ValidationException::withMessages(['payment' => 'Payment untuk order ini tidak ditemukan.']);
        }

        $this->manualPayment->confirm($payment);
    }

    public function updateNotes(Order $order, ?string $notes): void
    {
        $order->update(['notes' => $notes]);
    }

    public function options(): array
    {
        return [
            'paymentStatuses' => PaymentStatus::values(),
            'orderStatuses' => OrderStatus::values(),
            'shippingStatuses' => ShippingStatus::values(),
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
        $shipments = app(ShipmentManagementService::class);
        $movements = StockLog::query()->where('reference_type', 'order')->where('reference_id', $order->id)
            ->whereIn('product_variant_id', $order->items->pluck('product_variant_id')->filter())->orderBy('id')->get();

        return [
            ...$this->row($order),
            'created_at' => $order->created_at?->toISOString(),
            'booking_uncertain' => (bool) data_get($order->shipment?->raw_order_response, 'booking_creation_uncertain', false),
            'available_actions' => $this->availableActions($order),
            'can_confirm_manual_payment' => $order->payment?->payment_provider === 'manual' && $order->payment_status === 'pending' && $order->order_status === 'pending_payment' && ! $order->stock_released_at && ! $order->stock_finalized_at,
            'can_create_shipment' => $order->payment_status === 'paid' && in_array($order->order_status, ['paid', 'processing', 'ready_to_ship'], true)
                && $order->shipment && filled($order->shipment->courier_company) && filled($order->shipment->courier_type) && $shipments->canBook($order->shipment),
            'shipping_issue' => $order->shipment ? app(ShipmentManagementService::class)->shippingIssue($order->shipment) : null,
            'status_history' => AdminActivityLog::query()->with('user:id,name')->where('reference_type', 'order')->where('reference_id', $order->id)->whereIn('action', ['order_status', 'admin_order_failure', 'shipment_status'])->orderBy('id')->get()->map(fn ($log): array => [
                ...$log->toArray(),
                'status' => $log->new_values['order_status'] ?? $log->new_values['shipping_status'] ?? null,
                'reason' => $log->new_values['reason'] ?? null,
                'actor' => $log->user?->name ?? 'Sistem',
                'created_at' => $log->created_at?->toISOString(),
            ]),
            'stock_movements' => $movements,
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'service_fee' => $order->service_fee,
            'voucher_code' => $order->voucher_code,
            'notes' => $order->notes,
            'paid_at' => $order->paid_at?->toISOString(),
            'cancelled_at' => $order->cancelled_at?->toISOString(),
            'expired_at' => $order->expired_at?->toISOString(),
            'completed_at' => $order->completed_at?->toISOString(),
            'no_return_refund_agreed' => $order->no_return_refund_agreed,
            'no_return_refund_agreed_at' => $order->no_return_refund_agreed_at?->toISOString(),
            'items' => $order->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
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
                'stock_movements' => $movements->where('product_variant_id', $item->product_variant_id)->values(),
            ])->values(),
            'address' => $order->address,
            'payment' => $order->payment,
            'payment_logs' => $order->payment?->logs?->map(fn ($log): array => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'transaction_status' => $log->transaction_status,
                'processed_at' => $log->processed_at?->toISOString(),
                'created_at' => $log->created_at?->toISOString(),
            ])->values() ?? [],
            'shipment' => $order->shipment,
            'trackings' => $order->shipment?->trackings?->map(fn ($tracking): array => [
                'id' => $tracking->id,
                'status' => $tracking->status,
                'description' => $tracking->description,
                'location' => $tracking->location,
                'happened_at' => $tracking->happened_at?->toISOString(),
            ])->values() ?? [],
        ];
    }
}
