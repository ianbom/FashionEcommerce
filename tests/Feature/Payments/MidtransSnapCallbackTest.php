<?php

use App\Models\Order;
use App\Models\User;
use App\Services\Integrations\MidtransService;
use Illuminate\Support\Facades\Http;

it('sends my order as Midtrans finish callback', function () {
    config(['services.midtrans.server_key' => 'test-server-key']);

    $user = User::factory()->create();
    $order = Order::query()->create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-001',
        'customer_name' => 'Customer',
        'customer_email' => 'customer@example.test',
        'customer_phone' => '081234567890',
        'subtotal' => 100000,
        'discount_amount' => 0,
        'shipping_cost' => 10000,
        'service_fee' => 0,
        'grand_total' => 110000,
        'payment_status' => 'pending',
        'order_status' => 'pending_payment',
        'shipping_status' => 'not_created',
    ]);
    $order->address()->create([
        'recipient_name' => 'Customer',
        'recipient_phone' => '081234567890',
        'province' => 'Jawa Timur',
        'city' => 'Surabaya',
        'district' => 'Sukolilo',
        'postal_code' => '60111',
        'full_address' => 'Jl Testing',
    ]);
    $order->items()->create([
        'product_name' => 'Produk Test',
        'product_sku' => 'SKU-1',
        'price' => 100000,
        'quantity' => 1,
        'subtotal' => 100000,
        'weight' => 500,
    ]);

    Http::fake([
        'app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'snap-token',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token',
        ]),
    ]);

    app(MidtransService::class)->createSnapTransaction($order);

    Http::assertSent(fn ($request): bool => $request->url() === 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        && $request['callbacks']['finish'] === route('my-order'));
});
