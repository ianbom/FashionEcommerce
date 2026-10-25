<?php

namespace App\Actions\Payments;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Integrations\MidtransService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Client\ConnectionException;
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
        if ($payment->payment_provider !== 'midtrans') {
            throw ValidationException::withMessages(['payment' => 'Sinkronisasi hanya tersedia untuk payment Midtrans.']);
        }
        try {
            $payload = $this->midtrans->findTransactionStatus((string) $payment->midtrans_order_id);
        } catch (ConnectionException $exception) {
            throw ValidationException::withMessages(['payment' => 'Status Midtrans belum dapat dipastikan. Reservasi dipertahankan.']);
        }

        if ($payload === null) {
            $payment->refresh();
            if ($payment->midtrans_snap_token && $payment->expires_at?->isPast()) {
                $this->cancel($payment, true);

                return;
            }
            if ($payment->midtrans_snap_token) {
                return;
            }
            DB::transaction(function () use ($payment): void {
                $order = Order::query()->whereKey($payment->order_id)->lockForUpdate()->firstOrFail();
                $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
                $startedAt = data_get($payment->raw_response, 'snap_creation_started_at');
                if ($order->payment_status === 'pending' && is_string($startedAt) && CarbonImmutable::parse($startedAt)->lte(now()->subMinute())) {
                    $payment->update(['raw_response' => array_replace($payment->raw_response ?? [], ['snap_creation_state' => 'uncertain', 'snap_creation_uncertain' => true]),
                        'failure_reason' => 'Pembuatan pembayaran belum terkonfirmasi. Rekonsiliasi diperlukan; reservasi dipertahankan.']);
                }
            });

            throw ValidationException::withMessages(['payment' => 'Transaksi provider belum ditemukan; reservasi dipertahankan.']);
        }

        $this->applyPayload($payment, $payload, $eventType);
    }

    public function cancel(Payment $payment, bool $expired = false): void
    {
        $payment->refresh()->load('order');
        if ($payment->payment_provider !== 'midtrans') {
            throw ValidationException::withMessages(['payment' => 'Pembatalan provider hanya tersedia untuk Midtrans.']);
        }
        if (! in_array($payment->order->payment_status, ['pending', 'manual_review'], true)) {
            return;
        }
        try {
            $payload = $this->midtrans->findTransactionStatus((string) $payment->midtrans_order_id);
            if ($payload === null) {
                if (! $payment->midtrans_snap_token) {
                    throw ValidationException::withMessages(['payment' => 'Identitas sesi Snap belum tersedia; reservasi dipertahankan.']);
                }
                $this->midtrans->cancelSnapSession($payment->midtrans_snap_token);
                $payload = $this->midtrans->findTransactionStatus((string) $payment->midtrans_order_id);
                if ($payload === null) {
                    $payload = ['order_id' => $payment->midtrans_order_id, 'gross_amount' => $payment->gross_amount,
                        'status_code' => '200', 'transaction_status' => $expired ? 'expire' : 'cancel', 'snap_session_cancelled' => true];
                }
            }
            if (in_array($payload['transaction_status'] ?? null, ['pending', 'authorize'], true)) {
                if (($payload['order_id'] ?? null) !== $payment->midtrans_order_id || ! $this->midtrans->amountMatches($payload['gross_amount'] ?? null, $payment)) {
                    $this->applyPayload($payment, $payload, 'customer_cancel');

                    return;
                }
                $payload = $this->midtrans->cancelTransaction((string) $payment->midtrans_order_id);
            }
            $this->applyPayload($payment, $payload, $expired ? 'scheduled_expiry' : 'customer_cancel');
        } catch (ConnectionException $exception) {
            throw ValidationException::withMessages(['payment' => 'Pembatalan Midtrans belum dapat dipastikan. Reservasi dipertahankan.']);
        }
    }

    public function applyPayload(Payment $payment, array $payload, string $eventType = 'admin_sync'): void
    {
        foreach (['order_id', 'transaction_status', 'gross_amount', 'status_code'] as $field) {
            if (! is_scalar($payload[$field] ?? null) || blank($payload[$field])) {
                throw ValidationException::withMessages(['payment' => "Response Midtrans tidak memiliki {$field}."]);
            }
        }
        if (! in_array((string) $payload['status_code'], ['200', '201', '202'], true)) {
            throw ValidationException::withMessages(['payment' => 'Response provider belum membuktikan status transaksi.']);
        }
        $this->midtrans->validatePaymentPayload($payload);

        $rejection = DB::transaction(function () use ($payment, $payload, $eventType): ?string {
            $order = Order::query()->whereKey($payment->order_id)->lockForUpdate()->firstOrFail();
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            if ($payment->payment_provider !== 'midtrans') {
                throw ValidationException::withMessages(['payment' => 'Sinkronisasi hanya tersedia untuk payment Midtrans.']);
            }
            $payment->setRelation('order', $order);

            if ((string) $payload['order_id'] !== (string) $payment->midtrans_order_id) {
                $this->logRejected($payment, $payload, 'rejected_reference_mismatch');

                return 'Order ID Midtrans tidak cocok dengan payment lokal.';
            }

            if (! $this->midtrans->amountMatches($payload['gross_amount'], $payment)) {
                $this->logRejected($payment, $payload, 'rejected_amount_mismatch');

                return 'Nominal Midtrans tidak cocok dengan payment lokal.';
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

            if (! $this->applyStatus->accepts($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null)) {
                return null;
            }

            if ($order->payment_status === 'paid' && in_array($payload['transaction_status'], ['settlement', 'capture'], true)) {
                $this->applyStatus->execute($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null);

                return null;
            }

            $payment->update([
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                'payment_method' => $payload['payment_type'] ?? $payment->payment_method,
                'transaction_status' => $payload['transaction_status'],
                'fraud_status' => $payload['fraud_status'] ?? $payment->fraud_status,
                'last_synced_at' => now(),
                'raw_response' => $payload,
            ]);

            $this->applyStatus->execute($payment, (string) $payload['transaction_status'], $payload['fraud_status'] ?? null);

            return null;
        });

        if ($rejection !== null) {
            throw ValidationException::withMessages(['payment' => $rejection]);
        }
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
