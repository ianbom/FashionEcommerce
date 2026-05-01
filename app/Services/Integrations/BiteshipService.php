<?php

namespace App\Services\Integrations;

use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Client\PendingRequest;
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

    public function shippingRates(string $destinationPostalCode, array $items): array
    {
        $originPostalCode = $this->settings->get('store_postal_code');

        if (! filled($originPostalCode)) {
            throw ValidationException::withMessages(['shipping' => 'Store postal code belum dikonfigurasi.']);
        }

        if (! filled($destinationPostalCode)) {
            throw ValidationException::withMessages(['shipping' => 'Postal code tujuan belum dikonfigurasi.']);
        }

        $couriers = $this->settings->first(['enabled_couriers', 'shipping_couriers'], 'jne,jnt,sicepat,anteraja');
        $response = $this->client()
            ->post('/v1/rates/couriers', [
                'origin_postal_code' => $originPostalCode,
                'destination_postal_code' => $destinationPostalCode,
                'couriers' => $couriers,
                'items' => $items,
            ]);

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

    private function client(): PendingRequest
    {
        $apiKey = config('services.biteship.api_key') ?: env('BITESHIP_API_KEY');

        if (! filled($apiKey)) {
            throw ValidationException::withMessages(['biteship' => 'BITESHIP_API_KEY belum dikonfigurasi.']);
        }

        return Http::baseUrl('https://api.biteship.com')
            ->timeout(15)
            ->acceptJson()
            ->withToken($apiKey);
    }
}
