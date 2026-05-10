<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $settings = [
            // ─── Store Identity ──────────────────────────────────────────────────
            ['key' => 'store_name',             'value' => "Auréa Syar'i",                              'type' => 'string'],
            ['key' => 'store_email',            'value' => 'hello@aureasyari.id',                        'type' => 'string'],
            ['key' => 'store_phone',            'value' => '+62 812-3456-7890',                          'type' => 'string'],
            ['key' => 'whatsapp_number',        'value' => '6281234567890',                              'type' => 'string'],
            ['key' => 'store_address',          'value' => 'Jl. Pahlawan No. 88, Surabaya, Jawa Timur 60123, Indonesia', 'type' => 'text'],
            ['key' => 'instagram_url',          'value' => 'https://instagram.com/itsarsyari.id',        'type' => 'string'],
            ['key' => 'tiktok_url',             'value' => 'https://tiktok.com/@itsarsyari.id',          'type' => 'string'],
            ['key' => 'footer_text',            'value' => "© 2026 Auréa Syar'i. Seluruh hak cipta dilindungi.", 'type' => 'text'],

            ['key' => 'store_latitude',       'value' => '-7.2871053',                                    'type' => 'string'],
            ['key' => 'store_longitude',       'value' => '112.8026283',                                    'type' => 'string'],

            // ─── Contact & Location ──────────────────────────────────────────────
            ['key' => 'contact_phone',          'value' => '+62 812-3456-7890',                         'type' => 'string'],
            ['key' => 'contact_address',        'value' => 'Jl. Pahlawan No. 88, Surabaya, Jawa Timur 60123, Indonesia', 'type' => 'text'],
            ['key' => 'contact_maps_url',       'value' => 'https://maps.google.com/?q=Surabaya',       'type' => 'string'],
            ['key' => 'business_hours',         'value' => 'Senin – Jumat: 09.00–17.00 WIB | Sabtu: 09.00–13.00 WIB', 'type' => 'string'],

            // ─── Shipping ────────────────────────────────────────────────────────
            ['key' => 'origin_address',         'value' => 'Jl. Pahlawan No. 88, Surabaya, Jawa Timur 60123, Indonesia', 'type' => 'text'],
            ['key' => 'origin_province',        'value' => 'Jawa Timur',                                'type' => 'string'],
            ['key' => 'origin_city',            'value' => 'Surabaya',                                  'type' => 'string'],
            ['key' => 'origin_district',        'value' => 'Genteng',                                   'type' => 'string'],
            ['key' => 'shipper_name',           'value' => 'Auréa Syar\'i Warehouse',                  'type' => 'string'],
            ['key' => 'shipper_phone',          'value' => '+62 812-3456-7890',                         'type' => 'string'],
            ['key' => 'shipping_couriers',      'value' => 'jne,jnt,sicepat,anteraja',                  'type' => 'string'],
            ['key' => 'store_postal_code',       'value' => '60111',                                    'type' => 'string'],

            // ─── Payment ─────────────────────────────────────────────────────────
            ['key' => 'payment_expiry_duration', 'value' => '1440',                                      'type' => 'integer'],
            ['key' => 'payment_service_fee',    'value' => '0',                                         'type' => 'integer'],

        ];

        foreach ($settings as &$setting) {
            $setting['created_at'] = $now;
            $setting['updated_at'] = $now;
        }

        DB::table('site_settings')->where('key', 'enabled_couriers')->delete();

        DB::table('site_settings')->upsert(
            $settings,
            ['key'],             // unique column to match on
            ['value', 'type', 'updated_at']  // columns to update if exists
        );
    }
}
