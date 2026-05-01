<?php

namespace App\Services\Admin;

use App\Models\SiteSetting;
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
                ['key' => 'whatsapp_number', 'label' => 'WhatsApp Number', 'type' => 'string'],
                ['key' => 'store_address', 'label' => 'Store Address', 'type' => 'string', 'input' => 'textarea'],
                ['key' => 'store_logo', 'label' => 'Store Logo URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'store_favicon', 'label' => 'Store Favicon URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'instagram_url', 'label' => 'Instagram URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'tiktok_url', 'label' => 'TikTok URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'footer_text', 'label' => 'Footer Text', 'type' => 'string', 'input' => 'textarea'],
            ],
        ],
        'seo' => [
            'title' => 'SEO Settings',
            'description' => 'Atur metadata default yang dipakai saat halaman belum punya SEO khusus.',
            'fields' => [
                ['key' => 'default_meta_title', 'label' => 'Default Meta Title', 'type' => 'string'],
                ['key' => 'default_meta_description', 'label' => 'Default Meta Description', 'type' => 'string', 'input' => 'textarea'],
                ['key' => 'open_graph_image', 'label' => 'Open Graph Image URL', 'type' => 'string', 'input' => 'url'],
                ['key' => 'default_keywords', 'label' => 'Default Keywords', 'type' => 'string'],
            ],
        ],
        'payment' => [
            'title' => 'Payment Settings',
            'description' => 'Simpan konfigurasi pembayaran non-sensitif. Server key tetap dikelola dari .env.',
            'fields' => [
                ['key' => 'midtrans_environment', 'label' => 'Midtrans Environment', 'type' => 'string', 'input' => 'select', 'options' => ['sandbox', 'production']],
                ['key' => 'midtrans_client_key', 'label' => 'Midtrans Client Key', 'type' => 'string'],
                ['key' => 'payment_expiry_duration', 'label' => 'Payment Expiry Duration (minutes)', 'type' => 'number', 'input' => 'number'],
                ['key' => 'payment_service_fee', 'label' => 'Payment Service Fee', 'type' => 'number', 'input' => 'number'],
            ],
        ],
        'shipping' => [
            'title' => 'Shipping Settings',
            'description' => 'Kelola alamat asal pengiriman dan kurir aktif. API key Biteship tetap disimpan di .env.',
            'fields' => [
                ['key' => 'origin_address', 'label' => 'Origin Address', 'type' => 'string', 'input' => 'textarea'],
                ['key' => 'origin_province', 'label' => 'Origin Province', 'type' => 'string'],
                ['key' => 'origin_city', 'label' => 'Origin City', 'type' => 'string'],
                ['key' => 'origin_district', 'label' => 'Origin District', 'type' => 'string'],
                ['key' => 'store_postal_code', 'label' => 'Store Postal Code', 'type' => 'string'],
                ['key' => 'origin_biteship_area_id', 'label' => 'Origin Biteship Area ID', 'type' => 'string'],
                ['key' => 'shipper_name', 'label' => 'Shipper Name', 'type' => 'string'],
                ['key' => 'shipper_phone', 'label' => 'Shipper Phone', 'type' => 'string'],
                ['key' => 'enabled_couriers', 'label' => 'Enabled Couriers', 'type' => 'string'],
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
            'values' => SiteSetting::query()->whereIn('key', $keys)->pluck('value', 'key')->all(),
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
                    'value' => $this->normalizeValue($validated[$key]),
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
