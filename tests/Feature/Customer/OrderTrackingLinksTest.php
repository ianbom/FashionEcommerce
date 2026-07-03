<?php

use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createOrderWithShipmentLink(User $user, array $shipment = []): Order
{
    $order = Order::query()->create([
        'user_id' => $user->id,
        'order_number' => 'ORD-LINK-1',
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'customer_phone' => '081234567890',
        'subtotal' => 100000,
        'shipping_cost' => 10000,
        'grand_total' => 110000,
        'payment_status' => 'paid',
        'order_status' => 'shipped',
        'shipping_status' => 'in_transit',
    ]);

    $order->items()->create([
        'product_name' => 'Khimar',
        'price' => 100000,
        'quantity' => 1,
        'subtotal' => 100000,
        'weight' => 500,
    ]);

    $order->shipment()->create([
        'shipping_provider' => 'biteship',
        'courier_company' => 'anteraja',
        'courier_type' => 'same_day',
        'shipping_cost' => 10000,
        'shipping_status' => 'in_transit',
        ...$shipment,
    ]);

    return $order->refresh();
}

test('order list exposes tracking url from Biteship raw courier link', function () {
    $user = User::factory()->create();
    createOrderWithShipmentLink($user, [
        'raw_order_response' => [
            'courier' => [
                'link' => 'https://track.biteship.test/order-1',
            ],
        ],
    ]);

    $this->actingAs($user)
        ->get(route('my-order'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/order/my-order')
            ->where('orders.data.0.shipment.tracking_url', 'https://track.biteship.test/order-1'));
});

test('order detail exposes tracking and whatsapp support urls', function () {
    $user = User::factory()->create();
    $order = createOrderWithShipmentLink($user, [
        'raw_order_response' => [
            'courier_link' => 'https://track.biteship.test/order-2',
        ],
    ]);
    SiteSetting::query()->create(['key' => 'whatsapp_number', 'value' => '081234567890']);

    $this->actingAs($user)
        ->get(route('order.detail', $order))
        ->assertInertia(fn (Assert $page) => $page
            ->component('customer/order/detail-order')
            ->where('order.shipment.tracking_url', 'https://track.biteship.test/order-2')
            ->where('support.whatsapp_url', 'https://wa.me/6281234567890?text=Halo%2C%20saya%20butuh%20bantuan%20untuk%20pesanan%20ORD-LINK-1.'));
});
