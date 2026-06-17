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
                'title' => 'Ramadan Collection 2026',
                'subtitle' => 'Elegan & Anggun untuk Momen Spesialmu',
                'image_desktop_url' => '/banner/banner-1.png',
                'image_mobile_url' => '/banner/banner-1.png',
                'button_text' => 'Belanja Sekarang',
                'button_url' => '/list',
                'placement' => 'homepage',
                'sort_order' => 0,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Eid Signature Series',
                'subtitle' => 'Tampil Memukau di Hari Kemenangan',
                'image_desktop_url' => '/banner/banner-2.png',
                'image_mobile_url' => '/banner/banner-2.png',
                'button_text' => 'Lihat Koleksi',
                'button_url' => '/list',
                'placement' => 'homepage',
                'sort_order' => 1,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Daily Essentials — Modest & Modern',
                'subtitle' => 'Koleksi Harian yang Nyaman Sepanjang Hari',
                'image_desktop_url' => '/banner/banner-3.png',
                'image_mobile_url' => '/banner/banner-3.png',
                'button_text' => 'Temukan Koleksi',
                'button_url' => '/list',
                'placement' => 'homepage',
                'sort_order' => 2,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // ─── Collection Banners ──────────────────────────────────────────────
            [
                'title' => 'Koleksi Abaya Terbaru',
                'subtitle' => 'Abaya Premium dengan Material Berkualitas Tinggi',
                'image_desktop_url' => 'https://plus.unsplash.com/premium_photo-1676925875911-7f46961f8193?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'image_mobile_url' => 'https://plus.unsplash.com/premium_photo-1676925875911-7f46961f8193?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'button_text' => 'Shop Abaya',
                'button_url' => '/list',
                'placement' => 'collection',
                'sort_order' => 1,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Hijab & Khimar Pilihan',
                'subtitle' => 'Warna-warna Elegan untuk Setiap Kesempatan',
                'image_desktop_url' => 'https://images.unsplash.com/photo-1655909961998-7d92664b2ecb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'image_mobile_url' => 'https://images.unsplash.com/photo-1655909961998-7d92664b2ecb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'button_text' => 'Lihat Semua',
                'button_url' => '/list',
                'placement' => 'collection',
                'sort_order' => 2,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // ─── CTA Banner ──────────────────────────────────────────────────────
            [
                'title' => 'Flash Sale — Up to 30% Off',
                'subtitle' => 'Promo Terbatas! Dapatkan Penawaran Terbaik Hari Ini',
                'image_desktop_url' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&auto=format&fit=crop',
                'image_mobile_url' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=768&auto=format&fit=crop',
                'button_text' => 'Klaim Diskon',
                'button_url' => '/list',
                'placement' => 'cta',
                'sort_order' => 0,
                'is_active' => true,
                'starts_at' => null,
                'ends_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
