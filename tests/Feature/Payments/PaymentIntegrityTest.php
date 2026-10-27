<?php

use App\Actions\Payments\ApplyMidtransPaymentStatusAction;
use App\Actions\Payments\ManageManualPaymentAction;
use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Integrations\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $customer = User::factory()->create();
    $this->order = Order::query()->create([
        'user_id' => $customer->id, 'order_number' => 'INTEGRITY-1',
        'customer_name' => $customer->name, 'customer_email' => $customer->email, 'customer_phone' => '081234567890',
        'payment_status' => 'pending', 'order_status' => 'pending_payment',
    ]);
    $this->payment = Payment::query()->create([
        'order_id' => $this->order->id, 'payment_provider' => 'manual',
        'transaction_status' => 'pending', 'gross_amount' => 10000, 'currency' => 'IDR',
        'midtrans_order_id' => $this->order->order_number,
    ]);
});

it('rejects confirmation after reservation was released', function () {
    $this->order->update(['stock_released_at' => now(), 'payment_status' => 'cancelled', 'order_status' => 'cancelled']);
    expect(fn () => app(ManageManualPaymentAction::class)->confirm($this->payment))->toThrow(ValidationException::class);
    expect($this->order->refresh()->payment_status)->toBe('cancelled');
});

it('does not resurrect final payment states', function (string $current, string $incoming) {
    $this->order->update(['payment_status' => $current, 'order_status' => 'completed']);
    DB::transaction(fn () => app(ApplyMidtransPaymentStatusAction::class)->execute($this->payment, $incoming));
    expect($this->order->refresh()->payment_status)->toBe($current)
        ->and($this->order->order_status)->toBe('completed');
})->with([['refunded', 'pending'], ['refunded', 'settlement'], ['partially_refunded', 'pending'], ['paid', 'authorize']]);

it('does not repeat paid notification or reset completion', function () {
    $this->order->update(['payment_status' => 'paid', 'order_status' => 'completed']);
    DB::transaction(fn () => app(ApplyMidtransPaymentStatusAction::class)->execute($this->payment, 'settlement'));
    expect($this->order->refresh()->order_status)->toBe('completed');
    $this->assertDatabaseCount('notifications', 0);
});

it('keeps late settlement in review after release', function () {
    $this->order->update(['stock_released_at' => now(), 'payment_status' => 'cancelled', 'order_status' => 'cancelled']);
    DB::transaction(fn () => app(ApplyMidtransPaymentStatusAction::class)->execute($this->payment, 'settlement'));
    expect($this->order->refresh()->payment_status)->toBe('manual_review')
        ->and($this->payment->refresh()->failure_reason)->not->toBeNull();
    $this->assertDatabaseCount('notifications', 0);
});

it('commits rejected sync logs without changing payment', function () {
    $this->payment->update(['payment_provider' => 'midtrans']);
    expect(fn () => app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, [
        'order_id' => 'OTHER', 'transaction_status' => 'settlement', 'gross_amount' => '10000.00', 'status_code' => '200',
    ]))->toThrow(ValidationException::class);
    $this->assertDatabaseCount('payment_logs', 1);
    expect($this->payment->refresh()->transaction_status)->toBe('pending');
});

it('rolls back every item before recording a stock conflict review', function () {
    $product = Product::query()->create(['name' => 'Stock test', 'slug' => 'stock-test', 'sku' => 'STOCK', 'base_price' => 10000, 'weight' => 200, 'status' => 'published']);
    $variants = collect([['sku' => 'STOCK-A', 'stock' => 5, 'reserved_stock' => 1], ['sku' => 'STOCK-B', 'stock' => 5, 'reserved_stock' => 0]])->map(fn ($row) => $product->variants()->create($row));
    foreach ($variants as $variant) {
        $this->order->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'price' => 10000, 'quantity' => 1, 'subtotal' => 10000]);
    }
    DB::transaction(fn () => app(ApplyMidtransPaymentStatusAction::class)->execute($this->payment, 'settlement'));
    expect($this->order->refresh()->payment_status)->toBe('manual_review')
        ->and($this->order->stock_finalized_at)->toBeNull()
        ->and($variants[0]->refresh()->stock)->toBe(5)
        ->and($variants[0]->reserved_stock)->toBe(1)
        ->and($this->payment->refresh()->failure_reason)->not->toBeNull();
    $this->assertDatabaseCount('stock_logs', 0);
    $this->assertDatabaseCount('notifications', 0);
});

it('does not overwrite final metadata through status sync', function (string $current, string $incoming) {
    $this->order->update(['payment_status' => $current, 'order_status' => 'completed']);
    $this->payment->update(['payment_provider' => 'midtrans', 'transaction_status' => 'settlement', 'payment_method' => 'bank_transfer', 'midtrans_transaction_id' => 'final-id', 'raw_response' => ['final' => true]]);
    app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, ['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '200', 'transaction_status' => $incoming, 'payment_type' => 'changed', 'transaction_id' => 'changed']);
    expect($this->payment->refresh()->midtrans_transaction_id)->toBe('final-id')
        ->and($this->payment->payment_method)->toBe('bank_transfer')->and($this->payment->raw_response)->toBe(['final' => true]);
    $this->assertDatabaseCount('notifications', 0);
})->with([['paid', 'pending'], ['paid', 'settlement'], ['refunded', 'settlement'], ['partially_refunded', 'authorize']]);

it('matches only finite nonnegative numeric payment amounts', function (mixed $amount) {
    expect(app(MidtransService::class)->amountMatches($amount, $this->payment))->toBeFalse();
})->with([[null], [''], ['NaN'], ['INF'], [-1], [[]], ['10000oops']]);

it('cancels manual reservation and voucher exactly once', function () {
    $voucher = Voucher::query()->create(['code' => 'RESERVED', 'name' => 'Reserved', 'discount_type' => 'fixed', 'discount_value' => 100, 'used_count' => 1, 'is_active' => true]);
    $product = Product::query()->create(['name' => 'Reserved', 'slug' => 'reserved', 'sku' => 'RESERVED', 'base_price' => 10000, 'weight' => 200]);
    $variant = $product->variants()->create(['sku' => 'RESERVED-A', 'stock' => 5, 'reserved_stock' => 2]);
    $this->order->update(['voucher_id' => $voucher->id]);
    $this->order->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'price' => 10000, 'quantity' => 2, 'subtotal' => 20000]);
    app(ManageManualPaymentAction::class)->cancel($this->payment);
    app(ManageManualPaymentAction::class)->cancel($this->payment);
    expect($variant->refresh()->reserved_stock)->toBe(0)->and($variant->stock)->toBe(5)
        ->and($voucher->refresh()->used_count)->toBe(0)->and($this->order->refresh()->stock_released_at)->not->toBeNull();
});

it('handles signed settlement replays without changing final metadata or repeating notifications', function () {
    $this->payment->update(['payment_provider' => 'midtrans']);
    $payload = ['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '200', 'transaction_status' => 'settlement', 'transaction_id' => 'first-id', 'payment_type' => 'bank_transfer'];
    $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'synthetic-test-key');
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    $this->order->refresh()->update(['order_status' => 'completed']);
    $this->postJson(route('payments.midtrans.notification'), [...$payload, 'transaction_id' => 'second-id'])->assertSuccessful();
    expect($this->order->refresh()->order_status)->toBe('completed')
        ->and($this->payment->refresh()->midtrans_transaction_id)->toBe('first-id')
        ->and($this->payment->raw_response)->not->toHaveKey('signature_key');
    foreach ($this->payment->logs as $log) {
        expect($log->payload)->not->toHaveKey('signature_key');
    }
    $this->assertDatabaseCount('notifications', 1);
});

it('keeps requested channel distinct from signed provider method and webhook replays', function (string $requested, string $actual) {
    $this->payment->update(['payment_provider' => 'midtrans', 'requested_payment_method' => $requested]);
    $payload = ['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '200', 'transaction_status' => 'settlement', 'transaction_id' => 'channel-test', 'payment_type' => $actual];
    $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'synthetic-test-key');
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    expect($this->payment->refresh()->requested_payment_method)->toBe($requested)
        ->and($this->payment->payment_method)->toBe($actual)
        ->and($this->order->refresh()->payment_status)->toBe('paid');
    $this->assertDatabaseCount('notifications', 1);
})->with([['bca_va', 'bank_transfer'], ['echannel', 'echannel'], ['other_qris', 'qris'], ['gopay', 'qris'], ['shopeepay', 'shopeepay']]);

it('never releases a legacy reservation from uncertain or confirmed missing transaction status', function (int $httpStatus, array $response) {
    $this->payment->update(['payment_provider' => 'midtrans']);
    Http::fake(['api.sandbox.midtrans.com/*' => Http::response($response, $httpStatus)]);
    $this->actingAs($this->order->user)->post(route('order.cancel', $this->order))->assertSessionHasErrors();
    expect($this->order->refresh()->payment_status)->toBe('pending')->and($this->order->stock_released_at)->toBeNull();
    Http::assertSentCount(1);
})->with([[404, ['status_code' => '404']], [500, ['status_code' => '500']], [200, []]]);

it('preserves concurrent paid state after a provider cancellation response', function () {
    $this->payment->update(['payment_provider' => 'midtrans']);
    Http::fake([
        'api.sandbox.midtrans.com/*/status' => Http::response(['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '201', 'transaction_status' => 'pending']),
        'api.sandbox.midtrans.com/*/cancel' => function () {
            $this->order->update(['payment_status' => 'paid', 'order_status' => 'paid', 'stock_finalized_at' => now()]);
            $this->payment->update(['transaction_status' => 'settlement']);

            return Http::response(['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '200', 'transaction_status' => 'cancel']);
        },
    ]);
    $this->actingAs($this->order->user)->post(route('order.cancel', $this->order))->assertSessionHasErrors();
    expect($this->order->refresh()->payment_status)->toBe('paid')->and($this->order->stock_released_at)->toBeNull()->and($this->payment->refresh()->transaction_status)->toBe('settlement');
    Http::assertSentCount(2);
});

it('backfills paid timestamps on replay without replacing final metadata', function (string $entrypoint) {
    $this->order->update(['payment_status' => 'paid', 'order_status' => 'completed']);
    $this->payment->update(['payment_provider' => 'midtrans', 'transaction_status' => 'settlement', 'midtrans_transaction_id' => 'final-id', 'raw_response' => ['final' => true]]);
    $payload = ['order_id' => $this->order->order_number, 'gross_amount' => '10000.00', 'status_code' => '200', 'transaction_status' => 'settlement', 'transaction_id' => 'replay-id'];
    if ($entrypoint === 'webhook') {
        $payload['signature_key'] = hash('sha512', $payload['order_id'].$payload['status_code'].$payload['gross_amount'].'synthetic-test-key');
        $this->postJson(route('payments.midtrans.notification'), $payload)->assertSuccessful();
    } else {
        app(SyncMidtransPaymentAction::class)->applyPayload($this->payment, $payload);
    }
    expect($this->order->refresh()->paid_at)->not->toBeNull()
        ->and($this->payment->refresh()->paid_at)->not->toBeNull()
        ->and($this->payment->midtrans_transaction_id)->toBe('final-id')
        ->and($this->payment->raw_response)->toBe(['final' => true])
        ->and($this->order->order_status)->toBe('completed');
    $this->assertDatabaseCount('notifications', 0);
    $this->assertDatabaseCount('stock_logs', 0);
})->with(['webhook', 'sync']);

it('blocks manual payments before any provider synchronization', function () {
    expect(fn () => app(SyncMidtransPaymentAction::class)->execute($this->payment))->toThrow(ValidationException::class);
    Http::assertNothingSent();
});
