<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Najran Piping Lace Abaya',
                'slug' => 'najran-piping-lace-abaya',
                'sku' => 'ITS-ABY-NAJ-001',
                'short_description' => 'Abaya slim cutting dengan piping detail dan lace patch di bagian siku.',
                'description' => 'Referensi katalog Itsar Syar\'i Hajj Series. Abaya elegan untuk daily hingga semi-formal, memakai material Mina Anti-UV dengan detail piping premium dan lace.',
                'material' => 'Mina Anti-UV, premium piping list, lace detail',
                'care_instruction' => 'Cuci tangan lembut, gunakan deterjen ringan, jemur teduh, setrika suhu rendah dari sisi dalam.',
                'base_price' => 739000,
                'sale_price' => null,
                'weight' => 500,
                'length' => 36,
                'width' => 28,
                'height' => 5,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'meta_title' => 'Najran Piping Lace Abaya | Itsar Syar\'i Inspired Catalog',
                'meta_description' => 'Najran Piping Lace Abaya dengan cutting ramping, piping detail, dan lace patch elegan.',
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Abargo (Abaya Cargo)',
                'slug' => 'abargo-abaya-cargo',
                'sku' => 'ITS-ABY-ABG-002',
                'short_description' => 'Abaya cargo kasual-elegan dengan 3D pocket dan overstitch.',
                'description' => 'Referensi katalog Itsar Syar\'i. Abargo adalah Abaya Cargo dengan pocket 3D, detail overstitch, dan kancing premium untuk tampilan casual syar\'i.',
                'material' => 'Premium Anti-UV',
                'care_instruction' => 'Cuci tangan atau mesin mode lembut, pisahkan warna gelap, hindari pemutih.',
                'base_price' => 779000,
                'sale_price' => null,
                'weight' => 500,
                'length' => 36,
                'width' => 28,
                'height' => 5,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => true,
                'is_best_seller' => false,
                'meta_title' => 'Abargo Abaya Cargo | Itsar Syar\'i Inspired Catalog',
                'meta_description' => 'Abargo Abaya Cargo dengan 3D pocket, overstitch, dan material premium Anti-UV.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'summer-linen-2026',
                'name' => 'Kufah Khimar',
                'slug' => 'kufah-khimar',
                'sku' => 'ITS-KHM-KUF-003',
                'short_description' => 'Khimar basic dengan potongan segitiga depan dan belakang oval.',
                'description' => 'Referensi katalog Itsar Syar\'i. Kufah Khimar dirancang untuk memberi tampilan ramping di depan serta coverage maksimal pada bagian belakang.',
                'material' => 'Thuba Anti-UV dan Mina Anti-UV',
                'care_instruction' => 'Cuci tangan lembut, jangan diperas kuat, jemur teduh agar warna tetap awet.',
                'base_price' => 349000,
                'sale_price' => null,
                'weight' => 333,
                'length' => 30,
                'width' => 24,
                'height' => 3,
                'status' => 'published',
                'is_featured' => false,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'meta_title' => 'Kufah Khimar | Itsar Syar\'i Inspired Catalog',
                'meta_description' => 'Kufah Khimar dengan potongan segitiga depan dan coverage belakang maksimal.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'eid-radiance',
                'name' => 'Sila Scarf (Itsar Syar\'i x Napocut)',
                'slug' => 'sila-scarf-itsar-syari-x-napocut',
                'sku' => 'ITS-SCF-SIL-004',
                'short_description' => 'Square scarf 140x140 cm dengan teknik handmade fagotting.',
                'description' => 'Referensi kolaborasi Itsar Syar\'i x Napocut. Sila Scarf berbahan wool chiffon, ringan, dan tersedia dalam warna netral hingga statement.',
                'material' => 'Wool Chiffon with handmade fagotting technique',
                'care_instruction' => 'Cuci tangan lembut, hindari sikat kasar pada detail fagotting, jemur teduh.',
                'base_price' => 349000,
                'sale_price' => null,
                'weight' => 250,
                'length' => 22,
                'width' => 16,
                'height' => 2,
                'status' => 'published',
                'is_featured' => false,
                'is_new_arrival' => true,
                'is_best_seller' => false,
                'meta_title' => 'Sila Scarf Itsar Syar\'i x Napocut | Inspired Catalog',
                'meta_description' => 'Sila Scarf square hijab 140x140 cm berbahan wool chiffon dengan handmade fagotting.',
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Rabita Abaya (Itsar Syar\'i x Napocut)',
                'slug' => 'rabita-abaya-itsar-syari-x-napocut',
                'sku' => 'ITS-ABY-RBT-005',
                'short_description' => 'Abaya kolaborasi dengan textured knit dan siluet clean.',
                'description' => 'Referensi kolaborasi Itsar Syar\'i x Napocut. Rabita Abaya menghadirkan abaya nyaman dengan material Anti-UV dan pilihan warna klasik.',
                'material' => 'Mazen Anti-UV, Mina Anti-UV for Broken White',
                'care_instruction' => 'Cuci tangan, balik pakaian saat mencuci, hindari pemutih dan panas berlebih.',
                'base_price' => 799000,
                'sale_price' => null,
                'weight' => 500,
                'length' => 36,
                'width' => 28,
                'height' => 5,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => false,
                'is_best_seller' => true,
                'meta_title' => 'Rabita Abaya Itsar Syar\'i x Napocut | Inspired Catalog',
                'meta_description' => 'Rabita Abaya kolaborasi Itsar Syar\'i x Napocut dengan material Anti-UV dan tekstur nyaman.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'eid-radiance',
                'name' => 'Nisbah Khimar (Itsar Syar\'i x Napocut)',
                'slug' => 'nisbah-khimar-itsar-syari-x-napocut',
                'sku' => 'ITS-KHM-NSB-006',
                'short_description' => 'Side khimar dengan detail handmade fagotting dan coverage syar\'i.',
                'description' => 'Referensi kolaborasi Itsar Syar\'i x Napocut. Nisbah Khimar memakai material Anti-UV dengan detail fagotting dan warna mudah dipadukan.',
                'material' => 'Thuba Anti-UV, Mina Anti-UV for Broken White, handmade fagotting detail',
                'care_instruction' => 'Cuci tangan lembut, jangan diperas kuat, simpan digantung agar bentuk rapi.',
                'base_price' => 409000,
                'sale_price' => null,
                'weight' => 300,
                'length' => 30,
                'width' => 24,
                'height' => 3,
                'status' => 'published',
                'is_featured' => false,
                'is_new_arrival' => false,
                'is_best_seller' => true,
                'meta_title' => 'Nisbah Khimar Itsar Syar\'i x Napocut | Inspired Catalog',
                'meta_description' => 'Nisbah Khimar side khimar dengan handmade fagotting dan material Anti-UV.',
            ],
        ];

        $categoryIds = Category::query()
            ->pluck('id', 'slug');

        $collectionIds = Collection::query()
            ->pluck('id', 'slug');

        foreach ($products as $product) {
            $categoryId = $categoryIds->get($product['category_slug']);
            $collectionId = $collectionIds->get($product['collection_slug']);

            if (! $categoryId) {
                throw new RuntimeException("Category slug [{$product['category_slug']}] tidak ditemukan.");
            }

            if (! $collectionId) {
                throw new RuntimeException("Collection slug [{$product['collection_slug']}] tidak ditemukan.");
            }

            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [
                    'category_id' => $categoryId,
                    'collection_id' => $collectionId,
                    'name' => $product['name'],
                    'sku' => $product['sku'],
                    'short_description' => $product['short_description'],
                    'description' => $product['description'],
                    'material' => $product['material'],
                    'care_instruction' => $product['care_instruction'],
                    'base_price' => $product['base_price'],
                    'sale_price' => $product['sale_price'],
                    'weight' => $product['weight'],
                    'length' => $product['length'],
                    'width' => $product['width'],
                    'height' => $product['height'],
                    'status' => $product['status'],
                    'is_featured' => $product['is_featured'],
                    'is_new_arrival' => $product['is_new_arrival'],
                    'is_best_seller' => $product['is_best_seller'],
                    'meta_title' => $product['meta_title'],
                    'meta_description' => $product['meta_description'],
                ],
            );
        }
    }
}
