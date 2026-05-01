<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('banners')->insert([
            // ─── Homepage Hero Banners ───────────────────────────────────────────
            [
                'title'              => 'Ramadan Collection 2026',
                'subtitle'           => 'Elegan & Anggun untuk Momen Spesialmu',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1665607959034-6ad37e6baa3f?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1665607959034-6ad37e6baa3f?w=768&auto=format&fit=crop',
                'button_text'        => 'Belanja Sekarang',
                'button_url'         => '/collections/ramadan-collection',
                'placement'          => 'homepage',
                'sort_order'         => 1,
                'is_active'          => true,
                'starts_at'          => $now,
                'ends_at'            => $now->copy()->addDays(30),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'title'              => 'Eid Signature Series',
                'subtitle'           => 'Tampil Memukau di Hari Kemenangan',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=768&auto=format&fit=crop',
                'button_text'        => 'Lihat Koleksi',
                'button_url'         => '/collections/eid-signature',
                'placement'          => 'homepage',
                'sort_order'         => 2,
                'is_active'          => true,
                'starts_at'          => $now,
                'ends_at'            => $now->copy()->addDays(30),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'title'              => 'Daily Essentials — Modest & Modern',
                'subtitle'           => 'Koleksi Harian yang Nyaman Sepanjang Hari',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=768&auto=format&fit=crop',
                'button_text'        => 'Temukan Koleksi',
                'button_url'         => '/collections/daily-essentials',
                'placement'          => 'homepage',
                'sort_order'         => 3,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Category Page Banners ───────────────────────────────────────────
            [
                'title'              => 'Koleksi Abaya Terbaru',
                'subtitle'           => 'Abaya Premium dengan Material Berkualitas Tinggi',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1621570169561-26cce4221146?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1621570169561-26cce4221146?w=768&auto=format&fit=crop',
                'button_text'        => 'Shop Abaya',
                'button_url'         => '/categories/abaya',
                'placement'          => 'category',
                'sort_order'         => 1,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'title'              => 'Hijab & Khimar Pilihan',
                'subtitle'           => 'Warna-warna Elegan untuk Setiap Kesempatan',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1607582451862-231cb7933f7c?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1607582451862-231cb7933f7c?w=768&auto=format&fit=crop',
                'button_text'        => 'Lihat Semua',
                'button_url'         => '/categories/hijab',
                'placement'          => 'category',
                'sort_order'         => 2,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Promo / Sale Banners ────────────────────────────────────────────
            [
                'title'              => 'Flash Sale — Up to 30% Off',
                'subtitle'           => 'Promo Terbatas! Dapatkan Penawaran Terbaik Hari Ini',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=768&auto=format&fit=crop',
                'button_text'        => 'Klaim Diskon',
                'button_url'         => '/sale',
                'placement'          => 'promo',
                'sort_order'         => 1,
                'is_active'          => true,
                'starts_at'          => $now,
                'ends_at'            => $now->copy()->addDays(7),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Popup Banner ────────────────────────────────────────────────────
            [
                'title'              => 'Daftar & Dapatkan Diskon 10%',
                'subtitle'           => 'Bergabung sekarang dan nikmati diskon untuk pembelian pertamamu',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=600&auto=format&fit=crop',
                'image_mobile_url'   => null,
                'button_text'        => 'Daftar Gratis',
                'button_url'         => '/register',
                'placement'          => 'popup',
                'sort_order'         => 1,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Sidebar Banner ──────────────────────────────────────────────────
            [
                'title'              => 'New Arrivals',
                'subtitle'           => 'Koleksi Terbaru Setiap Minggu',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=400&auto=format&fit=crop',
                'image_mobile_url'   => null,
                'button_text'        => 'Lihat Terbaru',
                'button_url'         => '/new-arrivals',
                'placement'          => 'sidebar',
                'sort_order'         => 1,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Expired / Inactive (for testing) ───────────────────────────────
            [
                'title'              => 'Harbolnas 12.12 — Super Sale!',
                'subtitle'           => 'Diskon Besar-Besaran Khusus Hari Belanja Nasional',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => null,
                'button_text'        => 'Belanja Sekarang',
                'button_url'         => '/sale/harbolnas',
                'placement'          => 'homepage',
                'sort_order'         => 10,
                'is_active'          => false,
                'starts_at'          => $now->copy()->subDays(60),
                'ends_at'            => $now->copy()->subDays(30),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
        ]);
    }
}
