<?php

namespace App\Actions\Payments;

use App\Models\Payment;
use App\Services\Integrations\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SyncMidtransPaymentAction
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly ApplyMidtransPaymentStatusAction $applyStatus,
    ) {}

    public function execute(Payment $payment, string $eventType = 'admin_sync'): void
    {
        $payload = $this->midtrans->transactionStatus((string) $payment->midtrans_order_id);

        foreach (['order_id', 'transaction_status', 'gross_amount', 'status_code'] as $field) {
            if (blank($payload[$field] ?? null)) {
                throw ValidationException::withMessages(['payment' => "Response Midtrans tidak memiliki {$field}."]);
            }
        }

        DB::transaction(function () use ($payment, $payload, $eventType): void {
            $payment = Payment::query()->with('order')->whereKey($payment->id)->lockForUpdate()->firstOrFail();

            if ((string) $payload['order_id'] !== (string) $payment->midtrans_order_id) {
                $this->logRejected($payment, $payload, 'rejected_reference_mismatch');

                throw ValidationException::withMessages(['payment' => 'Order ID Midtrans tidak cocok dengan payment lokal.']);
            }

            if (! $this->midtrans->amountMatches($payload['gross_amount'], $payment)) {
                $this->logRejected($payment, $payload, 'rejected_amount_mismatch');

                throw ValidationException::withMessages(['payment' => 'Nominal Midtrans tidak cocok dengan payment lokal.']);
            }

            $payment->logs()->create([
                'order_id' => $payment->order_id,
                'provider' => $payment->payment_provider,
                'event_type' => $eventType,
                'transaction_status' => $payload['transaction_status'],
                'payload_hash' => hash('sha256', json_encode([$eventType, now()->toISOString(), $payload], JSON_THROW_ON_ERROR)),
                'payload' => $payload,
                'processed_at' => now(),
            ]);

            $payment->update([
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                'payment_method' => $payload['payment_type'] ?? $payment->payment_method,
                'transaction_status' => $payload['transaction_status'],
                'fraud_status' => $payload['fraud_status'] ?? $payment->fraud_status,
                'last_synced_at' => now(),
                'raw_response' => $payload,
            ]);

            $this->applyStatus->execute($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null);
        });
    }

    private function logRejected(Payment $payment, array $payload, string $eventType): void
    {
        $payment->logs()->create([
            'order_id' => $payment->order_id,
            'provider' => $payment->payment_provider,
            'event_type' => $eventType,
            'transaction_status' => $payload['transaction_status'] ?? null,
            'payload_hash' => hash('sha256', json_encode([$eventType, $payment->id, now()->toISOString(), $payload], JSON_THROW_ON_ERROR)),
            'payload' => $payload,
            'processed_at' => now(),
        ]);
    }
}
