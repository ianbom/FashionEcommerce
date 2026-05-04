<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentManagementService
{
    use ResolvesAdminPagination;

    public function __construct(private readonly NotificationService $notifications) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'transaction_status' => $request->string('transaction_status')->toString(),
            'payment_method' => $request->string('payment_method')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
            'amount_min' => $request->string('amount_min')->toString(),
            'amount_max' => $request->string('amount_max')->toString(),
        ];

        return [
            'payments' => Payment::query()
                ->with('order:id,order_number,customer_name,customer_email')
                ->when($filters['transaction_status'] !== '', fn ($query) => $query->where('transaction_status', $filters['transaction_status']))
                ->when($filters['payment_method'] !== '', fn ($query) => $query->where('payment_method', $filters['payment_method']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->when($filters['amount_min'] !== '', fn ($query) => $query->where('gross_amount', '>=', $filters['amount_min']))
                ->when($filters['amount_max'] !== '', fn ($query) => $query->where('gross_amount', '<=', $filters['amount_max']))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Payment $payment): array => $this->row($payment)),
            'filters' => $filters,
            'statuses' => ['pending', 'settlement', 'capture', 'expire', 'cancel', 'deny', 'failure'],
            'stats' => [
                'total' => Payment::query()->count(),
                'settled' => Payment::query()->whereIn('transaction_status', ['settlement', 'capture', 'paid', 'success'])->count(),
                'pending' => Payment::query()->whereIn('transaction_status', ['pending', 'authorize'])->count(),
                'challenge' => Payment::query()->where('fraud_status', 'challenge')->count(),
                'failed' => Payment::query()->whereIn('transaction_status', ['deny', 'cancel', 'expire', 'expired', 'failure', 'failed'])->count(),
                'manual_review' => Payment::query()->whereIn('fraud_status', ['challenge', 'deny'])->count(),
            ],
        ];
    }

    public function detailData(Payment $payment): array
    {
        $payment->load(['order:id,order_number,customer_name,customer_email,payment_status,order_status,paid_at', 'logs' => fn ($query) => $query->latest()]);

        return [
            'payment' => [
                ...$this->row($payment),
                'payment_provider' => $payment->payment_provider,
                'midtrans_snap_token' => $payment->midtrans_snap_token,
                'midtrans_redirect_url' => $payment->midtrans_redirect_url,
                'currency' => $payment->currency,
                'raw_response' => $payment->raw_response,
                'order' => $payment->order,
                'logs' => $payment->logs->map(fn ($log): array => [
                    'id' => $log->id,
                    'event_type' => $log->event_type,
                    'transaction_status' => $log->transaction_status,
                    'processed_at' => $log->processed_at?->toDateTimeString(),
                    'payload' => $log->payload,
                ]),
            ],
        ];
    }

    public function sync(Payment $payment): void
    {
        DB::transaction(function () use ($payment): void {
            $payment->refresh()->load('order.items');
            $status = $payment->transaction_status ?: 'pending';

            $payment->logs()->create([
                'order_id' => $payment->order_id,
                'provider' => $payment->payment_provider,
                'event_type' => 'manual_sync',
                'transaction_status' => $status,
                'payload' => ['source' => 'admin_manual_sync', 'status' => $status, 'synced_at' => now()->toDateTimeString()],
                'processed_at' => now(),
            ]);

            if (in_array($status, ['settlement', 'capture'], true)) {
                $this->markOrderPaid($payment->order, $payment);
            }

            if (in_array($status, ['expire', 'cancel', 'deny', 'failure'], true)) {
                $this->markOrderFailed($payment->order, $status);
            }
        });
    }

    public function row(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'order_id' => $payment->order_id,
            'order_number' => $payment->order?->order_number,
            'customer' => $payment->order?->customer_name,
            'midtrans_order_id' => $payment->midtrans_order_id,
            'midtrans_transaction_id' => $payment->midtrans_transaction_id,
            'payment_method' => $payment->payment_method,
            'gross_amount' => $payment->gross_amount,
            'transaction_status' => $payment->transaction_status,
            'fraud_status' => $payment->fraud_status,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
            'expired_at' => $payment->expired_at?->toDateTimeString(),
            'created_at' => $payment->created_at?->toFormattedDateString(),
        ];
    }

    private function markOrderPaid(Order $order, Payment $payment): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->first();

            if (! $variant) {
                continue;
            }

            $before = $variant->stock;
            $after = max(0, $before - $item->quantity);
            $variant->update([
                'stock' => $after,
                'reserved_stock' => max(0, $variant->reserved_stock - $item->quantity),
            ]);
            $variant->stockLogs()->create([
                'type' => 'order',
                'quantity' => -$item->quantity,
                'stock_before' => $before,
                'stock_after' => $after,
                'reference_type' => 'order',
                'reference_id' => $order->id,
                'note' => "Stock reduced after payment {$payment->midtrans_order_id}.",
            ]);
        }

        $order->update([
            'payment_status' => 'paid',
            'order_status' => 'paid',
            'paid_at' => $payment->paid_at ?? now(),
        ]);

        $payment->update(['paid_at' => $payment->paid_at ?? now()]);
        $this->notifications->forOrder($order, 'Payment received', "Payment untuk order {$order->order_number} berhasil diterima.", 'payment');
    }

    private function markOrderFailed(Order $order, string $status): void
    {
        if ($order->payment_status === 'paid') {
            return;
        }

        $order->update([
            'payment_status' => match ($status) {
                'expire' => 'expired',
                'cancel' => 'cancelled',
                default => 'failed',
            },
            'order_status' => $status === 'expire' ? 'expired' : 'cancelled',
            'expired_at' => $status === 'expire' ? now() : $order->expired_at,
            'cancelled_at' => $status !== 'expire' ? now() : $order->cancelled_at,
        ]);
        $this->notifications->forOrder($order, 'Payment updated', "Payment untuk order {$order->order_number} berstatus {$status}.", 'payment');
    }
}
