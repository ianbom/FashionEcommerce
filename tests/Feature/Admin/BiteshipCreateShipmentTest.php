<?php

use App\Models\AdminActivityLog;
use App\Models\BiteshipWebhookLog;
use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Admin\OrderManagementService;
use App\Services\Admin\ShipmentManagementService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

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

test('immediate booking status preserves fulfillment snapshots and first timestamps', function (string $status, string $expectedOrder, string $timestamp) {
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day', 'price' => 20600]]]),
        'api.biteship.com/v1/orders' => Http::response(['id' => 'immediate-booking', 'status' => $status]),
    ]);
    $this->actingAs(createAdminUserForBiteship())->post(route('admin.orders.shipments.store', $order), ['courier_company' => 'anteraja', 'courier_type' => 'same_day'])->assertSessionHasNoErrors();
    $shipment = $order->refresh()->shipment;
    expect($order->order_status)->toBe($expectedOrder)
        ->and($order->shipping_status)->toBe($shipment->shipping_status)
        ->and($shipment->{$timestamp})->not->toBeNull();
    $first = $shipment->{$timestamp}->toISOString();
    $this->travel(5)->minutes();
    app(ShipmentManagementService::class)->applyBiteshipPayload($shipment, ['status' => $status]);
    expect($shipment->refresh()->{$timestamp}->toISOString())->toBe($first);
})->with([
    ['picked', 'shipped', 'shipped_at'],
    ['delivered', 'delivered', 'delivered_at'],
    ['cancelled', 'shipment_problem', 'cancelled_at'],
]);

test('uncertain booking never sends a second create request', function (int $status, array $body) {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day', 'price' => 20600]]]),
        'api.biteship.com/v1/orders' => Http::response($body, $status),
    ]);
    $admin = createAdminUserForBiteship();
    $payload = ['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day'];
    $this->actingAs($admin)->post(route('admin.orders.shipments.store', $order), $payload)->assertSessionHasErrors('shipment');
    $this->post(route('admin.orders.shipments.store', $order), $payload)->assertSessionHasErrors('shipment');
    expect($order->shipment->refresh()->shipping_status)->toBe('creating')
        ->and(data_get($order->shipment->raw_order_response, 'booking_creation_uncertain'))->toBeTrue();
    expect(Http::recorded(fn ($request) => $request->method() === 'POST' && $request->url() === 'https://api.biteship.com/v1/orders'))->toHaveCount(1);
})->with([[503, ['error' => 'Unavailable']], [200, ['success' => true]], [200, ['id' => 'wrong-booking', 'reference_id' => 'OTHER']]]);

test('uncertain create response cannot overwrite a concurrently confirmed shipment', function () {
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day', 'price' => 20600]]]),
        'api.biteship.com/v1/orders' => function () use ($order) {
            $order->shipment->update(['biteship_order_id' => 'reconciled-booking', 'shipping_status' => 'confirmed']);
            app(ShipmentManagementService::class)->applyBiteshipPayload($order->shipment, ['status' => 'delivered', 'courier' => ['link' => 'https://tracking.test/confirmed']]);

            throw new ConnectionException('Simulated timeout after callback');
        },
    ]);
    $this->actingAs(createAdminUserForBiteship())->post(route('admin.orders.shipments.store', $order), ['courier_company' => 'anteraja', 'courier_type' => 'same_day'])->assertSessionHasErrors('shipment');
    expect($order->shipment->refresh()->shipping_status)->toBe('delivered')
        ->and($order->shipment->biteship_order_id)->toBe('reconciled-booking')
        ->and(data_get($order->shipment->raw_order_response, 'courier.link'))->toBe('https://tracking.test/confirmed')
        ->and($order->refresh()->shipping_status)->toBe('delivered');
});

test('booking result preserves concurrent financial state and saves provider identity', function () {
    config(['services.biteship.api_key' => 'test-key']);
    createBiteshipSettings();
    $order = createPaidOrderForBiteship();
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day', 'price' => 20600]]]),
        'api.biteship.com/v1/orders' => function () use ($order) {
            $order->update(['payment_status' => 'refunded', 'order_status' => 'refunded']);

            return Http::response(['id' => 'remote-booking', 'status' => 'confirmed']);
        },
    ]);
    $this->actingAs(createAdminUserForBiteship())->post(route('admin.orders.shipments.store', $order), ['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day'])->assertSessionHasNoErrors();
    expect($order->refresh()->payment_status)->toBe('refunded')->and($order->order_status)->toBe('refunded')
        ->and($order->shipment->biteship_order_id)->toBe('remote-booking')->and($order->shipment->failed_reason)->not->toBeNull();
    $this->assertDatabaseCount('notifications', 0);
});

test('pending receipts replay once after booking identifiers become available', function () {
    $order = createPaidOrderForBiteship();
    $receipt = BiteshipWebhookLog::query()->create([
        'biteship_order_id' => 'early-booking', 'payload_hash' => hash('sha256', 'early'),
        'payload' => ['order_id' => 'early-booking', 'status' => 'delivered', 'courier' => ['link' => 'https://tracking.test/first']],
    ]);
    $service = app(ShipmentManagementService::class);
    expect($service->processWebhook($receipt))->toBeFalse()->and($receipt->refresh()->processed_at)->toBeNull();
    $order->shipment->update(['biteship_order_id' => 'early-booking', 'shipping_status' => 'confirmed']);
    expect($service->replayWebhooks($order->shipment))->toMatchArray(['processed' => 1, 'failed' => 0]);
    $deliveredAt = $order->shipment->refresh()->delivered_at->toISOString();
    expect($service->processWebhook($receipt))->toBeTrue();
    $service->applyBiteshipPayload($order->shipment, ['id' => 'early-booking', 'status' => 'delivered', 'courier' => ['link' => 'https://tracking.test/replaced']]);
    expect(data_get($order->shipment->refresh()->raw_order_response, 'courier.link'))->toBe('https://tracking.test/first')
        ->and($order->shipment->delivered_at->toISOString())->toBe($deliveredAt);
    $service->applyBiteshipPayload($order->shipment, ['id' => 'early-booking', 'status' => 'allocated']);
    expect($order->refresh()->shipping_status)->toBe('delivered')->and($order->shipment->trackings()->count())->toBe(1);
    $this->assertDatabaseCount('notifications', 1);
});

test('receipt and shipment changes roll back atomically when receipt persistence fails', function () {
    $order = createPaidOrderForBiteship();
    $order->shipment->update(['biteship_order_id' => 'atomic-booking', 'shipping_status' => 'confirmed']);
    $receipt = BiteshipWebhookLog::query()->create(['biteship_order_id' => 'atomic-booking', 'payload_hash' => hash('sha256', 'atomic'), 'payload' => ['status' => 'delivered']]);
    $event = 'eloquent.updating: '.BiteshipWebhookLog::class;
    Event::listen($event, fn () => throw new RuntimeException('Simulated persistence failure'));
    try {
        expect(fn () => app(ShipmentManagementService::class)->processWebhook($receipt))->toThrow(RuntimeException::class);
    } finally {
        Event::forget($event);
    }
    expect($receipt->refresh()->processed_at)->toBeNull()->and($order->shipment->refresh()->shipping_status)->toBe('confirmed');
    $this->assertDatabaseCount('shipment_trackings', 0);
    $this->assertDatabaseCount('notifications', 0);
});

test('return flow and terminal issues cannot resume normal fulfillment', function (string $terminal) {
    $order = createPaidOrderForBiteship();
    $shipment = $order->shipment;
    $shipment->update(['biteship_order_id' => 'return-booking', 'shipping_status' => 'in_transit']);
    $service = app(ShipmentManagementService::class);
    $service->applyBiteshipPayload($shipment, ['status' => 'return_in_transit']);
    expect(data_get($shipment->refresh()->raw_order_response, 'return_started'))->toBeTrue();
    $service->applyBiteshipPayload($shipment, ['status' => 'delivered']);
    expect($shipment->refresh()->shipping_status)->toBe('problem');
    $service->applyBiteshipPayload($shipment, ['status' => $terminal]);
    expect($service->shippingIssue($shipment->refresh())['is_terminal'])->toBeTrue();
    $count = $shipment->trackings()->count();
    $service->applyBiteshipPayload($shipment, ['status' => 'confirmed']);
    expect($shipment->trackings()->count())->toBe($count)
        ->and($order->refresh()->payment_status)->toBe('paid')
        ->and($order->stock_released_at)->toBeNull();
})->with(['lost', 'returned', 'disposed']);

test('terminal fulfillment requires a reason and records the responsible actor', function () {
    $admin = createAdminUserForBiteship();
    $this->actingAs($admin);
    $order = createPaidOrderForBiteship();
    $order->update(['shipping_status' => 'lost', 'order_status' => 'lost']);
    $order->shipment->update(['biteship_order_id' => 'lost-booking', 'shipping_status' => 'lost']);
    $service = app(OrderManagementService::class);
    expect(fn () => $service->updateStatus($order, 'shipment_failed', '  '))->toThrow(ValidationException::class);
    $service->updateStatus($order, 'shipment_failed', 'Kurir mengonfirmasi paket hilang');
    $log = AdminActivityLog::query()->where('action', 'admin_order_failure')->firstOrFail();
    expect($log->user_id)->toBe($admin->id)
        ->and($log->new_values['reason'])->toBe('Kurir mengonfirmasi paket hilang')
        ->and($order->refresh()->order_status)->toBe('shipment_failed')
        ->and($order->payment_status)->toBe('paid');
});

test('unpaid or unbooked shipments cannot receive manual delivery updates', function (bool $paid) {
    $order = createPaidOrderForBiteship();
    $order->update(['payment_status' => $paid ? 'paid' : 'pending']);
    $shipment = $order->shipment;
    $shipment->update(['shipping_status' => 'in_transit', 'biteship_order_id' => $paid ? null : 'unpaid-booking']);
    expect(fn () => app(ShipmentManagementService::class)->updateStatus($shipment, new Request(['shipping_status' => 'delivered', 'description' => 'Manual delivery'])))->toThrow(ValidationException::class);
    expect($shipment->refresh()->shipping_status)->toBe('in_transit');
    $this->assertDatabaseCount('shipment_trackings', 0);
})->with([true, false]);

test('generic admin cancellation cannot leak stock reservation', function () {
    $order = createPaidOrderForBiteship();
    $order->update(['payment_status' => 'pending', 'order_status' => 'pending_payment']);
    expect(fn () => app(OrderManagementService::class)->updateStatus($order, 'cancelled'))->toThrow(ValidationException::class);
    expect($order->refresh()->order_status)->toBe('pending_payment');
});

test('completion requires paid and both delivered snapshots', function () {
    $this->actingAs(createAdminUserForBiteship());
    $order = createPaidOrderForBiteship();
    $order->update(['order_status' => 'delivered', 'shipping_status' => 'delivered']);
    $service = app(OrderManagementService::class);
    expect(fn () => $service->updateStatus($order, 'completed'))->toThrow(ValidationException::class);
    $order->shipment->update(['shipping_status' => 'delivered']);
    $service->updateStatus($order, 'completed');
    $completed = $order->refresh()->completed_at->toISOString();
    $service->updateStatus($order, 'completed');
    expect($order->refresh()->completed_at->toISOString())->toBe($completed);
    $this->assertDatabaseCount('admin_activity_logs', 1);
});

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

test('order detail booking preserves the courier snapshot and returns to order detail', function () {
    createBiteshipSettings();
    foreach (['shipper_name' => 'Retired shipper', 'shipper_phone' => '628111111111', 'store_address' => 'Retired address'] as $key => $value) {
        SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
    config(['services.biteship.shipper_name' => 'Environment shipper', 'services.biteship.shipper_phone' => '628222222222']);
    $order = createPaidOrderForBiteship();
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'anteraja', 'courier_type' => 'same_day', 'courier_service_name' => 'Same Day', 'price' => 20600]]]),
        'api.biteship.com/v1/orders' => Http::response(['id' => 'detail-booking', 'status' => 'confirmed']),
    ]);
    $this->actingAs(createAdminUserForBiteship())->post(route('admin.orders.shipments.store', $order), ['source' => 'order_detail', 'courier_company' => 'other', 'courier_type' => 'express'])
        ->assertSessionHasNoErrors()->assertRedirect(route('admin.orders.show', $order));
    expect($order->fresh()->shipment->courier_company)->toBe('anteraja')->and($order->fresh()->shipment->biteship_order_id)->toBe('detail-booking');
    Http::assertSent(fn ($request): bool => $request->url() === 'https://api.biteship.com/v1/orders'
        && $request['shipper_contact_name'] === 'Aurea Syari'
        && $request['origin_contact_name'] === 'Aurea Syari'
        && $request['shipper_contact_phone'] === '6281234567890'
        && $request['origin_contact_phone'] === '6281234567890'
        && $request['origin_address'] === 'Jl. Pahlawan No. 88');
    $this->post(route('admin.orders.shipments.store', $order), ['source' => 'order_detail'])->assertSessionHasErrors('shipment');
    Http::assertSentCount(2);
});

test('order detail booking blocks unpaid uncertain and already booked orders', function (string $case) {
    $order = createPaidOrderForBiteship();
    match ($case) {
        'unpaid' => $order->update(['payment_status' => 'pending']),
        'uncertain' => $order->shipment->update(['raw_order_response' => ['booking_creation_uncertain' => true]]),
        'booked' => $order->shipment->update(['biteship_order_id' => 'existing-booking']),
    };
    $this->actingAs(createAdminUserForBiteship())->post(route('admin.orders.shipments.store', $order), ['source' => 'order_detail'])->assertSessionHasErrors('shipment');
    Http::assertNothingSent();
})->with(['unpaid', 'uncertain', 'booked']);

test('booking rejects missing canonical sender data even when retired settings exist', function (string $missingKey) {
    createBiteshipSettings();
    SiteSetting::query()->where('key', $missingKey)->update(['value' => null]);
    foreach ([
        'shipper_name' => 'Retired shipper',
        'shipper_phone' => '628111111111',
        'store_address' => 'Retired address',
    ] as $key => $value) {
        SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
    config(['services.biteship.shipper_name' => 'Environment shipper', 'services.biteship.shipper_phone' => '628222222222', 'services.biteship.origin_address' => 'Environment address']);
    Http::fake();
    $order = createPaidOrderForBiteship();

    $this->actingAs(createAdminUserForBiteship())
        ->post(route('admin.orders.shipments.store', $order), ['source' => 'order_detail'])
        ->assertSessionHasErrors('shipment');

    Http::assertNothingSent();
    expect($order->fresh()->shipment->biteship_order_id)->toBeNull();
})->with(['store_name', 'store_phone', 'origin_address']);

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
