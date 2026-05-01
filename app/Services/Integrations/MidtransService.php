<?php

namespace App\Services\Integrations;

use App\Models\Order;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class MidtransService
{
    public function __construct(private readonly SiteSettingService $settings) {}

    public function createSnapTransaction(Order $order): array
    {
        $order->load(['items', 'address']);

        $response = $this->client()->post('/snap/v1/transactions', [
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
                'duration' => (int) ($this->settings->first(['payment_expiry_duration'], '1440') ?: 1440),
            ],
        ]);

        if (! $response->successful()) {
            throw ValidationException::withMessages(['payment' => $response->json('error_messages.0') ?? 'Gagal membuat transaksi Midtrans.']);
        }

        return $response->json();
    }

    public function notificationIsValid(array $payload): bool
    {
        $signature = $payload['signature_key'] ?? null;
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';

        return filled($signature)
            && hash_equals((string) $signature, hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey()));
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

        return $items->all();
    }

    private function client(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl())
            ->timeout(20)
            ->acceptJson()
            ->withBasicAuth($this->serverKey(), '');
    }

    private function baseUrl(): string
    {
        $environment = $this->settings->first(['midtrans_environment', 'payment_midtrans_env'], 'sandbox');

        return $environment === 'production'
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    private function serverKey(): string
    {
        $serverKey = config('services.midtrans.server_key') ?: env('MIDTRANS_SERVER_KEY');

        if (! filled($serverKey)) {
            throw ValidationException::withMessages(['midtrans' => 'MIDTRANS_SERVER_KEY belum dikonfigurasi.']);
        }

        return $serverKey;
    }
}
