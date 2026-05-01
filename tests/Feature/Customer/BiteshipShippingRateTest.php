<?php

use App\Services\Integrations\BiteshipService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Support\Facades\Http;

test('shipping rates use store and destination postal codes', function () {
    config(['services.biteship.api_key' => 'test-key']);
    $settings = new class extends SiteSettingService
    {
        public function get(string $key, ?string $default = null): ?string
        {
            return $key === 'store_postal_code' ? '60111' : $default;
        }

        public function first(array $keys, ?string $default = null): ?string
        {
            return $default;
        }
    };

    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response([
            'pricing' => [
                [
                    'company' => 'jne',
                    'courier_name' => 'JNE',
                    'courier_code' => 'jne',
                    'courier_service_name' => 'Reguler',
                    'courier_service_code' => 'reg',
                    'description' => 'Layanan reguler',
                    'duration' => '2 - 3 days',
                    'shipping_fee' => 16000,
                    'type' => 'reg',
                ],
            ],
        ]),
    ]);

    $rates = (new BiteshipService($settings))->shippingRates('40123', [
        [
            'name' => 'Khimar',
            'description' => 'SKU-1',
            'value' => 150000,
            'quantity' => 1,
            'weight' => 500,
        ],
    ]);

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
        && $request['origin_postal_code'] === '60111'
        && $request['destination_postal_code'] === '40123'
        && ! isset($request['origin_area_id'], $request['destination_area_id']));

    expect($rates)->toHaveCount(1)
        ->and($rates[0]['courier_company'])->toBe('jne')
        ->and($rates[0]['courier_type'])->toBe('reg')
        ->and($rates[0]['courier_service_name'])->toBe('Reguler')
        ->and($rates[0]['price'])->toBe(16000.0);
});
