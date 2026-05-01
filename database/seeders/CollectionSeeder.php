<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $collections = [
            [
                'name' => 'Summer Linen 2026',
                'slug' => 'summer-linen-2026',
                'description' => 'Edit koleksi linen ringan dengan warna netral untuk cuaca tropis.',
                'banner_desktop_url' => 'https://picsum.photos/seed/collection-summer-linen-desktop/1600/700',
                'banner_mobile_url' => 'https://picsum.photos/seed/collection-summer-linen-mobile/900/1200',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Eid Radiance',
                'slug' => 'eid-radiance',
                'description' => 'Pilihan outfit dan aksesori bernuansa elegan untuk momen perayaan.',
                'banner_desktop_url' => 'https://picsum.photos/seed/collection-eid-radiance-desktop/1600/700',
                'banner_mobile_url' => 'https://picsum.photos/seed/collection-eid-radiance-mobile/900/1200',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Workwear Essentials',
                'slug' => 'workwear-essentials',
                'description' => 'Koleksi office-ready dengan cutting clean untuk weekday wardrobe.',
                'banner_desktop_url' => 'https://picsum.photos/seed/collection-workwear-desktop/1600/700',
                'banner_mobile_url' => 'https://picsum.photos/seed/collection-workwear-mobile/900/1200',
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Weekend Casual',
                'slug' => 'weekend-casual',
                'description' => 'Item santai untuk aktivitas akhir pekan dengan material nyaman.',
                'banner_desktop_url' => 'https://picsum.photos/seed/collection-weekend-desktop/1600/700',
                'banner_mobile_url' => 'https://picsum.photos/seed/collection-weekend-mobile/900/1200',
                'is_featured' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Monochrome Studio',
                'slug' => 'monochrome-studio',
                'description' => 'Rangkaian item hitam-putih minimalis yang mudah dipadukan lintas season.',
                'banner_desktop_url' => 'https://picsum.photos/seed/collection-monochrome-desktop/1600/700',
                'banner_mobile_url' => 'https://picsum.photos/seed/collection-monochrome-mobile/900/1200',
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        foreach ($collections as $collection) {
            Collection::query()->updateOrCreate(
                ['slug' => $collection['slug']],
                $collection,
            );
        }
    }
}
