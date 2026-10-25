<?php

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Customer\WhatsAppOrderMessage;
use App\Services\Integrations\MidtransService;
use App\Services\Settings\SiteSettingService;
use Database\Seeders\SiteSettingSeeder;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;

it('normalizes only valid phone numbers', function (?string $input, ?string $expected) {
    expect(SiteSettingService::normalizePhone($input))->toBe($expected);
})->with([
    ['0812 3456-7890', '6281234567890'], ['+62 (812) 3456-7890', '6281234567890'],
    [null, null], ['', null], ['123', null], ['628123456789012345', null], ['abc081234567890', null],
]);

it('stores one normalized store phone for support and legacy payment messages', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    SiteSetting::query()->create(['key' => 'whatsapp_number', 'value' => '628111111111']);
    SiteSetting::query()->create(['key' => 'payment_whatsapp_number', 'value' => '628222222222']);
    $this->put(route('admin.settings.update'), ['store_phone' => '0812 3456-7890'])->assertSessionHasNoErrors();
    expect(SiteSetting::query()->where('key', 'store_phone')->value('value'))->toBe('6281234567890')
        ->and(app(WhatsAppOrderMessage::class)->number())->toBe('6281234567890')
        ->and(SiteSetting::query()->where('key', 'whatsapp_number')->value('value'))->toBe('628111111111');
});

it('rejects invalid coordinates phone and URL settings', function (string $key, mixed $value) {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->put(route('admin.settings.update'), [$key => $value])->assertSessionHasErrors($key);
    expect(SiteSetting::query()->where('key', $key)->exists())->toBeFalse();
})->with([['store_latitude', 91], ['store_longitude', 181], ['store_latitude', 'NaN'], ['store_phone', 'abc'], ['store_phone', ['invalid']], ['contact_maps_url', 'javascript:alert(1)']]);

it('validates Midtrans configuration without exposing merchant credentials', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->put(route('admin.settings.update'), ['payment_expiry_duration' => 60])->assertSessionHasNoErrors();
    $this->get(route('admin.settings.payment'))->assertInertia(fn (AssertableInertia $page) => $page
        ->where('values.payment_expiry_duration', '60')->missing('values.server_key')->etc());
});

it('rejects invalid gateway expiry settings', function (string $key, mixed $value) {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->put(route('admin.settings.update'), [$key => $value])->assertSessionHasErrors($key);
})->with([['payment_expiry_duration', 0], ['payment_expiry_duration', 10081], ['payment_expiry_duration', 1.5]]);

it('uses only configured Midtrans environment and keeps it out of settings', function (string $environment) {
    config(['services.midtrans.environment' => $environment]);
    SiteSetting::query()->create(['key' => 'midtrans_environment', 'value' => $environment === 'sandbox' ? 'production' : 'sandbox']);
    SiteSetting::query()->create(['key' => 'payment_midtrans_env', 'value' => 'production']);
    expect(app(MidtransService::class)->environment())->toBe($environment);
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->get(route('admin.settings.payment'))->assertInertia(fn (AssertableInertia $page) => $page
        ->missing('values.midtrans_environment')->missing('values.payment_midtrans_env')
        ->where('values.payment_expiry_duration', '1440')->etc());
    $this->assertDatabaseCount('site_settings', 2);
})->with(['sandbox', 'production']);

it('rejects invalid Midtrans environment from server configuration', function (?string $environment) {
    config(['services.midtrans.environment' => $environment]);
    expect(fn () => app(MidtransService::class)->environment())
        ->toThrow(ValidationException::class);
})->with([null, 'testing']);

it('does not expose or write retired settings', function (string $key) {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->put(route('admin.settings.update'), [$key => 'retired'])->assertSessionHasNoErrors();
    expect(SiteSetting::query()->where('key', $key)->exists())->toBeFalse();
    SiteSetting::query()->create(['key' => $key, 'value' => 'legacy']);
    $this->get(route('admin.settings.store'))->assertInertia(fn (AssertableInertia $page) => $page
        ->missing('values.'.$key)
        ->where('sections', fn ($sections): bool => ! collect($sections)->flatMap(fn ($section) => $section['fields'])->contains('key', $key))
        ->etc());
})->with(['whatsapp_number', 'payment_whatsapp_number', 'contact_phone', 'contact_address', 'store_address', 'shipper_name', 'shipper_phone', 'midtrans_environment', 'payment_midtrans_env']);

it('seeds canonical identity without redundant keys', function () {
    $this->seed(SiteSettingSeeder::class);
    $keys = SiteSetting::query()->pluck('key');
    expect($keys->all())->toContain('store_name', 'store_phone', 'origin_address');
    foreach (['whatsapp_number', 'payment_whatsapp_number', 'contact_phone', 'contact_address', 'store_address', 'shipper_name', 'shipper_phone', 'midtrans_environment', 'payment_midtrans_env'] as $key) {
        expect($keys->contains($key))->toBeFalse($key);
    }
});

it('does not fall back to a retired phone when the canonical phone is absent', function (?string $phone) {
    SiteSetting::query()->create(['key' => 'store_phone', 'value' => $phone]);
    SiteSetting::query()->create(['key' => 'payment_whatsapp_number', 'value' => '628111111111']);
    expect(fn () => app(WhatsAppOrderMessage::class)->number())->toThrow(ValidationException::class);
})->with([null, '']);

it('shares only canonical public contact data', function () {
    foreach (['store_phone' => '081234567890', 'origin_address' => 'Alamat pengiriman', 'server_key' => 'synthetic-private', 'contact_phone' => '628111111111'] as $key => $value) {
        SiteSetting::query()->create(['key' => $key, 'value' => $value]);
    }
    $this->get('/')->assertInertia(fn (AssertableInertia $page) => $page
        ->where('shop.contact.phone', '6281234567890')
        ->where('shop.contact.address', 'Alamat pengiriman')
        ->missing('shop.contact.server_key')->missing('shop.contact.contact_phone')->etc());
});
