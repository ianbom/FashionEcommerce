<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use App\Models\ShipmentTracking;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function forOrder(Order $order, string $title, string $message, string $type): void
    {
        if (! $order->user_id) {
            return;
        }

        Notification::query()->create([
            'user_id' => $order->user_id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'reference_type' => 'order',
            'reference_id' => $order->id,
        ]);
    }

    public function pageData(User $user): array
    {
        return [
            'notifications' => $this->notifications($user),
        ];
    }

    public function detailData(User $user, Notification $notification): array
    {
        abort_unless($notification->user_id === $user->id, 404);

        $this->markAsRead($user, $notification);

        $notification = $notification->fresh();
        $order = $this->referenceOrder($user, $notification);

        return [
            'notification' => $this->mapNotificationDetail($notification, $order),
        ];
    }

    public function markAllAsRead(User $user): void
    {
        Notification::query()
            ->whereBelongsTo($user)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function markAsRead(User $user, Notification $notification): void
    {
        abort_unless($notification->user_id === $user->id, 404);

        if ($notification->is_read) {
            return;
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    private function notifications(User $user): array
    {
        $paginator = Notification::query()
            ->whereBelongsTo($user)
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return [
            'data' => $paginator->through(fn (Notification $notification): array => $this->mapNotification($notification))->items(),
            'meta' => $this->meta($paginator),
        ];
    }

    private function mapNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'time' => $notification->created_at?->diffForHumans() ?? '-',
            'is_read' => $notification->is_read,
        ];
    }

    private function mapNotificationDetail(Notification $notification, ?Order $order): array
    {
        $detailType = $this->resolveDetailType($notification);

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'detail_type' => $detailType,
            'type_label' => $this->typeLabel($detailType),
            'title' => $notification->title,
            'message' => $notification->message,
            'time' => $notification->created_at?->diffForHumans() ?? '-',
            'created_at' => $notification->created_at?->toDateTimeString(),
            'read_at' => $notification->read_at?->toDateTimeString(),
            'is_read' => $notification->is_read,
            'status_badge' => $notification->is_read ? 'Read' : 'Unread',
            'is_important' => in_array($detailType, ['payment', 'shipping'], true),
            'reference_type' => $notification->reference_type,
            'reference_id' => $notification->reference_id,
            'order' => $this->mapOrderSummary($order),
            'payment' => $this->mapPaymentDetail($order?->payment),
            'shipment' => $this->mapShipmentDetail($order?->shipment),
            'timeline' => $this->buildTimeline($notification, $order, $detailType),
            'actions' => $this->buildActions($order),
        ];
    }

    private function referenceOrder(User $user, Notification $notification): ?Order
    {
        if ($notification->reference_type !== 'order' || ! $notification->reference_id) {
            return null;
        }

        return Order::query()
            ->whereBelongsTo($user)
            ->with([
                'address',
                'items',
                'payment.logs',
                'shipment.trackings' => fn ($query) => $query->orderByDesc('happened_at')->orderByDesc('id'),
            ])
            ->find($notification->reference_id);
    }

    private function resolveDetailType(Notification $notification): string
    {
        return match ($notification->type) {
            'payment', 'shipping' => $notification->type,
            'order' => 'order',
            default => 'general',
        };
    }

    private function typeLabel(string $detailType): string
    {
        return match ($detailType) {
            'payment' => 'Payment Notification',
            'shipping' => 'Shipping Notification',
            'order' => 'Order Notification',
            default => 'General Notification',
        };
    }

    private function mapOrderSummary(?Order $order): ?array
    {
        if (! $order) {
            return null;
        }

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
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
            'created_at' => $order->created_at?->toDateTimeString(),
            'paid_at' => $order->paid_at?->toDateTimeString(),
            'completed_at' => $order->completed_at?->toDateTimeString(),
            'expired_at' => $order->expired_at?->toDateTimeString(),
            'cancelled_at' => $order->cancelled_at?->toDateTimeString(),
            'items_count' => $order->items->sum('quantity'),
            'items' => $order->items->map(fn ($item): array => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'product_image_url' => $item->product_image_url,
                'quantity' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
                'color_name' => $item->color_name,
                'size' => $item->size,
            ])->values()->all(),
            'address' => $order->address ? [
                'recipient_name' => $order->address->recipient_name,
                'recipient_phone' => $order->address->recipient_phone,
                'full_address' => $order->address->full_address,
                'city' => $order->address->city,
                'province' => $order->address->province,
                'postal_code' => $order->address->postal_code,
            ] : null,
        ];
    }

    private function mapPaymentDetail(?Payment $payment): ?array
    {
        if (! $payment) {
            return null;
        }

        return [
            'payment_provider' => $payment->payment_provider,
            'payment_method' => $payment->payment_method,
            'transaction_status' => $payment->transaction_status,
            'fraud_status' => $payment->fraud_status,
            'gross_amount' => (float) $payment->gross_amount,
            'currency' => $payment->currency,
            'midtrans_order_id' => $payment->midtrans_order_id,
            'midtrans_transaction_id' => $payment->midtrans_transaction_id,
            'midtrans_redirect_url' => $payment->midtrans_redirect_url,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
            'expired_at' => $payment->expired_at?->toDateTimeString(),
            'logs' => $payment->logs->map(fn ($log): array => [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'transaction_status' => $log->transaction_status,
                'processed_at' => $log->processed_at?->toDateTimeString(),
                'created_at' => $log->created_at?->toDateTimeString(),
            ])->values()->all(),
        ];
    }

    private function mapShipmentDetail(?Shipment $shipment): ?array
    {
        if (! $shipment) {
            return null;
        }

        return [
            'shipping_provider' => $shipment->shipping_provider,
            'courier_company' => $shipment->courier_company,
            'courier_type' => $shipment->courier_type,
            'courier_service_name' => $shipment->courier_service_name,
            'delivery_type' => $shipment->delivery_type,
            'waybill_id' => $shipment->waybill_id,
            'biteship_order_id' => $shipment->biteship_order_id,
            'biteship_tracking_id' => $shipment->biteship_tracking_id,
            'label_url' => $shipment->label_url,
            'shipping_cost' => (float) $shipment->shipping_cost,
            'insurance_cost' => (float) $shipment->insurance_cost,
            'estimated_delivery' => $shipment->estimated_delivery,
            'shipping_status' => $shipment->shipping_status,
            'shipped_at' => $shipment->shipped_at?->toDateTimeString(),
            'delivered_at' => $shipment->delivered_at?->toDateTimeString(),
            'cancelled_at' => $shipment->cancelled_at?->toDateTimeString(),
            'trackings' => $shipment->trackings->map(fn (ShipmentTracking $tracking): array => [
                'id' => $tracking->id,
                'status' => $tracking->status,
                'description' => $tracking->description,
                'location' => $tracking->location,
                'happened_at' => $tracking->happened_at?->toDateTimeString(),
            ])->values()->all(),
        ];
    }

    private function buildTimeline(Notification $notification, ?Order $order, string $detailType): array
    {
        $timeline = collect();

        if ($detailType === 'shipping' && $order?->shipment) {
            $timeline = $timeline->merge(
                $order->shipment->trackings->map(fn (ShipmentTracking $tracking): array => [
                    'id' => 'shipment-tracking-'.$tracking->id,
                    'title' => $this->labelValue($tracking->status),
                    'description' => $tracking->description,
                    'location' => $tracking->location,
                    'happened_at' => $tracking->happened_at?->toDateTimeString(),
                    'is_current' => false,
                ])
            );
        }

        if ($detailType === 'payment' && $order?->payment) {
            $timeline = $timeline->merge(
                $order->payment->logs->map(fn ($log): array => [
                    'id' => 'payment-log-'.$log->id,
                    'title' => $this->labelValue($log->event_type ?: $log->transaction_status ?: 'payment_update'),
                    'description' => $log->transaction_status ? 'Transaction status: '.$this->labelValue($log->transaction_status) : null,
                    'location' => null,
                    'happened_at' => $log->processed_at?->toDateTimeString() ?? $log->created_at?->toDateTimeString(),
                    'is_current' => false,
                ])
            );
        }

        if ($order) {
            $timeline = $timeline->merge($this->orderTimeline($order));
        }

        $timeline = $timeline
            ->push([
                'id' => 'notification-'.$notification->id,
                'title' => $notification->title,
                'description' => $notification->message,
                'location' => null,
                'happened_at' => $notification->created_at?->toDateTimeString(),
                'is_current' => true,
            ])
            ->filter(fn (array $item): bool => filled($item['happened_at']))
            ->sortBy('happened_at')
            ->values();

        $lastIndex = $timeline->keys()->last();

        return $timeline->map(fn (array $item, int $index): array => [
            ...$item,
            'is_current' => $index === $lastIndex,
        ])->all();
    }

    private function orderTimeline(Order $order): Collection
    {
        return collect([
            [
                'id' => 'order-created-'.$order->id,
                'title' => 'Order Created',
                'description' => 'Order '.$order->order_number.' berhasil dibuat.',
                'location' => null,
                'happened_at' => $order->created_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-paid-'.$order->id,
                'title' => 'Payment Received',
                'description' => 'Pembayaran order sudah diterima.',
                'location' => null,
                'happened_at' => $order->paid_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-shipped-'.$order->id,
                'title' => 'Shipment Dispatched',
                'description' => 'Pesanan sedang dalam pengiriman.',
                'location' => null,
                'happened_at' => $order->shipment?->shipped_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-delivered-'.$order->id,
                'title' => 'Delivered',
                'description' => 'Pesanan sudah diterima customer.',
                'location' => null,
                'happened_at' => $order->shipment?->delivered_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-completed-'.$order->id,
                'title' => 'Order Completed',
                'description' => 'Order telah selesai.',
                'location' => null,
                'happened_at' => $order->completed_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-expired-'.$order->id,
                'title' => 'Order Expired',
                'description' => 'Batas waktu pembayaran order berakhir.',
                'location' => null,
                'happened_at' => $order->expired_at?->toDateTimeString(),
                'is_current' => false,
            ],
            [
                'id' => 'order-cancelled-'.$order->id,
                'title' => 'Order Cancelled',
                'description' => 'Order dibatalkan.',
                'location' => null,
                'happened_at' => $order->cancelled_at?->toDateTimeString(),
                'is_current' => false,
            ],
        ])->filter(fn (array $item): bool => filled($item['happened_at']));
    }

    private function buildActions(?Order $order): array
    {
        return [
            'back_url' => '/notifications',
            'order_url' => $order ? '/my-order/'.$order->id : null,
            'payment_url' => $order?->payment?->midtrans_redirect_url,
            'track_url' => $order?->shipment?->label_url,
        ];
    }

    private function labelValue(?string $value): string
    {
        if (! $value) {
            return '-';
        }

        return str($value)
            ->replace(['-', '_'], ' ')
            ->title()
            ->value();
    }

    private function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
