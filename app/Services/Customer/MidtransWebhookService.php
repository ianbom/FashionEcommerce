<?php

namespace App\Services\Customer;

use App\Actions\Payments\ApplyMidtransPaymentStatusAction;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Integrations\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class MidtransWebhookService
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly ApplyMidtransPaymentStatusAction $applyStatus,
    ) {}

    public function handle(array $payload): void
    {
        foreach (['order_id', 'status_code', 'gross_amount', 'signature_key', 'transaction_status'] as $field) {
            if (! is_scalar($payload[$field] ?? null) || blank($payload[$field])) {
                throw new HttpException(422, "Missing Midtrans field {$field}.");
            }
        }
        if (! in_array((string) $payload['status_code'], ['200', '201', '202'], true)) {
            throw new HttpException(422, 'Unconfirmed Midtrans status code.');
        }

        if (! $this->midtrans->validateNotificationSignature($payload)) {
            throw new HttpException(403, 'Invalid Midtrans signature.');
        }
        $this->midtrans->validatePaymentPayload($payload);

        DB::transaction(function () use ($payload): void {
            $payloadHash = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
            $storedPayload = $payload;
            unset($storedPayload['signature_key']);
            $candidate = Payment::query()->where('payment_provider', 'midtrans')->where('midtrans_order_id', $payload['order_id'])->firstOrFail();
            $order = Order::query()->whereKey($candidate->order_id)->lockForUpdate()->firstOrFail();
            $payment = Payment::query()->whereKey($candidate->id)->lockForUpdate()->firstOrFail();
            $payment->setRelation('order', $order);

            if ($payment->logs()->where('payload_hash', $payloadHash)->exists()) {
                Log::info('duplicate_webhook_ignored', ['provider' => 'midtrans', 'payment_id' => $payment->id]);

                return;
            }

            if (! $this->midtrans->amountMatches($payload['gross_amount'], $payment)) {
                $payment->logs()->create([
                    'order_id' => $payment->order_id,
                    'provider' => 'midtrans',
                    'event_type' => 'rejected_amount_mismatch',
                    'transaction_status' => $payload['transaction_status'],
                    'payload_hash' => $payloadHash,
                    'payload' => $storedPayload,
                    'processed_at' => now(),
                ]);
                Log::warning('amount_mismatch', ['payment_id' => $payment->id, 'payload_amount' => $payload['gross_amount'], 'payment_amount' => $payment->gross_amount]);

                return;
            }

            $payment->logs()->create([
                'order_id' => $payment->order_id,
                'provider' => 'midtrans',
                'event_type' => $payload['transaction_status'],
                'transaction_status' => $payload['transaction_status'],
                'payload_hash' => $payloadHash,
                'payload' => $storedPayload,
                'processed_at' => now(),
            ]);

            if (! $this->applyStatus->accepts($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null)) {
                return;
            }

            if ($order->payment_status === 'paid' && in_array($payload['transaction_status'], ['settlement', 'capture'], true)) {
                $this->applyStatus->execute($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null);

                return;
            }

            $payment->update([
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                'payment_method' => $payload['payment_type'] ?? $payment->payment_method,
                'transaction_status' => $payload['transaction_status'],
                'fraud_status' => $payload['fraud_status'] ?? $payment->fraud_status,
                'raw_response' => $storedPayload,
            ]);

            $this->applyStatus->execute($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null);
        });
    }
}
