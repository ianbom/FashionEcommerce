<?php

use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('redirects guest from manage address page', function () {
    $this->get(route('manage-address'))->assertRedirect(route('login'));
});

it('shows only addresses that belong to authenticated user', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();
    $ownAddress = createAddress($user);
    createAddress($anotherUser);

    $this->actingAs($user)
        ->get(route('manage-address'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/manage-address/manage-address')
            ->has('addresses', 1)
            ->where('addresses.0.id', $ownAddress->id)
            ->where('addresses.0.recipient_name', $ownAddress->recipient_name));
});

it('stores a new address for authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('manage-address'))
        ->post(route('manage-address.store'), addressPayload([
            'recipient_name' => 'Address Baru',
            'is_default' => false,
        ]))
        ->assertRedirect(route('manage-address'));

    $this->assertDatabaseHas('customer_addresses', [
        'user_id' => $user->id,
        'recipient_name' => 'Address Baru',
        'is_default' => true,
    ]);
});

it('updates existing address that belongs to authenticated user', function () {
    $user = User::factory()->create();
    $address = createAddress($user, ['recipient_name' => 'Alamat Lama']);

    $this->actingAs($user)
        ->from(route('manage-address'))
        ->put(route('manage-address.update', $address), addressPayload([
            'recipient_name' => 'Alamat Baru',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'is_default' => true,
        ]))
        ->assertRedirect(route('manage-address'));

    $this->assertDatabaseHas('customer_addresses', [
        'id' => $address->id,
        'recipient_name' => 'Alamat Baru',
        'city' => 'Jakarta Selatan',
        'district' => 'Kebayoran Baru',
        'is_default' => true,
    ]);
});

it('cannot update address that belongs to another user', function () {
    $user = User::factory()->create();
    $anotherUser = User::factory()->create();
    $address = createAddress($anotherUser);

    $this->actingAs($user)
        ->put(route('manage-address.update', $address), addressPayload([
            'recipient_name' => 'Should Not Update',
        ]))
        ->assertNotFound();
});

it('allows deleting address even when it is referenced by order', function () {
    $user = User::factory()->create();
    $address = createAddress($user, ['is_default' => true]);

    $order = Order::query()->create([
        'user_id' => $user->id,
        'customer_address_id' => $address->id,
        'order_number' => 'ORD-'.Str::upper(Str::random(10)),
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'customer_phone' => $user->phone ?? '081234567890',
    ]);

    $this->actingAs($user)
        ->from(route('manage-address'))
        ->delete(route('manage-address.destroy', $address))
        ->assertRedirect(route('manage-address'));

    $this->assertSoftDeleted('customer_addresses', [
        'id' => $address->id,
    ]);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'customer_address_id' => $address->id,
    ]);
});

it('keeps only one default address for each user', function () {
    $user = User::factory()->create();
    $first = createAddress($user, ['label' => 'Home', 'is_default' => true]);

    $this->actingAs($user)
        ->post(route('manage-address.store'), addressPayload([
            'label' => 'Office',
            'is_default' => true,
        ]))
        ->assertRedirect();

    $second = CustomerAddress::query()
        ->where('user_id', $user->id)
        ->where('label', 'Office')
        ->firstOrFail();

    expect($first->fresh()?->is_default)->toBeFalse();
    expect($second->is_default)->toBeTrue();

    $this->actingAs($user)
        ->put(route('manage-address.update', $first), addressPayload([
            'label' => 'Home',
            'is_default' => true,
        ]))
        ->assertRedirect();

    expect($first->fresh()?->is_default)->toBeTrue();
    expect($second->fresh()?->is_default)->toBeFalse();
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function addressPayload(array $overrides = []): array
{
    return [
        ...[
            'recipient_name' => 'Siti Aisyah',
            'recipient_phone' => '081234567890',
            'label' => 'Home',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'district' => 'Coblong',
            'subdistrict' => 'Dago',
            'postal_code' => '40135',
            'full_address' => 'Jl. Dipatiukur No. 10',
            'note' => null,
            'biteship_area_id' => null,
            'latitude' => null,
            'longitude' => null,
            'is_default' => false,
        ],
        ...$overrides,
    ];
}

/**
 * @param  array<string, mixed>  $overrides
 */
function createAddress(User $user, array $overrides = []): CustomerAddress
{
    return CustomerAddress::query()->create([
        ...addressPayload(),
        ...$overrides,
        'user_id' => $user->id,
    ]);
}
