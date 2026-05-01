<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => "Women's Tops",
                'slug' => 'womens-tops',
                'description' => 'Koleksi atasan wanita untuk daily wear, office look, dan weekend style.',
                'image_url' => 'https://picsum.photos/seed/category-womens-tops/900/1200',
                'is_active' => true,
            ],
            [
                'name' => "Women's Dresses",
                'slug' => 'womens-dresses',
                'description' => 'Dress dengan siluet modern untuk momen kasual hingga acara spesial.',
                'image_url' => 'https://picsum.photos/seed/category-womens-dresses/900/1200',
                'is_active' => true,
            ],
            [
                'name' => "Men's Shirts",
                'slug' => 'mens-shirts',
                'description' => 'Pilihan kemeja pria dari bahan breathable untuk smart casual sampai formal.',
                'image_url' => 'https://picsum.photos/seed/category-mens-shirts/900/1200',
                'is_active' => true,
            ],
            [
                'name' => 'Outerwear',
                'slug' => 'outerwear',
                'description' => 'Layering pieces seperti blazer, cardigan, dan jacket dengan cutting rapi.',
                'image_url' => 'https://picsum.photos/seed/category-outerwear/900/1200',
                'is_active' => true,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Aksesori pelengkap gaya harian, dari hijab hingga tas statement.',
                'image_url' => 'https://picsum.photos/seed/category-accessories/900/1200',
                'is_active' => true,
            ],
            [
                'name' => 'Footwear',
                'slug' => 'footwear',
                'description' => 'Sepatu dengan fokus kenyamanan dan desain versatile untuk berbagai aktivitas.',
                'image_url' => 'https://picsum.photos/seed/category-footwear/900/1200',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
