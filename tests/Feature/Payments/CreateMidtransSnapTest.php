<?php

use App\Actions\Payments\CreateMidtransSnapAction;
use App\Actions\Payments\SyncExpiredMidtransPaymentsAction;
use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Integrations\MidtransService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->customer = User::factory()->create();
    $this->cart = Cart::query()->create(['user_id' => $this->customer->id]);
    $this->product = Product::query()->create(['name' => 'Snap product', 'sku' => 'SNAP', 'slug' => 'snap', 'base_price' => 10000.25, 'weight' => 200, 'status' => 'published']);
    $this->variant = $this->product->variants()->create(['sku' => 'SNAP-M', 'stock' => 10, 'reserved_stock' => 3, 'is_active' => true]);
    $this->voucher = Voucher::query()->create(['code' => 'SNAP', 'name' => 'Snap', 'discount_type' => 'fixed', 'discount_value' => 100.25, 'used_count' => 1, 'is_active' => true]);
    $this->order = Order::query()->create(['user_id' => $this->customer->id, 'order_number' => 'SNAP-ORDER', 'customer_name' => 'Customer', 'customer_email' => $this->customer->email, 'customer_phone' => '081234567890', 'subtotal' => 30000.75, 'discount_amount' => 100.25, 'shipping_cost' => 1000.25, 'grand_total' => 30901, 'voucher_id' => $this->voucher->id, 'payment_status' => 'pending', 'order_status' => 'pending_payment']);
    $this->order->items()->create(['product_id' => $this->product->id, 'product_variant_id' => $this->variant->id, 'product_name' => $this->product->name, 'variant_sku' => $this->variant->sku, 'price' => 10000.25, 'quantity' => 3, 'subtotal' => 30000.75, 'weight' => 600]);
    $this->payment = $this->order->payment()->create(['payment_provider' => 'midtrans', 'midtrans_order_id' => $this->order->order_number, 'gross_amount' => 30901, 'currency' => 'IDR', 'transaction_status' => 'pending', 'expires_at' => now()->addDay()]);
    $this->payment->update(['raw_response' => ['snap_creation_state' => 'new']]);
    $this->snapResponse = fn () => Http::response(['token' => 'snap-test-token', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v3/redirection/snap-test-token'], 201);
    $this->snapCalls = 0;
    Http::fake(['app.sandbox.midtrans.com/snap/v1/transactions' => function ($request) {
        $this->snapCalls++;
        $this->snapRequestedMethods = $request->data()['enabled_payments'] ?? null;

        return ($this->snapResponse)();
    }]);
});

it('creates one Snap session with exact item totals and reuses it', function () {
    $action = app(CreateMidtransSnapAction::class);
    $result = $action->execute($this->payment);
    expect($result['payment_state'])->toBe('ready')->and($action->execute($this->payment))->toBe($result);
    expect($this->payment->refresh()->midtrans_snap_token)->toBe('snap-test-token')
        ->and($this->variant->refresh()->reserved_stock)->toBe(3);
    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => $request['transaction_details']['gross_amount'] === 30901
        && collect($request['item_details'])->sum(fn ($item) => $item['price'] * $item['quantity']) === 30901
        && $request['callbacks']['finish'] === route('order.detail', $this->order));
    Http::assertSent(fn ($request): bool => ! array_key_exists('enabled_payments', $request->data()));
});

it('keeps the chosen channel through uncertain Snap creation and sync', function () {
    $this->payment->update(['requested_payment_method' => 'other_qris']);
    $this->snapResponse = fn () => throw new ConnectionException('Synthetic timeout');
    $action = app(CreateMidtransSnapAction::class);
    expect($action->execute($this->payment)['payment_state'])->toBe('processing');
    $action->execute($this->payment);
    app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, ['order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'status_code' => '201', 'transaction_status' => 'pending', 'payment_type' => 'qris']);
    expect($this->payment->refresh()->requested_payment_method)->toBe('other_qris')
        ->and($this->payment->payment_method)->toBe('qris')
        ->and($this->variant->refresh()->reserved_stock)->toBe(3)->and($this->snapCalls)->toBe(1);
    expect($this->snapRequestedMethods)->toBe(['other_qris']);
});

it('restores a rejected checkout once without overwriting newer cart additions', function () {
    $this->snapResponse = fn () => Http::response(['error_messages' => ['Invalid transaction payload']], 400);
    $newItem = $this->cart->items()->create(['product_id' => $this->product->id, 'product_variant_id' => $this->variant->id, 'quantity' => 2, 'price_snapshot' => 11000]);
    $action = app(CreateMidtransSnapAction::class);
    expect($action->execute($this->payment)['payment_state'])->toBe('failed');
    $action->execute($this->payment);
    expect($newItem->refresh()->quantity)->toBe(5)->and((float) $newItem->price_snapshot)->toBe(11000.0)
        ->and($this->variant->refresh()->reserved_stock)->toBe(0)
        ->and($this->voucher->refresh()->used_count)->toBe(0)
        ->and($this->order->refresh()->payment_status)->toBe('failed');
    Http::assertSentCount(1);
});

it('keeps uncertain creations reserved without another POST', function (string $response) {
    $this->snapResponse = match ($response) {
        'timeout' => fn () => throw new ConnectionException('Synthetic timeout'),
        'duplicate' => fn () => Http::response(['error_messages' => ['order_id has already been taken']], 400),
        'server' => fn () => Http::response(['error_messages' => ['Unavailable']], 503),
        'missing-token' => fn () => Http::response(['redirect_url' => 'https://app.sandbox.midtrans.com/test']),
        'unsafe-url' => fn () => Http::response(['token' => 'token', 'redirect_url' => 'https://attacker.example.test/pay']),
        'contradictory' => fn () => Http::response(['token' => 'token', 'error_messages' => ['Invalid transaction']], 400),
        'throttled' => fn () => Http::response(['error_messages' => ['Too many requests']], 429),
        default => fn () => Http::response('not-json', 200),
    };
    $action = app(CreateMidtransSnapAction::class);
    expect($action->execute($this->payment)['payment_state'])->toBe('processing');
    $action->execute($this->payment);
    expect($this->variant->refresh()->reserved_stock)->toBe(3)
        ->and($this->voucher->refresh()->used_count)->toBe(1)
        ->and($this->order->refresh()->stock_released_at)->toBeNull()
        ->and(data_get($this->payment->refresh()->raw_response, 'snap_creation_uncertain'))->toBeTrue();
    expect($this->snapCalls)->toBe(1);
})->with(['timeout', 'duplicate', 'server', 'missing-token', 'unsafe-url', 'malformed', 'contradictory', 'throttled']);

it('does not create another session while the first request is in flight', function () {
    $this->snapResponse = function () {
        expect(app(CreateMidtransSnapAction::class)->execute($this->payment)['payment_state'])->toBe('processing');

        return Http::response(['token' => 'only-token', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v3/redirection/only-token']);
    };
    expect(app(CreateMidtransSnapAction::class)->execute($this->payment)['payment_state'])->toBe('ready');
    expect($this->snapCalls)->toBe(1);
});

it('preserves payment finalized during Snap creation', function (string $response) {
    $this->snapResponse = function () use ($response) {
        app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, [
            'order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'transaction_status' => 'settlement', 'status_code' => '200',
        ]);

        return match ($response) {
            'ready' => Http::response(['token' => 'race-token', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v3/redirection/race-token']),
            'rejected' => Http::response(['error_messages' => ['Invalid transaction']], 400),
            default => throw new ConnectionException('Synthetic timeout'),
        };
    };
    expect(app(CreateMidtransSnapAction::class)->execute($this->payment)['payment_state'])->toBe('final');
    expect($this->order->refresh()->payment_status)->toBe('paid')
        ->and($this->order->stock_released_at)->toBeNull()
        ->and($this->variant->refresh()->stock)->toBe(7)
        ->and($this->variant->reserved_stock)->toBe(0)
        ->and($this->voucher->refresh()->used_count)->toBe(1);
    $this->assertDatabaseCount('cart_items', 0);
})->with(['ready', 'rejected', 'timeout']);

it('does not resume or recreate an expired session', function () {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    $this->payment->update(['expires_at' => now()->subMinute()]);
    expect(app(CreateMidtransSnapAction::class)->execute($this->payment)['payment_state'])->toBe('processing');
    expect($this->snapCalls)->toBe(1);
});

it('invalidates an uncharged Snap session before releasing its reservation', function (bool $expired) {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    Http::fake([
        'api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404),
        'app.sandbox.midtrans.com/snap/v1/transactions/*/cancel' => Http::response(['canceled_at' => '2026-10-21T10:00:00Z']),
    ]);
    if ($expired) {
        $this->payment->update(['expires_at' => now()->subMinute()]);
        expect(app(SyncExpiredMidtransPaymentsAction::class)->execute()['expired'])->toBe(1);
    } else {
        app(SyncMidtransPaymentAction::class)->cancel($this->payment);
    }
    expect($this->variant->refresh()->reserved_stock)->toBe(0)
        ->and($this->order->refresh()->payment_status)->toBe($expired ? 'expired' : 'cancelled');
    app(SyncMidtransPaymentAction::class)->cancel($this->payment);
    expect($this->voucher->refresh()->used_count)->toBe(0);
    Http::assertSent(fn ($request) => str_ends_with($request->url(), '/snap-test-token/cancel') && $request->hasHeader('Authorization', 'synthetic-test-key'));
})->with([false, true]);

it('preserves an uncharged reservation when Snap cancellation is unconfirmed', function (string $response) {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    Http::fake([
        'api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404),
        'app.sandbox.midtrans.com/snap/v1/transactions/*/cancel' => fn () => match ($response) {
            'progress' => Http::response(['error_messages' => ['Transaction is on progress']], 400),
            'timeout' => throw new ConnectionException('Synthetic timeout'),
            'relative-date' => Http::response(['canceled_at' => 'tomorrow']),
            'contradictory' => Http::response(['canceled_at' => '2026-10-21T10:00:00Z', 'error_messages' => ['Transaction is on progress']]),
            default => Http::response(['canceled_at' => []]),
        },
    ]);
    expect(fn () => app(SyncMidtransPaymentAction::class)->cancel($this->payment))->toThrow(ValidationException::class);
    expect($this->order->refresh()->payment_status)->toBe('pending')
        ->and($this->variant->refresh()->reserved_stock)->toBe(3)
        ->and($this->voucher->refresh()->used_count)->toBe(1);
})->with(['progress', 'timeout', 'malformed', 'relative-date', 'contradictory']);

it('requires ownership for customer sync and never marks a finish return as paid', function () {
    $this->actingAs($this->customer);
    $this->get(route('order.detail', $this->order))->assertOk();
    expect($this->order->refresh()->payment_status)->toBe('pending');
    $this->actingAs(User::factory()->create())->post(route('order.payment.sync', $this->order))->assertNotFound();
    Http::assertNothingSent();
});

it('syncs settlement for the customer and throttles repeated sync requests', function () {
    Http::fake(['api.sandbox.midtrans.com/v2/*/status' => Http::response([
        'order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'transaction_status' => 'settlement', 'status_code' => '200',
    ])]);
    $this->actingAs($this->customer)->post(route('order.payment.sync', $this->order))->assertRedirect();
    expect($this->order->refresh()->payment_status)->toBe('paid')->and($this->variant->refresh()->stock)->toBe(7);
    foreach (range(1, 5) as $attempt) {
        $this->post(route('order.payment.sync', $this->order))->assertRedirect();
    }
    $this->post(route('order.payment.sync', $this->order))->assertTooManyRequests();
    Http::assertSentCount(1);
});

it('preserves a settlement racing with Snap cancellation', function () {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    Http::fake([
        'api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404),
        'app.sandbox.midtrans.com/snap/v1/transactions/*/cancel' => function () {
            app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, [
                'order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'transaction_status' => 'settlement', 'status_code' => '200',
            ]);

            return Http::response(['canceled_at' => '2026-10-21T10:00:00Z']);
        },
    ]);
    app(SyncMidtransPaymentAction::class)->cancel($this->payment);
    expect($this->order->refresh()->payment_status)->toBe('paid')->and($this->order->stock_released_at)->toBeNull()
        ->and($this->variant->refresh()->stock)->toBe(7)->and($this->voucher->refresh()->used_count)->toBe(1);
});

it('never treats Core not found alone as cancellation proof', function () {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    Http::fake(['api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404)]);
    app(SyncMidtransPaymentAction::class)->execute($this->payment);
    expect($this->order->refresh()->payment_status)->toBe('pending')->and($this->variant->refresh()->reserved_stock)->toBe(3);
    Http::assertNotSent(fn ($request) => str_ends_with($request->url(), '/cancel'));
});

it('finalizes signed settlement exactly once and ignores stale pending notifications', function () {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    $payload = ['order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'transaction_status' => 'settlement', 'status_code' => '200', 'transaction_id' => 'synthetic-transaction', 'payment_type' => 'bank_transfer'];
    $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'synthetic-test-key');
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    $payload['transaction_status'] = 'pending';
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    expect($this->order->refresh()->payment_status)->toBe('paid')->and($this->variant->refresh()->stock)->toBe(7)
        ->and($this->variant->reserved_stock)->toBe(0)->and($this->payment->refresh()->transaction_status)->toBe('settlement');
    $this->assertDatabaseCount('stock_logs', 1);
    $this->assertDatabaseCount('shipments', 0);
});

it('rejects unproven success metadata without releasing or finalizing stock', function (array $extra) {
    $payload = array_replace(['order_id' => $this->order->order_number, 'gross_amount' => '30901.00', 'transaction_status' => 'settlement', 'status_code' => '200'], $extra);
    expect(fn () => app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, $payload))->toThrow(ValidationException::class);
    expect($this->order->refresh()->payment_status)->toBe('pending')->and($this->variant->refresh()->reserved_stock)->toBe(3);
})->with([[['transaction_id' => []]], [['fraud_status' => []]], [['status_code' => '201']], [['fraud_status' => 'challenge']]]);

it('uses environment-specific HTTPS redirect validation', function (string $url, bool $valid) {
    expect(app(MidtransService::class)->validRedirectUrl($url))->toBe($valid);
})->with([
    ['https://app.sandbox.midtrans.com/snap/v3/redirection/token', true],
    ['https://app.midtrans.com/snap/v3/redirection/token', false],
    ['http://app.sandbox.midtrans.com/snap/v3/redirection/token', false],
    ['https://user@app.sandbox.midtrans.com/snap/v3/redirection/token', false],
    ['https://app.sandbox.midtrans.com:8443/snap/token', false],
]);

it('creates and reuses a production session only with the production host', function () {
    config(['services.midtrans.environment' => 'production']);
    Http::fake(['app.midtrans.com/snap/v1/transactions' => Http::response([
        'token' => 'production-test-token', 'redirect_url' => 'https://app.midtrans.com/snap/v3/redirection/production-test-token',
    ])]);
    $action = app(CreateMidtransSnapAction::class);
    expect($action->execute($this->payment)['payment_state'])->toBe('ready');
    expect($action->execute($this->payment)['redirect_url'])->toStartWith('https://app.midtrans.com/');
    Http::assertSentCount(1);
});

it('reconciles an abandoned creation claim without repeating the Snap POST', function () {
    $this->payment->update(['raw_response' => ['snap_creation_state' => 'creating', 'snap_creation_started_at' => now()->subMinutes(2)->toISOString()]]);
    Http::fake(['api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404)]);
    expect(app(SyncExpiredMidtransPaymentsAction::class)->execute())->toMatchArray(['checked' => 1, 'failed' => 1]);
    expect(data_get($this->payment->refresh()->raw_response, 'snap_creation_state'))->toBe('uncertain')
        ->and($this->variant->refresh()->reserved_stock)->toBe(3)->and($this->voucher->refresh()->used_count)->toBe(1);
    expect(app(CreateMidtransSnapAction::class)->execute($this->payment)['payment_state'])->toBe('processing');
    expect($this->snapCalls)->toBe(0);
});

it('accepts a provider acknowledgement that the Snap token was already cancelled', function () {
    app(CreateMidtransSnapAction::class)->execute($this->payment);
    Http::fake([
        'api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404),
        'app.sandbox.midtrans.com/snap/v1/transactions/*/cancel' => Http::response(['error_messages' => ['token already canceled']], 400),
    ]);
    app(SyncMidtransPaymentAction::class)->cancel($this->payment);
    expect($this->order->refresh()->payment_status)->toBe('cancelled')->and($this->variant->refresh()->reserved_stock)->toBe(0);
});
