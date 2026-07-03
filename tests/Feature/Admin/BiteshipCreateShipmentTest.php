<?php

use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function createPaidOrderForBiteship(?string $latitude = '-7.2883581', ?string $longitude = '112.8094750', ?string $areaId = 'IDNP11IDNC434IDND5442IDZ60111'): Order
{
    $user = User::factory()->create();

    $order = Order::query()->create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-1',
        'customer_name' => 'Customer',
        'customer_email' => 'customer@example.com',
        'customer_phone' => '081234567890',
        'subtotal' => 150000,
        'shipping_cost' => 20600,
        'grand_total' => 170600,
        'payment_status' => 'paid',
        'order_status' => 'paid',
        'shipping_status' => 'not_created',
    ]);

    $order->address()->create([
        'recipient_name' => 'Customer',
        'recipient_phone' => '081234567890',
        'province' => 'Jawa Timur',
        'city' => 'Surabaya',
        'district' => 'Mulyorejo',
        'subdistrict' => 'Kejawan Putih Tambak',
        'postal_code' => '60111',
        'biteship_area_id' => $areaId,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'full_address' => 'Jl Spr A 17',
    ]);

    $order->items()->create([
        'product_name' => 'Khimar',
        'product_sku' => 'KH-1',
        'variant_sku' => 'KH-1-BLK',
        'price' => 150000,
        'quantity' => 1,
        'subtotal' => 150000,
        'weight' => 500,
        'length' => 10,
        'width' => 10,
        'height' => 5,
    ]);

    $order->shipment()->create([
        'shipping_provider' => 'biteship',
        'courier_company' => 'anteraja',
        'courier_type' => 'same_day',
        'courier_service_name' => 'Same Day',
        'shipping_cost' => 20600,
        'shipping_status' => 'failed',
        'raw_rate_response' => [
            'available_collection_method' => ['pickup'],
        ],
    ]);

    return $order->refresh();
}

function createAdminUserForBiteship(): User
{
    return User::factory()
        ->create()
        ->forceFill(['role' => 'admin', 'is_active' => true]);
}

function createBiteshipSettings(?string $latitude = '-7.2871053', ?string $longitude = '112.8026283', ?string $areaId = 'IDNP11IDNC434IDND5442IDZ60111'): void
{
    foreach ([
        'store_name' => 'Aurea Syari',
        'store_email' => 'hello@example.com',
        'store_phone' => '081234567890',
        'store_address' => 'Jl. Pahlawan No. 88',
        'store_postal_code' => '60111',
        'store_latitude' => $latitude,
        'store_longitude' => $longitude,
        'origin_biteship_area_id' => $areaId,
        'origin_address' => 'Jl. Pahlawan No. 88',
    ] as $key => $value) {
        SiteSetting::query()->create(['key' => $key, 'value' => $value]);
    }
}

test('admin create shipment sends create order coordinates in Biteship order shape', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();

    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response([
            'pricing' => [
                [
                    'courier_company' => 'anteraja',
                    'courier_type' => 'same_day',
                    'courier_service_name' => 'Same Day',
                    'description' => 'Same day service for Surabaya Area',
                    'duration' => '8 - 12 hours',
                    'price' => 20600,
                    'available_collection_method' => ['pickup'],
                ],
            ],
        ]),
        'api.biteship.com/v1/orders' => Http::response([
            'id' => 'bt-order-1',
            'status' => 'confirmed',
            'courier' => [
                'tracking_id' => 'track-1',
                'waybill_id' => 'waybill-1',
                'link' => 'https://example.com/label.pdf',
            ],
        ]),
    ]);

    $this->actingAs(createAdminUserForBiteship())
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'anteraja',
            'courier_type' => 'same_day',
            'courier_service_name' => 'Same Day',
        ])
        ->assertRedirect();

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/orders'
        && $request['origin_coordinate'] === ['latitude' => -7.2871053, 'longitude' => 112.8026283]
        && $request['destination_coordinate'] === ['latitude' => -7.2883581, 'longitude' => 112.809475]
        && $request['items'][0]['weight'] === 500
        && $request['items'][0]['length'] === 10
        && $request['items'][0]['width'] === 10
        && $request['items'][0]['height'] === 5
        && $request['origin_collection_method'] === 'pickup'
        && ! isset($request['origin_latitude'], $request['origin_longitude'], $request['destination_latitude'], $request['destination_longitude']));
    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
        && $request['items'][0]['weight'] === 500
        && $request['items'][0]['length'] === 10
        && $request['items'][0]['width'] === 10
        && $request['items'][0]['height'] === 5);
});

test('admin create shipment rejects stale same day rate before Biteship order request', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();

    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response([
            'pricing' => [
                [
                    'courier_company' => 'jne',
                    'courier_type' => 'reg',
                    'courier_service_name' => 'Reguler',
                    'duration' => '2 - 3 days',
                    'price' => 16000,
                ],
            ],
        ]),
        'api.biteship.com/v1/orders' => Http::response(['id' => 'should-not-run']),
    ]);

    $this->actingAs(createAdminUserForBiteship())
        ->from(route('admin.shipments.show', $order->shipment))
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'anteraja',
            'courier_type' => 'same_day',
            'courier_service_name' => 'Same Day',
        ])
        ->assertRedirect(route('admin.shipments.show', $order->shipment))
        ->assertSessionHasErrors(['shipment' => 'Kurir tidak tersedia untuk alamat ini. Pilih ulang ongkir atau gunakan kurir lain.']);

    Http::assertNotSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/orders');

    expect($order->shipment->refresh()->shipping_status)->toBe('failed')
        ->and($order->shipment->failed_reason)->toBe('Kurir tidak tersedia untuk alamat ini. Pilih ulang ongkir atau gunakan kurir lain.');
});

test('admin create shipment rejects stale paxel package rate when dimensions do not match', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();
    $order->update(['shipping_cost' => 34500]);
    $order->items()->firstOrFail()->update([
        'product_name' => 'Shayda Azka Set',
        'price' => 499000,
        'subtotal' => 499000,
        'weight' => 860,
        'length' => 36,
        'width' => 28,
        'height' => 8,
    ]);
    $order->shipment->update([
        'courier_company' => 'paxel',
        'courier_type' => 'medium',
        'courier_service_name' => 'Medium Package',
        'shipping_cost' => 34500,
        'raw_rate_response' => [
            'company' => 'paxel',
            'type' => 'medium',
            'courier_service_name' => 'Medium Package',
            'description' => 'Medium (30 x 20 x 12 cm) Package Shipment',
            'price' => 34500,
            'available_collection_method' => ['pickup'],
        ],
    ]);

    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response([
            'pricing' => [
                [
                    'courier_company' => 'paxel',
                    'courier_type' => 'large',
                    'courier_service_name' => 'Large Package',
                    'duration' => '8 - 12 hours',
                    'price' => 45000,
                ],
            ],
        ]),
        'api.biteship.com/v1/orders' => Http::response(['id' => 'should-not-run']),
    ]);

    $this->actingAs(createAdminUserForBiteship())
        ->from(route('admin.shipments.show', $order->shipment))
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'paxel',
            'courier_type' => 'medium',
            'courier_service_name' => 'Medium Package',
        ])
        ->assertRedirect(route('admin.shipments.show', $order->shipment))
        ->assertSessionHasErrors(['shipment' => 'Paket tidak sesuai dengan layanan Paxel yang dipilih. Pilih ulang ongkir.']);

    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/rates/couriers'
        && $request['items'][0]['weight'] === 860
        && $request['items'][0]['length'] === 36
        && $request['items'][0]['width'] === 28
        && $request['items'][0]['height'] === 8);
    Http::assertNotSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/orders');

    expect($order->shipment->refresh()->shipping_status)->toBe('failed')
        ->and($order->shipment->failed_reason)->toBe('Paket tidak sesuai dengan layanan Paxel yang dipilih. Pilih ulang ongkir.');
});

test('admin create shipment validates coordinates before same day Biteship order', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship(latitude: null, longitude: null);

    Http::fake();

    $this->actingAs(createAdminUserForBiteship())
        ->from(route('admin.shipments.show', $order->shipment))
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'anteraja',
            'courier_type' => 'same_day',
            'courier_service_name' => 'Same Day',
        ])
        ->assertRedirect(route('admin.shipments.show', $order->shipment))
        ->assertSessionHasErrors(['shipment' => 'Area ID dan koordinat origin/destination wajib untuk membuat pengiriman Biteship.']);

    Http::assertNothingSent();
});

test('admin create shipment requires destination area id before Biteship request', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship(areaId: null);

    Http::fake();

    $this->actingAs(createAdminUserForBiteship())
        ->from(route('admin.shipments.show', $order->shipment))
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'anteraja',
            'courier_type' => 'same_day',
            'courier_service_name' => 'Same Day',
        ])
        ->assertRedirect(route('admin.shipments.show', $order->shipment))
        ->assertSessionHasErrors(['shipment' => 'Area ID dan koordinat origin/destination wajib untuk membuat pengiriman Biteship.']);

    Http::assertNothingSent();
});

test('admin create shipment requires origin area id before Biteship request', function () {
    config(['services.biteship.api_key' => 'test-key']);
    config(['services.biteship.origin_area_id' => null]);
    createBiteshipSettings(areaId: null);
    $order = createPaidOrderForBiteship();

    Http::fake();

    $this->actingAs(createAdminUserForBiteship())
        ->from(route('admin.shipments.show', $order->shipment))
        ->post(route('admin.orders.shipments.store', $order), [
            'courier_company' => 'anteraja',
            'courier_type' => 'same_day',
            'courier_service_name' => 'Same Day',
        ])
        ->assertRedirect(route('admin.shipments.show', $order->shipment))
        ->assertSessionHasErrors(['shipment' => 'Area ID dan koordinat origin/destination wajib untuk membuat pengiriman Biteship.']);

    Http::assertNothingSent();
});
