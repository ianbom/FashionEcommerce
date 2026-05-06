<?php

namespace App\Actions\Payments;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class SyncExpiredMidtransPaymentsAction
{
    public function __construct(private readonly SyncMidtransPaymentAction $syncPayment) {}

    public function execute(): array
    {
        $stats = ['checked' => 0, 'synced' => 0, 'failed' => 0];

        Payment::query()
            ->with('order')
            ->whereIn('transaction_status', ['pending', 'authorize'])
            ->where('expires_at', '<=', now())
            ->whereHas('order', fn ($query) => $query->whereIn('payment_status', [PaymentStatus::Pending->value, PaymentStatus::ManualReview->value]))
            ->orderBy('id')
            ->chunkById(50, function ($payments) use (&$stats): void {
                foreach ($payments as $payment) {
                    $stats['checked']++;

                    try {
                        $this->syncPayment->execute($payment, 'scheduled_expiry_sync');
                        $stats['synced']++;
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
}
