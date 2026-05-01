<?php

namespace App\Services\Customer;

use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Services\Integrations\MidtransService;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MidtransWebhookService
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly NotificationService $notifications,
    ) {}

    public function handle(array $payload): void
    {
        if (! $this->midtrans->notificationIsValid($payload)) {
            throw new HttpException(403, 'Invalid Midtrans signature.');
        }

        DB::transaction(function () use ($payload): void {
            $payment = Payment::query()
                ->where('midtrans_order_id', $payload['order_id'] ?? null)
                ->lockForUpdate()
                ->firstOrFail();

            $payment->logs()->create([
                'order_id' => $payment->order_id,
                'provider' => 'midtrans',
                'event_type' => $payload['transaction_status'] ?? 'notification',
                'transaction_status' => $payload['transaction_status'] ?? null,
                'payload' => $payload,
                'processed_at' => now(),
            ]);

            $payment->update([
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                'payment_method' => $payload['payment_type'] ?? $payment->payment_method,
                'transaction_status' => $payload['transaction_status'] ?? $payment->transaction_status,
                'fraud_status' => $payload['fraud_status'] ?? $payment->fraud_status,
                'raw_response' => $payload,
            ]);

            $order = Order::query()
                ->with(['items', 'voucher'])
                ->whereKey($payment->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $status = (string) ($payload['transaction_status'] ?? '');
            if (in_array($status, ['settlement', 'capture'], true)) {
                $this->markPaid($order, $payment);
            }

            if (in_array($status, ['expire', 'cancel', 'deny', 'failure'], true)) {
                $this->markFailed($order, $status);
            }
        });
    }

    private function markPaid(Order $order, Payment $payment): void
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
            $after = max(0, $variant->stock - $item->quantity);
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
            'paid_at' => now(),
        ]);
        $payment->update(['paid_at' => now()]);
        $order->voucher?->increment('used_count');
        $this->notifications->forOrder($order, 'Payment received', "Payment untuk order {$order->order_number} berhasil diterima.", 'payment');
    }

    private function markFailed(Order $order, string $status): void
    {
        if ($order->payment_status === 'paid' || in_array($order->payment_status, ['expired', 'failed', 'cancelled'], true)) {
            return;
        }

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $variant = ProductVariant::query()
                ->whereKey($item->product_variant_id)
                ->lockForUpdate()
                ->first();

            $variant?->update([
                'reserved_stock' => max(0, $variant->reserved_stock - $item->quantity),
            ]);
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
