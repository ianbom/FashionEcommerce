<?php

use App\Models\Order;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Customer\WhatsAppOrderMessage;

it('builds a manual transfer WhatsApp URL from an order snapshot', function () {
    SiteSetting::query()->insert([
        ['key' => 'whatsapp_number', 'value' => '6285736426304 '],
        ['key' => 'bank_name', 'value' => 'BCA'],
        ['key' => 'bank_account_number', 'value' => '1234567890'],
        ['key' => 'bank_account_name', 'value' => 'Aurea Syari'],
    ]);

    $user = User::factory()->create();
    $order = Order::query()->create([
        'user_id' => $user->id,
        'order_number' => 'ORD-TEST-001',
        'customer_name' => 'Customer',
        'customer_email' => $user->email,
        'customer_phone' => '081234567890',
        'subtotal' => 100000,
        'discount_amount' => 10000,
        'shipping_cost' => 15000,
        'service_fee' => 0,
        'grand_total' => 105000,
    ]);

    $order->items()->create([
        'product_name' => 'Abaya Test',
        'variant_sku' => 'ABAYA-BLK-M',
        'size' => 'M',
        'color_name' => 'Black',
        'price' => 100000,
        'quantity' => 1,
        'subtotal' => 100000,
    ]);

    $url = app(WhatsAppOrderMessage::class)->url($order->fresh('items'));

    expect($url)->toStartWith('https://wa.me/6285736426304 ?text=')
        ->and(urldecode(parse_url($url, PHP_URL_QUERY)))->toContain(
            'Halo Kak 👋',
            '🧾 *DETAIL PESANAN*',
            '*Kode Order:*',
            'ORD-TEST-001',
            '• SKU: ABAYA-BLK-M',
            '• Warna: Black',
            '• Ukuran: M',
            '• Jumlah: 1',
            '• Harga: Rp100.000',
            '💰 *RINCIAN PEMBAYARAN*',
            '*TOTAL: Rp105.000*',
            'Terima kasih 🙏',
        );
});
