<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('redirects unverified customers away from protected customer pages', function (string $routeName) {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertRedirect('/email/verify');
})->with([
    'profile' => 'my-profile',
    'cart' => 'cart',
    'checkout' => 'checkout',
    'orders' => 'my-order',
    'wishlist' => 'my-wishlist',
    'notifications' => 'notifications',
    'addresses' => 'manage-address',
]);

it('allows verified customers to access protected customer pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('my-profile'))
        ->assertOk();
});
