<?php

namespace App\Services\Integrations;

use App\Enums\MidtransPaymentMethod;
use App\Models\Order;
use App\Models\Payment;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class MidtransService
{
    public function __construct(private readonly SiteSettingService $settings) {}

    public function createSnapTransaction(Order $order): array
    {
        $this->assertConfigured();
        $order->load(['items', 'address', 'payment']);

        $request = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) round((float) $order->grand_total),
            ],
            'customer_details' => [
                'first_name' => $order->customer_name,
                'email' => $order->customer_email,
                'phone' => $order->customer_phone,
                'shipping_address' => [
                    'first_name' => $order->address?->recipient_name,
                    'phone' => $order->address?->recipient_phone,
                    'address' => $order->address?->full_address,
                    'city' => $order->address?->city,
                    'postal_code' => $order->address?->postal_code,
                    'country_code' => 'IDN',
                ],
            ],
            'item_details' => $this->itemDetails($order),
            'expiry' => [
                'unit' => 'minutes',
                'duration' => $this->expiryMinutes(),
                'start_time' => $order->created_at->format('Y-m-d H:i:s O'),
            ],
            'callbacks' => [
                'finish' => route('order.detail', $order),
            ],
        ];
        if ($order->payment?->requested_payment_method !== null) {
            $method = MidtransPaymentMethod::tryFrom($order->payment->requested_payment_method);
            if (! $method) {
                throw ValidationException::withMessages(['payment' => 'Pilihan metode pembayaran tersimpan tidak valid.']);
            }
            $request['enabled_payments'] = [$method->value];
        }
        $response = $this->snapClient()->post('/snap/v1/transactions', $request);

        $payload = $response->json();
        $errors = is_array($payload) ? ($payload['error_messages'] ?? null) : null;
        if (in_array($response->status(), [400, 401, 403, 422], true) && is_array($errors) && array_is_list($errors) && count($errors) > 0
            && ! isset($payload['token']) && ! isset($payload['redirect_url']) && ! isset($payload['transaction_status'])
            && collect($errors)->every(fn ($error) => is_string($error) && trim($error) !== '')
            && ! preg_match('/duplicate|order.*(taken|exist|used|registered)/i', implode(' ', $errors))) {
            return ['state' => 'rejected'];
        }

        if (! $response->successful() || ! is_array($payload) || ! empty($errors)
            || ! is_string($payload['token'] ?? null) || ! preg_match('/^[a-zA-Z0-9_-]{1,255}$/D', $payload['token'])
            || ! $this->validRedirectUrl($payload['redirect_url'] ?? null)) {
            throw new RuntimeException('Snap creation is unconfirmed.');
        }

        return ['state' => 'ready', 'token' => $payload['token'], 'redirect_url' => $payload['redirect_url']];
    }

    public function assertConfigured(): void
    {
        $this->serverKey();
        $this->environment();
        $this->expiryMinutes();
    }

    public function expiryMinutes(): int
    {
        $value = $this->settings->first(['payment_expiry_duration'], '1440');
        if (! ctype_digit((string) $value) || (int) $value < 1 || (int) $value > 10080) {
            throw ValidationException::withMessages(['payment' => 'Durasi pembayaran Midtrans tidak valid.']);
        }

        return (int) $value;
    }

    public function environment(): string
    {
        $value = config('services.midtrans.environment', 'sandbox');
        if (! in_array($value, ['sandbox', 'production'], true)) {
            throw ValidationException::withMessages(['payment' => 'Environment Midtrans tidak valid.']);
        }

        return $value;
    }

    public function validRedirectUrl(mixed $url): bool
    {
        return is_string($url) && filter_var($url, FILTER_VALIDATE_URL)
            && parse_url($url, PHP_URL_SCHEME) === 'https'
            && parse_url($url, PHP_URL_HOST) === parse_url($this->snapBaseUrl(), PHP_URL_HOST)
            && ! parse_url($url, PHP_URL_USER) && ! parse_url($url, PHP_URL_PASS)
            && in_array(parse_url($url, PHP_URL_PORT), [null, 443], true);
    }

    public function cancelSnapSession(string $token): void
    {
        if (! preg_match('/^[a-zA-Z0-9_-]{1,255}$/D', $token)) {
            throw ValidationException::withMessages(['payment' => 'Identitas sesi Snap tidak valid.']);
        }
        $response = Http::timeout(20)->acceptJson()->withHeaders(['Authorization' => $this->serverKey()])->withBody('', 'application/json')
            ->post($this->snapBaseUrl().'/snap/v1/transactions/'.rawurlencode($token).'/cancel');
        $cancelledAt = $response->json('canceled_at');
        $alreadyCancelled = $response->json('error_messages') === ['token already canceled'];
        if (($response->successful() && empty($response->json('error_messages')) && is_string($cancelledAt)
            && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/D', $cancelledAt) && strtotime($cancelledAt) !== false)
            || (in_array($response->status(), [200, 400, 409], true) && $alreadyCancelled)) {
            return;
        }

        throw ValidationException::withMessages(['payment' => 'Pembatalan sesi Snap belum terkonfirmasi; reservasi dipertahankan.']);
    }

    public function transactionStatus(string $midtransOrderId): array
    {
        return $this->findTransactionStatus($midtransOrderId)
            ?? throw ValidationException::withMessages(['payment' => 'Transaksi provider belum ditemukan; reservasi dipertahankan.']);
    }

    public function findTransactionStatus(string $midtransOrderId): ?array
    {
        if (trim($midtransOrderId) === '') {
            throw ValidationException::withMessages(['payment' => 'Referensi provider tidak tersedia.']);
        }
        $response = $this->apiClient()->get('/v2/'.rawurlencode($midtransOrderId).'/status');

        if (in_array($response->status(), [200, 404], true) && (string) $response->json('status_code') === '404'
            && $response->json('transaction_status') === null && $response->json('gross_amount') === null) {
            return null;
        }

        if (! $response->successful()) {
            throw ValidationException::withMessages(['payment' => 'Status provider belum dapat dipastikan.']);
        }

        $payload = $response->json();
        if (! is_array($payload) || ! isset($payload['order_id'], $payload['transaction_status'], $payload['gross_amount'], $payload['status_code'])) {
            throw ValidationException::withMessages(['payment' => 'Response status provider tidak valid.']);
        }
        foreach (['order_id', 'transaction_status', 'gross_amount', 'status_code'] as $field) {
            if (! is_scalar($payload[$field]) || blank($payload[$field])) {
                throw ValidationException::withMessages(['payment' => 'Response status provider tidak valid.']);
            }
        }
        if (! in_array((string) $payload['status_code'], ['200', '201', '202'], true)) {
            throw ValidationException::withMessages(['payment' => 'Status provider belum dapat dipastikan.']);
        }

        return $payload;
    }

    public function cancelTransaction(string $midtransOrderId): array
    {
        $response = $this->apiClient()->withBody('', 'application/json')->post('/v2/'.rawurlencode($midtransOrderId).'/cancel');

        $payload = $response->json();
        if (! $response->successful() || ! is_array($payload)
            || ! is_scalar($payload['status_code'] ?? null) || (string) $payload['status_code'] !== '200'
            || ($payload['transaction_status'] ?? null) !== 'cancel'
            || ($payload['order_id'] ?? null) !== $midtransOrderId
            || ! is_scalar($payload['gross_amount'] ?? null) || ! is_numeric($payload['gross_amount'])) {
            Log::warning('midtrans_cancel_failed', [
                'order_id' => $midtransOrderId,
                'status' => $response->status(),
                'provider_status_code' => is_array($payload) && is_scalar($payload['status_code'] ?? null)
                    && preg_match('/^\d{3}$/D', (string) $payload['status_code']) ? (string) $payload['status_code'] : null,
            ]);

            throw ValidationException::withMessages([
                'payment' => 'Pembatalan provider belum dapat dipastikan.',
            ]);
        }

        return $payload;
    }

    public function notificationIsValid(array $payload): bool
    {
        return $this->validateNotificationSignature($payload);
    }

    public function validatePaymentPayload(array $payload): void
    {
        foreach (['fraud_status', 'transaction_id', 'payment_type'] as $field) {
            if (isset($payload[$field]) && ! is_string($payload[$field])) {
                throw ValidationException::withMessages(['payment' => 'Metadata pembayaran Midtrans tidak valid.']);
            }
        }
        if (in_array($payload['transaction_status'] ?? null, ['settlement', 'capture'], true)
            && ((string) ($payload['status_code'] ?? '') !== '200'
                || (isset($payload['fraud_status']) && ! in_array($payload['fraud_status'], ['accept', 'challenge', 'deny'], true))
                || (($payload['transaction_status'] ?? null) === 'settlement' && isset($payload['fraud_status']) && $payload['fraud_status'] !== 'accept'))) {
            throw ValidationException::withMessages(['payment' => 'Response Midtrans belum membuktikan pembayaran berhasil.']);
        }
    }

    public function validateNotificationSignature(array $payload): bool
    {
        foreach (['signature_key', 'order_id', 'status_code', 'gross_amount'] as $field) {
            if (! is_scalar($payload[$field] ?? null)) {
                return false;
            }
        }
        $signature = $payload['signature_key'] ?? null;
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';

        return filled($signature)
            && hash_equals((string) $signature, hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey()));
    }

    public function amountMatches(mixed $payloadAmount, Payment $payment): bool
    {
        if (! is_scalar($payloadAmount) || ! is_numeric($payloadAmount) || ! is_finite((float) $payloadAmount)
            || (float) $payloadAmount < 0 || (float) $payloadAmount > 9999999999999.99) {
            return false;
        }

        return $this->minorUnits($payloadAmount) === $this->minorUnits($payment->gross_amount);
    }

    private function minorUnits(string|float|int $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    private function itemDetails(Order $order): array
    {
        $items = $order->items->map(fn ($item): array => [
            'id' => (string) ($item->variant_sku ?? $item->product_sku ?? $item->id),
            'price' => (int) round((float) $item->price),
            'quantity' => $item->quantity,
            'name' => mb_substr($item->product_name, 0, 50),
        ])->values();

        if ((float) $order->shipping_cost > 0) {
            $items->push(['id' => 'shipping', 'price' => (int) round((float) $order->shipping_cost), 'quantity' => 1, 'name' => 'Shipping']);
        }

        if ((float) $order->service_fee > 0) {
            $items->push(['id' => 'service_fee', 'price' => (int) round((float) $order->service_fee), 'quantity' => 1, 'name' => 'Service fee']);
        }

        if ((float) $order->discount_amount > 0) {
            $items->push(['id' => 'discount', 'price' => -1 * (int) round((float) $order->discount_amount), 'quantity' => 1, 'name' => 'Discount']);
        }

        $adjustment = (int) round((float) $order->grand_total) - $items->sum(fn (array $item): int => $item['price'] * $item['quantity']);
        if ($adjustment !== 0) {
            $items->push(['id' => 'rounding_adjustment', 'price' => $adjustment, 'quantity' => 1, 'name' => 'Penyesuaian pembulatan']);
        }

        return $items->all();
    }

    private function snapClient(): PendingRequest
    {
        return $this->client($this->snapBaseUrl());
    }

    private function apiClient(): PendingRequest
    {
        return $this->client($this->apiBaseUrl());
    }

    private function client(string $baseUrl): PendingRequest
    {
        return Http::baseUrl($baseUrl)
            ->timeout(20)
            ->acceptJson()
            ->withBasicAuth($this->serverKey(), '');
    }

    private function snapBaseUrl(): string
    {
        $environment = $this->environment();

        return $environment === 'production'
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    private function apiBaseUrl(): string
    {
        $environment = $this->environment();

        return $environment === 'production'
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }

    private function serverKey(): string
    {
        $serverKey = config('services.midtrans.server_key');

        if (! filled($serverKey)) {
            throw ValidationException::withMessages(['midtrans' => 'MIDTRANS_SERVER_KEY belum dikonfigurasi.']);
        }

        return $serverKey;
    }
}
