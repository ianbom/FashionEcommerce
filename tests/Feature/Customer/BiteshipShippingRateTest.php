<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Integrations\BiteshipService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

test('shipping rates require and send area ids with coordinates', function () {
    config(['services.biteship.api_key' => 'test-key']);
    $settings = new class extends SiteSettingService
    {
        public function get(string $key, ?string $default = null): ?string
        {
            return match ($key) {
                'store_postal_code' => '60111',
                'store_latitude' => '-7.2575',
                'store_longitude' => '112.7521',
                'origin_biteship_area_id' => 'IDNP11IDNC434IDND5442IDZ60111',
                default => $default,
            };
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

    $rates = (new BiteshipService($settings))->shippingRates(
        [
            'postal_code' => '40123',
            'biteship_area_id' => 'IDNP11IDNC123IDND456IDZ40123',
            'latitude' => '-6.9175',
            'longitude' => '107.6191',
        ],
        [
            [
                'name' => 'Khimar',
                'description' => 'SKU-1',
                'value' => 150000,
                'quantity' => 1,
                'weight' => 500,
            ],
        ],
    );

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
        && $request['origin_postal_code'] === '60111'
        && $request['origin_area_id'] === 'IDNP11IDNC434IDND5442IDZ60111'
        && $request['origin_latitude'] === -7.2575
        && $request['origin_longitude'] === 112.7521
        && $request['destination_postal_code'] === '40123'
        && $request['destination_area_id'] === 'IDNP11IDNC123IDND456IDZ40123'
        && $request['destination_latitude'] === -6.9175
        && $request['destination_longitude'] === 107.6191);

    expect($rates)->toHaveCount(1)
        ->and($rates[0]['courier_company'])->toBe('jne')
        ->and($rates[0]['courier_type'])->toBe('reg')
        ->and($rates[0]['courier_service_name'])->toBe('Reguler')
        ->and($rates[0]['price'])->toBe(16000.0);
});

test('shipping rates reject missing destination area id before Biteship request', function () {
    config(['services.biteship.api_key' => 'test-key']);
    $settings = new class extends SiteSettingService
    {
        public function get(string $key, ?string $default = null): ?string
        {
            return match ($key) {
                'store_postal_code' => '60111',
                'store_latitude' => '-7.2575',
                'store_longitude' => '112.7521',
                'origin_biteship_area_id' => 'IDNP11IDNC434IDND5442IDZ60111',
                default => $default,
            };
        }
    };

    Http::fake();

    expect(fn () => (new BiteshipService($settings))->shippingRates(
        [
            'postal_code' => '60111',
            'latitude' => '-7.2883581',
            'longitude' => '112.8094750',
        ],
        [
            [
                'name' => 'Khimar',
                'description' => 'SKU-1',
                'value' => 150000,
                'quantity' => 1,
                'weight' => 500,
            ],
        ],
    ))->toThrow(ValidationException::class, 'Destination Biteship area ID wajib dikonfigurasi.');

    Http::assertNothingSent();
});

test('shipping rates reject missing origin area id before Biteship request', function () {
    config(['services.biteship.api_key' => 'test-key']);
    config(['services.biteship.origin_area_id' => null]);
    $settings = new class extends SiteSettingService
    {
        public function get(string $key, ?string $default = null): ?string
        {
            return match ($key) {
                'store_postal_code' => '60111',
                'store_latitude' => '-7.2575',
                'store_longitude' => '112.7521',
                default => $default,
            };
        }
    };

    Http::fake();

    expect(fn () => (new BiteshipService($settings))->shippingRates(
        [
            'postal_code' => '60111',
            'latitude' => '-7.2883581',
            'longitude' => '112.8094750',
            'biteship_area_id' => 'IDNP11IDNC434IDND5442IDZ60111',
        ],
        [
            [
                'name' => 'Khimar',
                'description' => 'SKU-1',
                'value' => 150000,
                'quantity' => 1,
                'weight' => 500,
            ],
        ],
    ))->toThrow(ValidationException::class, 'Origin Biteship area ID wajib dikonfigurasi.');

    Http::assertNothingSent();
});

test('checkout shipping rates send product dimensions to Biteship', function () {
    config(['services.biteship.api_key' => 'test-key']);

    foreach ([
        'store_postal_code' => '60111',
        'store_latitude' => '-7.2871053',
        'store_longitude' => '112.8026283',
        'origin_biteship_area_id' => 'IDNP11IDNC434IDND5442IDZ60111',
        'shipping_couriers' => 'paxel',
    ] as $key => $value) {
        SiteSetting::query()->create(['key' => $key, 'value' => $value]);
    }

    $user = User::factory()->create();
    $address = CustomerAddress::query()->create([
        'user_id' => $user->id,
        'recipient_name' => 'Customer',
        'recipient_phone' => '081234567890',
        'province' => 'Jawa Timur',
        'city' => 'Surabaya',
        'district' => 'Sukolilo',
        'subdistrict' => 'Keputih',
        'postal_code' => '60111',
        'biteship_area_id' => 'IDNP11IDNC434IDND5442IDZ60111',
        'latitude' => '-7.2883581',
        'longitude' => '112.8094750',
        'full_address' => 'Jl Spr A 17',
    ]);
    $product = Product::query()->create([
        'name' => 'Shayda Azka Set',
        'slug' => 'shayda-azka-set',
        'sku' => 'SHAYDA-1',
        'base_price' => 499000,
        'weight' => 860,
        'length' => 36,
        'width' => 28,
        'height' => 8,
        'status' => 'published',
    ]);
    $variant = ProductVariant::query()->create([
        'product_id' => $product->id,
        'sku' => 'SHAYDA-1-BLK',
        'stock' => 10,
        'is_active' => true,
    ]);
    $cart = Cart::query()->create(['user_id' => $user->id]);
    CartItem::query()->create([
        'cart_id' => $cart->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'quantity' => 1,
        'price_snapshot' => 499000,
    ]);

    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => []]),
    ]);

    $this->actingAs($user)
        ->postJson(route('checkout.shipping-rates'), ['customer_address_id' => $address->id])
        ->assertOk();

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
        && $request['items'][0]['weight'] === 860
        && $request['items'][0]['length'] === 36
        && $request['items'][0]['width'] === 28
        && $request['items'][0]['height'] === 8);
});
