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
            ['key' => 'store_tagline',          'value' => 'Modest. Elegant. Timeless.',                'type' => 'string'],
            ['key' => 'store_description',      'value' => "Brand fashion muslimah premium yang menghadirkan koleksi abaya, khimar, dan busana modest berkualitas tinggi untuk wanita Indonesia modern.", 'type' => 'text'],
            ['key' => 'store_logo_url',         'value' => '/images/logo.png',                          'type' => 'string'],
            ['key' => 'store_favicon_url',      'value' => '/images/favicon.ico',                       'type' => 'string'],
            ['key' => 'store_currency',         'value' => 'IDR',                                       'type' => 'string'],
            ['key' => 'store_currency_symbol',  'value' => 'Rp',                                        'type' => 'string'],
            ['key' => 'store_language',         'value' => 'id',                                        'type' => 'string'],
            ['key' => 'store_timezone',         'value' => 'Asia/Jakarta',                              'type' => 'string'],
            ['key' => 'store_postal_code',       'value' => "60111",                                    'type' => 'string'],

            // ─── Contact & Location ──────────────────────────────────────────────
            ['key' => 'contact_email',          'value' => 'hello@aureasyrari.com',                     'type' => 'string'],
            ['key' => 'contact_phone',          'value' => '+62 812-3456-7890',                         'type' => 'string'],
            ['key' => 'contact_whatsapp',       'value' => '6281234567890',                             'type' => 'string'],
            ['key' => 'contact_address',        'value' => 'Jl. Pahlawan No. 88, Surabaya, Jawa Timur 60123, Indonesia', 'type' => 'text'],
            ['key' => 'contact_maps_url',       'value' => 'https://maps.google.com/?q=Surabaya',       'type' => 'string'],
            ['key' => 'business_hours',         'value' => 'Senin – Jumat: 09.00–17.00 WIB | Sabtu: 09.00–13.00 WIB', 'type' => 'string'],

            // ─── Social Media ────────────────────────────────────────────────────
            ['key' => 'social_instagram',       'value' => 'https://instagram.com/aureasyrari',         'type' => 'string'],
            ['key' => 'social_tiktok',          'value' => 'https://tiktok.com/@aureasyrari',           'type' => 'string'],
            ['key' => 'social_facebook',        'value' => 'https://facebook.com/aureasyrari',          'type' => 'string'],
            ['key' => 'social_youtube',         'value' => 'https://youtube.com/@aureasyrari',          'type' => 'string'],
            ['key' => 'social_pinterest',       'value' => 'https://pinterest.com/aureasyrari',         'type' => 'string'],

            // ─── SEO ─────────────────────────────────────────────────────────────
            ['key' => 'seo_meta_title',         'value' => "Auréa Syar'i — Fashion Muslimah Premium",  'type' => 'string'],
            ['key' => 'seo_meta_description',   'value' => "Temukan koleksi abaya, khimar, hijab, dan busana muslimah premium dari Auréa Syar'i. Kualitas terbaik, pengiriman cepat ke seluruh Indonesia.", 'type' => 'text'],
            ['key' => 'seo_meta_keywords',      'value' => 'abaya, khimar, hijab, gamis, busana muslimah, fashion syar\'i, baju muslim, baju lebaran', 'type' => 'string'],
            ['key' => 'seo_og_image_url',       'value' => '/images/og-image.jpg',                     'type' => 'string'],
            ['key' => 'seo_google_analytics_id','value' => '',                                          'type' => 'string'],
            ['key' => 'seo_facebook_pixel_id',  'value' => '',                                          'type' => 'string'],
            ['key' => 'seo_tiktok_pixel_id',    'value' => '',                                          'type' => 'string'],

            // ─── Shipping ────────────────────────────────────────────────────────
            ['key' => 'shipping_free_minimum',  'value' => '300000',                                    'type' => 'integer'],
            ['key' => 'shipping_default_weight','value' => '300',                                       'type' => 'integer'],
            ['key' => 'shipping_origin_city_id','value' => '444',                                       'type' => 'string'],
            ['key' => 'shipping_couriers',      'value' => 'jne,jnt,sicepat,anteraja',                  'type' => 'string'],
            ['key' => 'shipping_enable_same_day','value' => '1',                                        'type' => 'boolean'],

            // ─── Payment ─────────────────────────────────────────────────────────
            ['key' => 'payment_gateway',        'value' => 'midtrans',                                  'type' => 'string'],
            ['key' => 'payment_midtrans_env',   'value' => 'sandbox',                                   'type' => 'string'],
            ['key' => 'payment_bank_transfer',  'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'payment_ewallet',        'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'payment_cod',            'value' => '0',                                         'type' => 'boolean'],

            // ─── Promo & Vouchers ────────────────────────────────────────────────
            ['key' => 'promo_enable_vouchers',  'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'promo_new_member_discount','value' => '10',                                      'type' => 'integer'],
            ['key' => 'promo_referral_enabled', 'value' => '0',                                         'type' => 'boolean'],

            // ─── Notifications ───────────────────────────────────────────────────
            ['key' => 'notif_order_email',      'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'notif_order_whatsapp',   'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'notif_promo_email',      'value' => '1',                                         'type' => 'boolean'],
            ['key' => 'notif_low_stock_threshold','value' => '5',                                       'type' => 'integer'],
            ['key' => 'notif_low_stock_email',  'value' => 'admin@aureasyrari.com',                     'type' => 'string'],

            // ─── Store Features ──────────────────────────────────────────────────
            ['key' => 'feature_reviews_enabled','value' => '1',                                         'type' => 'boolean'],
            ['key' => 'feature_wishlist_enabled','value' => '1',                                        'type' => 'boolean'],
            ['key' => 'feature_preorder_enabled','value' => '0',                                        'type' => 'boolean'],
            ['key' => 'feature_maintenance_mode','value' => '0',                                        'type' => 'boolean'],
            ['key' => 'feature_guest_checkout', 'value' => '0',                                         'type' => 'boolean'],

            // ─── Appearance ──────────────────────────────────────────────────────
            ['key' => 'appearance_primary_color',  'value' => '#422d25',                                'type' => 'string'],
            ['key' => 'appearance_secondary_color','value' => '#c9a97a',                                'type' => 'string'],
            ['key' => 'appearance_hero_layout',   'value' => 'slider',                                  'type' => 'string'],
            ['key' => 'appearance_products_per_page','value' => '12',                                   'type' => 'integer'],
            ['key' => 'appearance_footer_text',   'value' => "© 2026 Auréa Syar'i. Seluruh hak cipta dilindungi.", 'type' => 'string'],

            // ─── Legal ───────────────────────────────────────────────────────────
            ['key' => 'legal_company_name',     'value' => "PT Auréa Syar'i Nusantara",                 'type' => 'string'],
            ['key' => 'legal_npwp',             'value' => '',                                          'type' => 'string'],
            ['key' => 'legal_siup',             'value' => '',                                          'type' => 'string'],
        ];

        foreach ($settings as &$setting) {
            $setting['created_at'] = $now;
            $setting['updated_at'] = $now;
        }

        DB::table('site_settings')->upsert(
            $settings,
            ['key'],             // unique column to match on
            ['value', 'type', 'updated_at']  // columns to update if exists
        );
    }
}
