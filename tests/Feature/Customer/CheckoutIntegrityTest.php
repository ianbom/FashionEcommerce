<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Voucher;
use App\Services\Customer\CheckoutService;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    config(['services.biteship.api_key' => 'test-key']);
    foreach (['store_postal_code' => '60111', 'store_latitude' => '-7.28', 'store_longitude' => '112.80', 'origin_biteship_area_id' => 'IDNP-TEST', 'store_phone' => '081234567890'] as $key => $value) {
        SiteSetting::query()->create(compact('key', 'value'));
    }
    $this->customer = User::factory()->create();
    $this->address = CustomerAddress::query()->create([
        'user_id' => $this->customer->id, 'recipient_name' => 'Customer', 'recipient_phone' => '081234567890',
        'province' => 'Jawa Timur', 'city' => 'Surabaya', 'district' => 'Test', 'subdistrict' => 'Test',
        'postal_code' => '60111', 'biteship_area_id' => 'IDNP-TEST', 'latitude' => '-7.29', 'longitude' => '112.81', 'full_address' => 'Alamat sintetis',
    ]);
    $this->product = Product::query()->create(['name' => 'Paket', 'slug' => 'paket', 'sku' => 'PACKAGE', 'base_price' => 10000.25, 'weight' => 200, 'length' => 10, 'width' => 0, 'height' => null, 'status' => 'published']);
    $this->variant = ProductVariant::query()->create(['product_id' => $this->product->id, 'sku' => 'PACKAGE-M', 'stock' => 10, 'reserved_stock' => 0, 'is_active' => true]);
    $this->cart = Cart::query()->create(['user_id' => $this->customer->id]);
    $this->item = CartItem::query()->create(['cart_id' => $this->cart->id, 'product_id' => $this->product->id, 'product_variant_id' => $this->variant->id, 'quantity' => 3, 'price_snapshot' => 10000.25]);
    $this->pricing = ['pricing' => [['courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'duration' => '2 days', 'price' => 1000]]];
    Http::fake(['api.biteship.com/v1/rates/couriers' => function () {
        if (isset($this->providerMutation)) {
            ($this->providerMutation)();
        }

        return Http::response($this->pricing);
    }, 'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
        'token' => 'checkout-token', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/checkout-token',
    ])]);
    $this->checkout = app(CheckoutService::class);
    $rates = $this->checkout->shippingRates($this->customer, $this->address->id);
    $this->checkout->selectShippingRate($rates[0]['id']);
    $this->checkoutPayload = ['customer_address_id' => $this->address->id, 'shipping_rate_id' => $rates[0]['id'], 'idempotency_key' => 'checkout-integrity-key', 'no_return_refund_agreed' => true];
});

it('preserves shipping binding through voucher apply remove and place order', function (bool $remove) {
    $voucher = Voucher::query()->create(['code' => 'SAVE', 'name' => 'Test', 'discount_type' => 'fixed', 'discount_value' => 100.25, 'is_active' => true]);
    $binding = session('checkout.selected_rate_binding');
    $this->checkout->applyVoucher($this->customer, 'SAVE');
    if ($remove) {
        $this->checkout->removeVoucher($this->customer);
    }
    expect(session('checkout.selected_rate_binding'))->toBe($binding);
    $result = $this->checkout->placeOrder($this->customer, $this->checkoutPayload);
    $order = Order::query()->findOrFail($result['order_id']);
    expect((float) $order->grand_total)->toBe($remove ? 31001.0 : 30901.0)
        ->and((float) $order->payment->gross_amount)->toBe((float) $order->grand_total)
        ->and($order->items->first()->weight)->toBe(600)
        ->and($this->variant->refresh()->reserved_stock)->toBe(3)
        ->and($voucher->refresh()->used_count)->toBe($remove ? 0 : 1)
        ->and($order->payment->payment_provider)->toBe('midtrans')
        ->and($result['payment_state'])->toBe('ready')
        ->and($result['redirect_url'])->toBe('https://app.sandbox.midtrans.com/snap/v2/vtweb/checkout-token');
    Http::assertSent(fn ($request) => str_contains($request->url(), '/rates/couriers') && $request['items'][0]['weight'] === 200 && $request['items'][0]['quantity'] === 3);
    $this->assertDatabaseCount('cart_items', 0);
    expect($this->checkout->placeOrder($this->customer, $this->checkoutPayload))->toBe($result);
    $this->assertDatabaseCount('orders', 1);
})->with([false, true]);

it('rejects package mutations during provider recheck before persistence', function (string $field, mixed $value) {
    $this->providerMutation = function () use ($field, $value) {
        $this->product->update([$field => $value]);
    };
    expect(fn () => $this->checkout->placeOrder($this->customer, $this->checkoutPayload))->toThrow(ValidationException::class);
    $this->assertDatabaseCount('orders', 0);
    expect($this->variant->refresh()->reserved_stock)->toBe(0);
})->with([['weight', 201], ['length', 11], ['weight', 0]]);

it('commits refreshed prices before asking customer to choose shipping again', function () {
    $this->product->update(['base_price' => 12000]);
    expect(fn () => $this->checkout->placeOrder($this->customer, $this->checkoutPayload))->toThrow(ValidationException::class);
    expect((float) $this->item->refresh()->price_snapshot)->toBe(12000.0)
        ->and(session('checkout.selected_rate_binding'))->toBeNull()
        ->and($this->variant->refresh()->reserved_stock)->toBe(0);
    $this->assertDatabaseCount('orders', 0);
});

it('rejects changed address and missing gateway configuration without creating an order', function (string $mutation) {
    if ($mutation === 'address') {
        $this->address->update(['full_address' => 'Alamat berbeda']);
    } else {
        config(['services.midtrans.server_key' => null]);
    }
    expect(fn () => $this->checkout->placeOrder($this->customer, $this->checkoutPayload))->toThrow(ValidationException::class);
    $this->assertDatabaseCount('orders', 0);
    expect($this->variant->refresh()->reserved_stock)->toBe(0);
})->with(['address', 'gateway']);

it('does not require a support phone for Midtrans checkout', function () {
    SiteSetting::query()->where('key', 'store_phone')->update(['value' => null]);
    $result = $this->checkout->placeOrder($this->customer, $this->checkoutPayload);
    expect($result['payment_state'])->toBe('ready');
    $this->assertDatabaseCount('orders', 1);
});

it('exposes exact IDR rounding adjustment without changing historical snapshots', function () {
    $data = $this->checkout->pageData($this->customer);
    expect($data['summary']['total'])->toBe(31001.0)->and($data['summary']['rounding_adjustment'])->toBe(0.25);
});

it('rejects invalid rates while preserving legitimate free shipping', function (mixed $price, bool $accepted) {
    $this->pricing['pricing'][0]['price'] = $price;
    $rates = $this->checkout->shippingRates($this->customer, $this->address->id);
    expect($rates)->toHaveCount($accepted ? 1 : 0);
    if ($accepted) {
        expect($rates[0]['price'])->toBe(0.0);
    }
})->with([[null, false], ['', false], [-1, false], ['NaN', false], ['INF', false], [0, true]]);
