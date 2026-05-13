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
                'image_desktop_url'  => 'https://d2kchovjbwl1tk.cloudfront.net/vendors/6241/assets/image/1771239194426-ITSAR_-_Banner_Website_Desktop_Fullscreen_resized2048-png.webp',
                'image_mobile_url'   => 'https://d2kchovjbwl1tk.cloudfront.net/vendors/6241/assets/image/1771239194426-ITSAR_-_Banner_Website_Desktop_Fullscreen_resized2048-png.webp',
                'button_text'        => 'Belanja Sekarang',
                'button_url'         => '/list',
                'placement'          => 'homepage',
                'sort_order'         => 0,
                'is_active'          => true,
                'starts_at'          => $now,
                'ends_at'            => $now->copy()->addDays(30),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                'title'              => 'Eid Signature Series',
                'subtitle'           => 'Tampil Memukau di Hari Kemenangan',
                'image_desktop_url'  => 'https://d2kchovjbwl1tk.cloudfront.net/vendors/6241/assets/image/1701688694301-1_resized2048-jpg.webp',
                'image_mobile_url'   => 'https://d2kchovjbwl1tk.cloudfront.net/vendors/6241/assets/image/1701688694301-1_resized2048-jpg.webp',
                'button_text'        => 'Lihat Koleksi',
                'button_url'         => '/list',
                'placement'          => 'homepage',
                'sort_order'         => 1,
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
                'sort_order'         => 2,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── Collection Banners ──────────────────────────────────────────────
            [
                'title'              => 'Koleksi Abaya Terbaru',
                'subtitle'           => 'Abaya Premium dengan Material Berkualitas Tinggi',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1621570169561-26cce4221146?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1621570169561-26cce4221146?w=768&auto=format&fit=crop',
                'button_text'        => 'Shop Abaya',
                'button_url'         => '/categories/abaya',
                'placement'          => 'collection',
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
                'placement'          => 'collection',
                'sort_order'         => 2,
                'is_active'          => true,
                'starts_at'          => null,
                'ends_at'            => null,
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ─── CTA Banner ──────────────────────────────────────────────────────
            [
                'title'              => 'Flash Sale — Up to 30% Off',
                'subtitle'           => 'Promo Terbatas! Dapatkan Penawaran Terbaik Hari Ini',
                'image_desktop_url'  => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&auto=format&fit=crop',
                'image_mobile_url'   => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=768&auto=format&fit=crop',
                'button_text'        => 'Klaim Diskon',
                'button_url'         => '/sale',
                'placement'          => 'cta',
                'sort_order'         => 0,
                'is_active'          => true,
                'starts_at'          => $now,
                'ends_at'            => $now->copy()->addDays(7),
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
        ]);
    }
}
