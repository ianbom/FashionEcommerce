<?php

use App\Models\AdminActivityLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockLog;
use App\Models\User;
use App\Services\Admin\OrderManagementService;
use App\Services\Admin\ShipmentManagementService;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
    $this->order = Order::query()->create([
        'user_id' => User::factory()->create()->id, 'order_number' => 'REFERENCE-ORDER',
        'customer_name' => 'Customer', 'customer_email' => 'customer@example.test', 'customer_phone' => '081234567890',
        'payment_status' => 'paid', 'order_status' => 'paid', 'shipping_status' => 'not_created', 'subtotal' => 10000, 'shipping_cost' => 1000, 'grand_total' => 11000, 'paid_at' => now(),
    ]);
    $product = Product::query()->create(['name' => 'Reference', 'slug' => 'reference', 'sku' => 'REFERENCE', 'base_price' => 10000, 'weight' => 200, 'status' => 'published']);
    $this->variant = $product->variants()->create(['sku' => 'REFERENCE-M', 'stock' => 9, 'reserved_stock' => 0, 'is_active' => true]);
    $this->order->items()->create(['product_id' => $product->id, 'product_variant_id' => $this->variant->id, 'product_name' => 'Reference', 'quantity' => 1, 'price' => 10000, 'subtotal' => 10000]);
    $this->order->payment()->create(['payment_provider' => 'midtrans', 'transaction_status' => 'settlement', 'gross_amount' => 11000]);
    $this->shipment = $this->order->shipment()->create(['shipping_provider' => 'biteship', 'courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'shipping_status' => 'not_created']);
});

it('provides reference activity stock and timestamp contracts without changing list dates', function () {
    StockLog::query()->create(['product_variant_id' => $this->variant->id, 'type' => 'out', 'quantity' => -1, 'stock_before' => 10, 'stock_after' => 9, 'reference_type' => 'order', 'reference_id' => $this->order->id]);
    AdminActivityLog::query()->create(['user_id' => $this->admin->id, 'action' => 'order_status', 'module' => 'orders', 'reference_type' => 'order', 'reference_id' => $this->order->id, 'new_values' => ['order_status' => 'processing', 'reason' => 'Packing']]);
    $this->actingAs($this->admin)->get(route('admin.orders.show', $this->order))->assertInertia(fn (AssertableInertia $page) => $page
        ->component('admin/orders/show')->where('order.available_actions', ['processing'])
        ->where('order.booking_uncertain', false)->where('order.can_create_shipment', true)
        ->where('order.status_history.0.status', 'processing')->where('order.status_history.0.actor', $this->admin->name)
        ->where('order.items.0.stock_movements.0.stock_after', 9)
        ->where('order.created_at', $this->order->created_at->toISOString())->etc());
    expect(app(OrderManagementService::class)->row($this->order)['created_at'])->toBe($this->order->created_at->toFormattedDateString());
});

it('hides booking when the snapshot is incomplete or uncertain', function (string $case) {
    $this->shipment->update($case === 'missing' ? ['courier_type' => ''] : ['raw_order_response' => ['booking_creation_uncertain' => true]]);
    $data = app(OrderManagementService::class)->detailData($this->order)['order'];
    expect($data['can_create_shipment'])->toBeFalse()->and($data['booking_uncertain'])->toBe($case === 'uncertain');
})->with(['missing', 'uncertain']);

it('derives the booking courier from the order snapshot and returns to detail', function () {
    $captured = null;
    $fake = Mockery::mock(ShipmentManagementService::class);
    $fake->shouldReceive('createFromOrder')->once()->andReturnUsing(function ($request) use (&$captured) {
        $captured = $request->validated();

        return $this->shipment;
    });
    app()->instance(ShipmentManagementService::class, $fake);
    $this->actingAs($this->admin)->post(route('admin.orders.shipments.store', $this->order), ['source' => 'order_detail', 'courier_company' => 'other', 'courier_type' => 'express'])
        ->assertSessionHasNoErrors()->assertRedirect(route('admin.orders.show', $this->order));
    expect($captured)->toMatchArray(['source' => 'order_detail', 'courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler']);
    Http::assertNothingSent();
});

it('rejects booking without a courier snapshot rather than inventing a courier', function () {
    $this->shipment->delete();
    $this->actingAs($this->admin)->post(route('admin.orders.shipments.store', $this->order), ['source' => 'order_detail', 'courier_company' => 'other', 'courier_type' => 'express'])
        ->assertSessionHasErrors(['courier_company', 'courier_type']);
    Http::assertNothingSent();
});

it('rejects non-admin booking and detail access', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.orders.show', $this->order))->assertForbidden();
    $this->post(route('admin.orders.shipments.store', $this->order), ['source' => 'order_detail'])->assertForbidden();
    Http::assertNothingSent();
});

it('requires a failure reason without refunding payment or changing stock', function () {
    $this->order->update(['order_status' => 'shipped', 'shipping_status' => 'lost']);
    $this->shipment->update(['shipping_status' => 'lost', 'biteship_order_id' => 'lost-booking']);
    $this->actingAs($this->admin)->post(route('admin.orders.status', $this->order), ['status' => 'shipment_failed'])->assertSessionHasErrors('reason');
    $this->post(route('admin.orders.status', $this->order), ['status' => 'shipment_failed', 'reason' => 'Kurir mengonfirmasi kehilangan paket.'])->assertSessionHasNoErrors();
    expect($this->order->fresh()->order_status)->toBe('shipment_failed')->and($this->order->fresh()->payment_status)->toBe('paid')
        ->and($this->variant->fresh()->stock)->toBe(9)->and($this->variant->fresh()->reserved_stock)->toBe(0)
        ->and($this->order->fresh()->stock_released_at)->toBeNull()->and($this->order->fresh()->voucher_released_at)->toBeNull();
    $this->assertDatabaseCount('stock_logs', 0);
    Http::assertNothingSent();
});

it('allows completion only after the courier confirms delivery', function () {
    $this->actingAs($this->admin)->post(route('admin.orders.status', $this->order), ['status' => 'completed'])->assertSessionHasErrors('status');
    $this->order->update(['order_status' => 'delivered', 'shipping_status' => 'delivered']);
    $this->shipment->update(['shipping_status' => 'delivered', 'biteship_order_id' => 'delivered-booking']);
    $this->post(route('admin.orders.status', $this->order), ['status' => 'completed'])->assertSessionHasNoErrors();
    expect($this->order->fresh()->completed_at)->not->toBeNull();
    Http::assertNothingSent();
});
