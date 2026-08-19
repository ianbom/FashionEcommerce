<?php

namespace App\Services\Customer;

use App\Models\Order;
use App\Services\Settings\SiteSettingService;

class WhatsAppOrderMessage
{
    public function __construct(private readonly SiteSettingService $settings) {}

    public function url(Order $order): string
    {
        $order->loadMissing('items');
        $number = preg_replace('/\D+/', '', (string) $this->settings->first(['payment_whatsapp_number', 'whatsapp_number'], '6285736426304 '));
        $divider = '━━━━━━━━━━━━━━━━━━━━';
        $lines = [
            'Halo Kak ',
            '',
            'Saya ingin melakukan *pembayaran manual* untuk pesanan berikut:',
            '',
            $divider,
            ' *DETAIL PESANAN*',
            $divider,
            '',
            '*Kode Order:*',
            $order->order_number,
            '',
            '*Produk:*',
        ];

        foreach ($order->items as $index => $item) {
            if ($index > 0) {
                $lines[] = '';
            }

            $lines[] = $item->product_name;
            $lines[] = '';
            $lines[] = '• SKU: '.($item->variant_sku ?: $item->product_sku ?: '-');
            $lines[] = '• Warna: '.($item->color_name ?: '-');
            $lines[] = '• Ukuran: '.($item->size ?: '-');
            $lines[] = "• Jumlah: {$item->quantity}";
            $lines[] = '• Harga: Rp'.$this->money($item->subtotal);
        }

        $lines[] = '';
        $lines[] = $divider;
        $lines[] = '*RINCIAN PEMBAYARAN*';
        $lines[] = $divider;
        $lines[] = '';
        $lines[] = 'Subtotal: Rp'.$this->money($order->subtotal);
        $lines[] = 'Diskon: Rp'.$this->money($order->discount_amount);
        $lines[] = 'Ongkir: Rp'.$this->money($order->shipping_cost);
        $lines[] = 'Biaya Layanan: Rp'.$this->money($order->service_fee);
        $lines[] = '';
        $lines[] = '*TOTAL: Rp'.$this->money($order->grand_total).'*';
        $lines[] = '';
        $lines[] = '*Transfer ke rekening:*';
        $lines[] = 'Bank: '.($this->settings->get('bank_name') ?: '-');
        $lines[] = 'Nomor rekening: '.($this->settings->get('bank_account_number') ?: '-');
        $lines[] = 'Atas nama: '.($this->settings->get('bank_account_name') ?: '-');
        $lines[] = '';
        $lines[] = 'Terima kasih 🙏';

        return "https://wa.me/{$number}?text=".rawurlencode(implode("\n", $lines));
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 0, ',', '.');
    }
}
