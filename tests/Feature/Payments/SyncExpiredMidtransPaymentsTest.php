<?php

use App\Actions\Payments\SyncExpiredMidtransPaymentsAction;
use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\Customer\MidtransWebhookService;
use App\Services\Integrations\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createPendingOrder(string $orderNumber = 'ORD-TEST-EXPIRED'): Order
{
    $user = User::factory()->create();

    return Order::query()->create([
        'user_id' => $user->id,
        'order_number' => $orderNumber,
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'customer_phone' => '08123456789',
        'subtotal' => 100000,
        'discount_amount' => 0,
        'shipping_cost' => 0,
        'service_fee' => 0,
        'grand_total' => 100000,
        'payment_status' => PaymentStatus::Pending->value,
        'order_status' => OrderStatus::PendingPayment->value,
        'shipping_status' => 'not_created',
    ]);
}

it('marks locally expired pending payments without requiring Midtrans sync to succeed', function () {
    $order = createPendingOrder();

    $payment = Payment::query()->create([
        'order_id' => $order->id,
        'payment_provider' => 'midtrans',
        'midtrans_order_id' => $order->order_number,
        'transaction_status' => 'pending',
        'gross_amount' => 100000,
        'currency' => 'IDR',
        'expires_at' => now()->subMinute(),
    ]);

    $this->app->instance(
        SyncMidtransPaymentAction::class,
        Mockery::mock(SyncMidtransPaymentAction::class)->shouldNotReceive('execute')->getMock(),
    );

    $stats = app(SyncExpiredMidtransPaymentsAction::class)->execute();

    expect($stats)->toMatchArray(['checked' => 1, 'expired' => 1, 'skipped_midtrans_owned' => 0, 'synced' => 0, 'failed' => 0])
        ->and($payment->refresh()->transaction_status)->toBe('expire')
        ->and($payment->expired_at)->not->toBeNull()
        ->and($order->refresh()->payment_status)->toBe(PaymentStatus::Expired->value)
        ->and($order->order_status)->toBe(OrderStatus::PaymentExpired->value)
        ->and($order->expired_at)->not->toBeNull();
});

it('does not locally expire payments already owned by Midtrans transaction', function () {
    $order = createPendingOrder('ORD-TEST-MIDTRANS-OWNED');

    $payment = Payment::query()->create([
        'order_id' => $order->id,
        'payment_provider' => 'midtrans',
        'midtrans_order_id' => $order->order_number,
        'midtrans_transaction_id' => 'trx-123',
        'payment_method' => 'bank_transfer',
        'transaction_status' => 'pending',
        'gross_amount' => 100000,
        'currency' => 'IDR',
        'expires_at' => now()->subMinute(),
    ]);

    $stats = app(SyncExpiredMidtransPaymentsAction::class)->execute();

    expect($stats)->toMatchArray(['checked' => 0, 'expired' => 0, 'skipped_midtrans_owned' => 1, 'synced' => 0, 'failed' => 0])
        ->and($payment->refresh()->transaction_status)->toBe('pending')
        ->and($payment->expired_at)->toBeNull()
        ->and($order->refresh()->payment_status)->toBe(PaymentStatus::Pending->value)
        ->and($order->order_status)->toBe(OrderStatus::PendingPayment->value)
        ->and($order->expired_at)->toBeNull();
});

it('marks payment and order expired from Midtrans webhook expire status', function () {
    $order = createPendingOrder('ORD-TEST-WEBHOOK-EXPIRE');
    $payment = Payment::query()->create([
        'order_id' => $order->id,
        'payment_provider' => 'midtrans',
        'midtrans_order_id' => $order->order_number,
        'midtrans_transaction_id' => 'trx-456',
        'payment_method' => 'bank_transfer',
        'transaction_status' => 'pending',
        'gross_amount' => 100000,
        'currency' => 'IDR',
        'expires_at' => now()->subMinute(),
    ]);
    $payload = [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => '100000.00',
        'signature_key' => 'valid-signature',
        'transaction_status' => 'expire',
        'transaction_id' => 'trx-456',
        'payment_type' => 'bank_transfer',
    ];

    $midtrans = Mockery::mock(MidtransService::class);
    $midtrans->shouldReceive('validateNotificationSignature')->once()->with($payload)->andReturnTrue();
    $midtrans->shouldReceive('amountMatches')->once()->with('100000.00', Mockery::type(Payment::class))->andReturnTrue();
    $this->app->instance(MidtransService::class, $midtrans);

    app(MidtransWebhookService::class)->handle($payload);

    expect($payment->refresh()->transaction_status)->toBe('expire')
        ->and($payment->expired_at)->not->toBeNull()
        ->and($order->refresh()->payment_status)->toBe(PaymentStatus::Expired->value)
        ->and($order->order_status)->toBe(OrderStatus::PaymentExpired->value)
        ->and($order->expired_at)->not->toBeNull();
});
