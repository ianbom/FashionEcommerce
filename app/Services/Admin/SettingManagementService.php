<?php

namespace App\Services\Admin;

use App\Models\SiteSetting;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class SettingManagementService
{
    private array $sections = [
        'store' => [
            'title' => 'Store Settings',
            'description' => 'Kelola identitas toko, kontak, dan link sosial yang tampil di website.',
            'fields' => [
                ['key' => 'store_name', 'label' => 'Store Name', 'type' => 'string'],
                ['key' => 'store_email', 'label' => 'Store Email', 'type' => 'string', 'input' => 'email'],
                ['key' => 'store_phone', 'label' => 'Store Phone', 'type' => 'string'],
                ['key' => 'instagram_url', 'label' => 'Instagram URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'tiktok_url', 'label' => 'TikTok URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'footer_text', 'label' => 'Footer Text', 'type' => 'string', 'input' => 'textarea'],
            ],
        ],
        'payment' => [
            'title' => 'Payment Settings',
            'description' => 'Checkout menggunakan Midtrans. Kredensial dan environment Midtrans dikelola melalui konfigurasi server. Informasi rekening tetap dipakai untuk pesanan manual lama.',
            'fields' => [
                ['key' => 'payment_expiry_duration', 'label' => 'Durasi Pembayaran (menit, 1-10080)', 'type' => 'number', 'input' => 'number'],
                ['key' => 'bank_name', 'label' => 'Bank Name', 'type' => 'string'],
                ['key' => 'bank_account_number', 'label' => 'Bank Account Number', 'type' => 'string'],
                ['key' => 'bank_account_name', 'label' => 'Bank Account Holder', 'type' => 'string'],
                ['key' => 'payment_service_fee', 'label' => 'Payment Service Fee', 'type' => 'number', 'input' => 'number'],
            ],
        ],
        'shipping' => [
            'title' => 'Shipping Settings',
            'description' => 'Kelola alamat asal pengiriman dan kurir aktif. API key Biteship tetap disimpan di .env.',
            'fields' => [
                ['key' => 'store_postal_code', 'label' => 'Store Postal Code', 'type' => 'string'],
                ['key' => 'origin_address', 'label' => 'Origin Address', 'type' => 'string', 'input' => 'textarea'],
                ['key' => 'origin_province', 'label' => 'Origin Province', 'type' => 'string'],
                ['key' => 'origin_city', 'label' => 'Origin City', 'type' => 'string'],
                ['key' => 'origin_district', 'label' => 'Origin District', 'type' => 'string'],
                ['key' => 'origin_biteship_area_id', 'label' => 'Origin Biteship Area ID', 'type' => 'string'],
                ['key' => 'store_latitude', 'label' => 'Store Latitude', 'type' => 'string', 'input' => 'number'],
                ['key' => 'store_longitude', 'label' => 'Store Longitude', 'type' => 'string', 'input' => 'number'],
                ['key' => 'shipping_couriers', 'label' => 'Shipping Couriers', 'type' => 'string'],
            ],
        ],
    ];

    public function indexData(Request $request): array
    {
        $activeSection = (string) $request->route('section', 'store');
        abort_unless(array_key_exists($activeSection, $this->sections), 404);

        $keys = $this->fields()->pluck('key')->all();

        return [
            'activeSection' => $activeSection,
            'sections' => $this->sections,
            'values' => array_replace([
                'payment_expiry_duration' => '1440',
            ], SiteSetting::query()->whereIn('key', $keys)->pluck('value', 'key')->all()),
        ];
    }

    public function update(array $validated): void
    {
        foreach ($this->fields() as $field) {
            $key = $field['key'];

            if (! array_key_exists($key, $validated)) {
                continue;
            }

            SiteSetting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'value' => $key === 'store_phone'
                        ? SiteSettingService::normalizePhone($validated[$key])
                        : $this->normalizeValue($validated[$key]),
                    'type' => $field['type'],
                ],
            );
        }
    }

    private function fields(): Collection
    {
        return collect($this->sections)->flatMap(fn (array $section): array => $section['fields'])->values();
    }

    private function normalizeValue(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_THROW_ON_ERROR);
        }

        return (string) $value;
    }
}
