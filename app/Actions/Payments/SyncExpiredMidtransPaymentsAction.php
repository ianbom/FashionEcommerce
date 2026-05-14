<?php

namespace App\Actions\Payments;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncExpiredMidtransPaymentsAction
{
    public function __construct(private readonly ApplyMidtransPaymentStatusAction $applyStatus) {}

    public function execute(): array
    {
        $stats = [
            'checked' => 0,
            'expired' => 0,
            'skipped_midtrans_owned' => $this->midtransOwnedExpiredPaymentsCount(),
            'synced' => 0,
            'failed' => 0,
        ];

        Payment::query()
            ->with('order')
            ->whereIn('transaction_status', ['pending', 'authorize'])
            ->whereNull('midtrans_transaction_id')
            ->whereNull('payment_method')
            ->where('expires_at', '<=', now())
            ->whereHas('order', fn ($query) => $query->whereIn('payment_status', [PaymentStatus::Pending->value, PaymentStatus::ManualReview->value]))
            ->orderBy('id')
            ->chunkById(50, function ($payments) use (&$stats): void {
                foreach ($payments as $payment) {
                    $stats['checked']++;

                    try {
                        DB::transaction(function () use ($payment): void {
                            $payment = Payment::query()
                                ->with('order')
                                ->whereKey($payment->id)
                                ->lockForUpdate()
                                ->firstOrFail();

                            if (! $payment->order || $payment->order->payment_status === PaymentStatus::Paid->value) {
                                return;
                            }

                            $expiredAt = now();
                            $payment->logs()->create([
                                'order_id' => $payment->order_id,
                                'provider' => $payment->payment_provider,
                                'event_type' => 'local_expiry',
                                'transaction_status' => 'expire',
                                'payload' => [
                                    'payment_id' => $payment->id,
                                    'expires_at' => $payment->expires_at?->toIso8601String(),
                                    'expired_at' => $expiredAt->toIso8601String(),
                                    'source' => 'payments:sync-expired-midtrans',
                                ],
                                'processed_at' => $expiredAt,
                            ]);

                            $payment->update([
                                'transaction_status' => 'expire',
                                'expired_at' => $payment->expired_at ?? $expiredAt,
                                'last_synced_at' => $expiredAt,
                            ]);

                            $this->applyStatus->execute($payment, 'expire');
                        });

                        $stats['expired']++;
                    } catch (\Throwable $exception) {
                        $stats['failed']++;
                        Log::warning('midtrans_expiry_sync_failed', [
                            'payment_id' => $payment->id,
                            'message' => $exception->getMessage(),
                        ]);
                    }
                }
            });

        return $stats;
    }

    private function midtransOwnedExpiredPaymentsCount(): int
    {
        return Payment::query()
            ->whereIn('transaction_status', ['pending', 'authorize'])
            ->where(fn ($query) => $query
                ->whereNotNull('midtrans_transaction_id')
                ->orWhereNotNull('payment_method'))
            ->where('expires_at', '<=', now())
            ->whereHas('order', fn ($query) => $query->whereIn('payment_status', [PaymentStatus::Pending->value, PaymentStatus::ManualReview->value]))
            ->count();
    }
}
