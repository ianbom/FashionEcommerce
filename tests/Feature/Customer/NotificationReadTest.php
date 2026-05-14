<?php

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marks a customer notification as read', function () {
    $user = User::factory()->create();
    $notification = createCustomerNotification($user);

    $this->actingAs($user)
        ->post(route('notifications.read', $notification))
        ->assertRedirect();

    expect($notification->refresh()->is_read)->toBeTrue()
        ->and($notification->read_at)->not->toBeNull();
});

it('does not allow reading another customer notification', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $notification = createCustomerNotification($otherUser);

    $this->actingAs($user)
        ->post(route('notifications.read', $notification))
        ->assertNotFound();

    expect($notification->refresh()->is_read)->toBeFalse()
        ->and($notification->read_at)->toBeNull();
});

function createCustomerNotification(User $user): Notification
{
    return Notification::query()->create([
        'user_id' => $user->id,
        'title' => 'Order updated',
        'message' => 'Order kamu diperbarui.',
        'type' => 'order',
        'is_read' => false,
    ]);
}
