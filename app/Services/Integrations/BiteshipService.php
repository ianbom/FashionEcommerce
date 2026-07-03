<?php

namespace App\Services\Integrations;

use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class BiteshipService
{
    public function __construct(private readonly SiteSettingService $settings) {}

    public function areaSearch(string $search): array
    {
        $response = $this->client()
            ->get('/v1/maps/areas', [
                'countries' => 'ID',
                'input' => $search,
                'type' => 'single',
            ]);

        if (! $response->successful()) {
            throw ValidationException::withMessages(['search' => 'Gagal mencari area Biteship.']);
        }

        return collect($response->json('areas', []))
            ->map(fn (array $area): array => [
                'id' => $area['id'] ?? null,
                'name' => $area['name'] ?? null,
                'administrative_division_level_1_name' => $area['administrative_division_level_1_name'] ?? null,
                'administrative_division_level_2_name' => $area['administrative_division_level_2_name'] ?? null,
                'administrative_division_level_3_name' => $area['administrative_division_level_3_name'] ?? null,
                'administrative_division_level_4_name' => $area['administrative_division_level_4_name'] ?? null,
                'postal_code' => $area['postal_code'] ?? null,
                'latitude' => $area['latitude'] ?? null,
                'longitude' => $area['longitude'] ?? null,
            ])
            ->filter(fn (array $area): bool => filled($area['id']))
            ->values()
            ->all();
    }

    public function shippingRates(array $destination, array $items): array
    {
        $originPostalCode = $this->settings->get('store_postal_code');
        $originAreaId = $this->settings->get('origin_biteship_area_id', config('services.biteship.origin_area_id'));
        $originLatitude = $this->coordinate($this->settings->get('store_latitude'));
        $originLongitude = $this->coordinate($this->settings->get('store_longitude'));
        $destinationPostalCode = $destination['postal_code'] ?? null;
        $destinationAreaId = $destination['biteship_area_id'] ?? $destination['area_id'] ?? null;
        $destinationLatitude = $this->coordinate($destination['latitude'] ?? null);
        $destinationLongitude = $this->coordinate($destination['longitude'] ?? null);

        if (! filled($originPostalCode)) {
            throw ValidationException::withMessages(['shipping' => 'Store postal code belum dikonfigurasi.']);
        }

        if (! filled($destinationPostalCode)) {
            throw ValidationException::withMessages(['shipping' => 'Postal code tujuan belum dikonfigurasi.']);
        }

        if (! filled($originAreaId)) {
            throw ValidationException::withMessages(['shipping' => 'Origin Biteship area ID wajib dikonfigurasi.']);
        }

        if (! filled($destinationAreaId)) {
            throw ValidationException::withMessages(['shipping' => 'Destination Biteship area ID wajib dikonfigurasi.']);
        }

        if ($originLatitude === null || $originLongitude === null) {
            throw ValidationException::withMessages(['shipping' => 'Koordinat toko belum dikonfigurasi.']);
        }

        if ($destinationLatitude === null || $destinationLongitude === null) {
            throw ValidationException::withMessages(['shipping' => 'Koordinat tujuan belum dikonfigurasi.']);
        }

        $couriers = $this->settings->get('shipping_couriers', 'jne,jnt,sicepat,anteraja');
        $response = $this->client()
            ->post('/v1/rates/couriers', array_filter([
                'origin_postal_code' => $originPostalCode,
                'origin_area_id' => $originAreaId,
                'origin_latitude' => $originLatitude,
                'origin_longitude' => $originLongitude,
                'destination_postal_code' => $destinationPostalCode,
                'destination_area_id' => $destinationAreaId,
                'destination_latitude' => $destinationLatitude,
                'destination_longitude' => $destinationLongitude,
                'couriers' => $couriers,
                'items' => $items,
            ], fn ($value): bool => filled($value) || is_array($value) || $value === 0));

        if (! $response->successful()) {
            throw ValidationException::withMessages(['shipping' => $response->json('error') ?? 'Gagal mengambil ongkir Biteship.']);
        }

        return collect($response->json('pricing', []))
            ->map(function (array $rate): array {
                $payload = [
                    'courier_company' => $rate['courier_company'] ?? $rate['company'] ?? $rate['courier_code'] ?? null,
                    'courier_type' => $rate['courier_type'] ?? $rate['type'] ?? $rate['courier_service_code'] ?? null,
                    'courier_service_name' => $rate['courier_service_name'] ?? null,
                    'description' => $rate['description'] ?? null,
                    'duration' => $rate['duration'] ?? null,
                    'price' => (float) ($rate['price'] ?? $rate['shipping_fee'] ?? 0),
                    'raw' => $rate,
                ];

                return [
                    ...$payload,
                    'id' => sha1(json_encode($payload, JSON_THROW_ON_ERROR)),
                ];
            })
            ->filter(fn (array $rate): bool => filled($rate['courier_company']) && filled($rate['courier_type']) && $rate['price'] >= 0)
            ->values()
            ->all();
    }

    public function createOrder(array $payload): array
    {
        $response = $this->client()
            ->post('/v1/orders', $payload);

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'shipment' => $response->json('error') ?? $response->json('message') ?? 'Gagal membuat order Biteship.',
            ]);
        }

        return $response->json();
    }

    public function retrieveOrder(string $biteshipOrderId): array
    {
        $response = $this->client()
            ->get("/v1/orders/{$biteshipOrderId}");

        if (! $response->successful()) {
            throw ValidationException::withMessages([
                'shipment' => $response->json('error') ?? $response->json('message') ?? 'Gagal mengambil order Biteship.',
            ]);
        }

        return $response->json();
    }

    public function orderIdentifiers(array $response): array
    {
        return [
            'biteship_order_id' => Arr::get($response, 'id'),
            'biteship_tracking_id' => Arr::get($response, 'courier.tracking_id'),
            'waybill_id' => Arr::get($response, 'courier.waybill_id'),
            'shipping_status' => Arr::get($response, 'status'),
        ];
    }

    private function client(): PendingRequest
    {
        $apiKey = config('services.biteship.api_key') ?: env('BITESHIP_API_KEY');

        if (! filled($apiKey)) {
            throw ValidationException::withMessages(['biteship' => 'BITESHIP_API_KEY belum dikonfigurasi.']);
        }

        return Http::baseUrl('https://api.biteship.com')
            ->connectTimeout(5)
            ->timeout(15)
            ->retry(2, 500, throw: false)
            ->acceptJson()
            ->withToken($apiKey);
    }

    private function coordinate(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }
}
