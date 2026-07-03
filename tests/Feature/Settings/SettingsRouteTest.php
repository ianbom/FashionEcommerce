<?php

use App\Models\User;

test('settings redirect lands on profile settings page', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->followingRedirects()
        ->get('/settings')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/profile'));
});

test('account settings routes use the customer settings URL namespace', function () {
    expect(route('profile.edit', absolute: false))->toBe('/settings/profile')
        ->and(route('security.edit', absolute: false))->toBe('/settings/security');
});
