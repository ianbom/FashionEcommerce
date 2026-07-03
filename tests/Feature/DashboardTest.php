<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('customer dashboard redirects to customer profile', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('my-profile'));
});

test('admin dashboard redirects to admin dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this
        ->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});
