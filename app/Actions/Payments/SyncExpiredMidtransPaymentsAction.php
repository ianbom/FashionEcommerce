<?php

namespace App\Actions\Payments;

use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class SyncExpiredMidtransPaymentsAction
{
    public function __construct(private readonly SyncMidtransPaymentAction $syncPayment) {}

    public function execute(): array
    {
        $stats = ['checked' => 0, 'expired' => 0, 'skipped_midtrans_owned' => 0, 'synced' => 0, 'failed' => 0];
        Payment::query()->where('payment_provider', 'midtrans')
            ->whereIn('transaction_status', ['pending', 'authorize', 'manual_review'])
            ->where(function ($query): void {
                $query->where('expires_at', '<=', now())
                    ->orWhere('raw_response->snap_creation_uncertain', true)
                    ->orWhere(fn ($query) => $query->where('raw_response->snap_creation_state', 'creating')->where('raw_response->snap_creation_started_at', '<=', now()->subMinute()->toISOString()));
            })
            ->whereHas('order', fn ($query) => $query->whereIn('payment_status', ['pending', 'manual_review']))
            ->chunkById(50, function ($payments) use (&$stats): void {
                foreach ($payments as $payment) {
                    $stats['checked']++;
                    try {
                        $this->syncPayment->execute($payment, 'scheduled_sync');
                        $stats['synced']++;
                        if ($payment->refresh()->transaction_status === 'expire') {
                            $stats['expired']++;
                        }
                    } catch (\Throwable $exception) {
                        $stats['failed']++;
                        Log::warning('midtrans_reconciliation_unresolved', ['payment_id' => $payment->id, 'error_type' => $exception::class]);
                    }
                }
            });

        return $stats;
    }
}
