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
                'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                'is_active' => true,
            ],
            [
                'name' => "Women's Dresses",
                'slug' => 'womens-dresses',
                'description' => 'Dress dengan siluet modern untuk momen kasual hingga acara spesial.',
                'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                'is_active' => true,
            ],
            // [
            //     'name' => "Men's Shirts",
            //     'slug' => 'mens-shirts',
            //     'description' => 'Pilihan kemeja pria dari bahan breathable untuk smart casual sampai formal.',
            //     'image_url' => 'https://images.unsplash.com/photo-1772474511860-9cef46d98ea6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            //     'is_active' => true,
            // ],
            [
                'name' => 'Outerwear',
                'slug' => 'outerwear',
                'description' => 'Layering pieces seperti blazer, cardigan, dan jacket dengan cutting rapi.',
                'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                'is_active' => true,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'description' => 'Aksesori pelengkap gaya harian, dari hijab hingga tas statement.',
                'image_url' => '/FotoShayda/A450596C-21FD-44B9-9442-BF5985F7EC04.JPEG',
                'is_active' => true,
            ],
            // [
            //     'name' => 'Footwear',
            //     'slug' => 'footwear',
            //     'description' => 'Sepatu dengan fokus kenyamanan dan desain versatile untuk berbagai aktivitas.',
            //     'image_url' => 'https://images.unsplash.com/photo-1584339312444-6952d098e152?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            //     'is_active' => true,
            // ],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category,
            );
        }
    }
}
