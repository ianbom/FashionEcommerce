<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

it('allows admin to verify a pending manual payment from order detail', function () {
    $admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    $customer = User::factory()->create();
    $order = Order::query()->create([
        'user_id' => $customer->id,
        'order_number' => 'ORD-MANUAL-VERIFY',
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'customer_phone' => '081234567890',
        'payment_status' => 'pending',
        'order_status' => 'pending_payment',
    ]);
    $payment = Payment::query()->create([
        'order_id' => $order->id,
        'payment_provider' => 'manual',
        'payment_method' => 'bank_transfer',
        'transaction_status' => 'pending',
        'gross_amount' => 100000,
        'currency' => 'IDR',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.orders.payment.confirm', $order))
        ->assertRedirect();

    expect($order->refresh())
        ->payment_status->toBe('paid')
        ->order_status->toBe('paid')
        ->paid_at->not->toBeNull()
        ->and($payment->refresh())
        ->transaction_status->toBe('settlement')
        ->paid_at->not->toBeNull();
});
