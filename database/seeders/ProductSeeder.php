<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kurasi 6 produk dari katalog https://itsarsyari.id/.
        $products = [
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Najran Piping Lace Abaya',
                'slug' => 'najran-piping-lace-abaya',
                'sku' => 'ITS-ABY-NAJ-001',
                'short_description' => 'Abaya slim cutting dengan piping detail dan lace patch di bagian siku.',
                'description' => 'Produk katalog Itsar Syar\'i dengan detail piping premium dan aksen lace pada bagian siku. Cocok untuk tampilan modest yang rapi dari daily hingga semi-formal.',
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
                'meta_title' => 'Najran Piping Lace Abaya | Itsar Syar\'i',
                'meta_description' => 'Najran Piping Lace Abaya dengan cutting ramping, piping premium, dan detail lace elegan.',
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Abargo (Abaya Cargo)',
                'slug' => 'abargo-abaya-cargo',
                'sku' => 'ITS-ABY-ABG-002',
                'short_description' => 'Abaya cargo kasual-elegan dengan 3D pocket dan overstitch.',
                'description' => 'Produk katalog Itsar Syar\'i berupa abaya cargo dengan pocket 3D, detail overstitch, dan siluet casual-modest yang tetap polished.',
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
                'meta_title' => 'Abargo (Abaya Cargo) | Itsar Syar\'i',
                'meta_description' => 'Abargo (Abaya Cargo) dengan 3D pocket, overstitch, dan material premium Anti-UV.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'summer-linen-2026',
                'name' => 'Kufah Khimar',
                'slug' => 'kufah-khimar',
                'sku' => 'ITS-KHM-KUF-003',
                'short_description' => 'Khimar basic dengan potongan segitiga depan dan belakang oval.',
                'description' => 'Produk katalog Itsar Syar\'i berupa khimar basic dengan tampilan ramping di depan dan coverage maksimal pada bagian belakang.',
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
                'meta_title' => 'Kufah Khimar | Itsar Syar\'i',
                'meta_description' => 'Kufah Khimar dengan potongan segitiga depan dan coverage belakang maksimal.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'eid-radiance',
                'name' => 'Sila Scarf (Itsar Syar\'i x Napocut)',
                'slug' => 'sila-scarf-itsar-syari-x-napocut',
                'sku' => 'ITS-SCF-SIL-004',
                'short_description' => 'Square scarf 140x140 cm dengan teknik handmade fagotting.',
                'description' => 'Produk kolaborasi Itsar Syar\'i x Napocut berupa square scarf 140x140 cm berbahan wool chiffon dengan detail handmade fagotting.',
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
                'meta_title' => 'Sila Scarf (Itsar Syar\'i x Napocut) | Itsar Syar\'i',
                'meta_description' => 'Sila Scarf square hijab 140x140 cm berbahan wool chiffon dengan handmade fagotting.',
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Rabita Abaya (Itsar Syar\'i x Napocut)',
                'slug' => 'rabita-abaya-itsar-syari-x-napocut',
                'sku' => 'ITS-ABY-RBT-005',
                'short_description' => 'Abaya kolaborasi dengan textured knit dan siluet clean.',
                'description' => 'Produk kolaborasi Itsar Syar\'i x Napocut berupa abaya clean dengan material Anti-UV dan pilihan warna klasik untuk daily refined look.',
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
                'meta_title' => 'Rabita Abaya (Itsar Syar\'i x Napocut) | Itsar Syar\'i',
                'meta_description' => 'Rabita Abaya kolaborasi Itsar Syar\'i x Napocut dengan material Anti-UV dan tekstur nyaman.',
            ],
            [
                'category_slug' => 'accessories',
                'collection_slug' => 'eid-radiance',
                'name' => 'Nisbah Khimar (Itsar Syar\'i x Napocut)',
                'slug' => 'nisbah-khimar-itsar-syari-x-napocut',
                'sku' => 'ITS-KHM-NSB-006',
                'short_description' => 'Side khimar dengan detail handmade fagotting dan coverage syar\'i.',
                'description' => 'Produk kolaborasi Itsar Syar\'i x Napocut berupa side khimar dengan detail handmade fagotting dan warna yang mudah dipadukan.',
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
                'meta_title' => 'Nisbah Khimar (Itsar Syar\'i x Napocut) | Itsar Syar\'i',
                'meta_description' => 'Nisbah Khimar side khimar dengan handmade fagotting dan material Anti-UV.',
            ],
        ];

        $duplicateProducts = [
            ['source' => 'najran-piping-lace-abaya', 'name' => 'Najran Piping Lace Abaya Sand', 'sku' => 'ITS-ABY-NAJ-007', 'price' => 749000],
            ['source' => 'najran-piping-lace-abaya', 'name' => 'Najran Piping Lace Abaya Maroon', 'sku' => 'ITS-ABY-NAJ-008', 'price' => 759000],
            ['source' => 'najran-piping-lace-abaya', 'name' => 'Najran Piping Lace Abaya Navy', 'sku' => 'ITS-ABY-NAJ-009', 'price' => 769000],
            ['source' => 'najran-piping-lace-abaya', 'name' => 'Najran Piping Lace Abaya Olive', 'sku' => 'ITS-ABY-NAJ-010', 'price' => 779000],
            ['source' => 'abargo-abaya-cargo', 'name' => 'Abargo Utility Abaya Cream', 'sku' => 'ITS-ABY-ABG-011', 'price' => 789000],
            ['source' => 'abargo-abaya-cargo', 'name' => 'Abargo Utility Abaya Black', 'sku' => 'ITS-ABY-ABG-012', 'price' => 799000],
            ['source' => 'abargo-abaya-cargo', 'name' => 'Abargo Utility Abaya Plum', 'sku' => 'ITS-ABY-ABG-013', 'price' => 809000],
            ['source' => 'abargo-abaya-cargo', 'name' => 'Abargo Utility Abaya Taupe', 'sku' => 'ITS-ABY-ABG-014', 'price' => 819000],
            ['source' => 'kufah-khimar', 'name' => 'Kufah Khimar Dark Plum', 'sku' => 'ITS-KHM-KUF-015', 'price' => 359000],
            ['source' => 'kufah-khimar', 'name' => 'Kufah Khimar Sepia', 'sku' => 'ITS-KHM-KUF-016', 'price' => 369000],
            ['source' => 'kufah-khimar', 'name' => 'Kufah Khimar Silver', 'sku' => 'ITS-KHM-KUF-017', 'price' => 379000],
            ['source' => 'kufah-khimar', 'name' => 'Kufah Khimar Moss', 'sku' => 'ITS-KHM-KUF-018', 'price' => 389000],
            ['source' => 'sila-scarf-itsar-syari-x-napocut', 'name' => 'Sila Scarf Crimson', 'sku' => 'ITS-SCF-SIL-019', 'price' => 359000],
            ['source' => 'sila-scarf-itsar-syari-x-napocut', 'name' => 'Sila Scarf Midnight', 'sku' => 'ITS-SCF-SIL-020', 'price' => 369000],
            ['source' => 'sila-scarf-itsar-syari-x-napocut', 'name' => 'Sila Scarf Mocha', 'sku' => 'ITS-SCF-SIL-021', 'price' => 379000],
            ['source' => 'sila-scarf-itsar-syari-x-napocut', 'name' => 'Sila Scarf Ivory', 'sku' => 'ITS-SCF-SIL-022', 'price' => 389000],
            ['source' => 'rabita-abaya-itsar-syari-x-napocut', 'name' => 'Rabita Abaya Black', 'sku' => 'ITS-ABY-RBT-023', 'price' => 809000],
            ['source' => 'rabita-abaya-itsar-syari-x-napocut', 'name' => 'Rabita Abaya Broken White', 'sku' => 'ITS-ABY-RBT-024', 'price' => 819000],
            ['source' => 'rabita-abaya-itsar-syari-x-napocut', 'name' => 'Rabita Abaya Dark Cherry', 'sku' => 'ITS-ABY-RBT-025', 'price' => 829000],
            ['source' => 'rabita-abaya-itsar-syari-x-napocut', 'name' => 'Rabita Abaya Graphite', 'sku' => 'ITS-ABY-RBT-026', 'price' => 839000],
            ['source' => 'nisbah-khimar-itsar-syari-x-napocut', 'name' => 'Nisbah Khimar Black', 'sku' => 'ITS-KHM-NSB-027', 'price' => 419000],
            ['source' => 'nisbah-khimar-itsar-syari-x-napocut', 'name' => 'Nisbah Khimar Drift Wood', 'sku' => 'ITS-KHM-NSB-028', 'price' => 429000],
            ['source' => 'nisbah-khimar-itsar-syari-x-napocut', 'name' => 'Nisbah Khimar Fawn Pink', 'sku' => 'ITS-KHM-NSB-029', 'price' => 439000],
            ['source' => 'nisbah-khimar-itsar-syari-x-napocut', 'name' => 'Nisbah Khimar Cocoa', 'sku' => 'ITS-KHM-NSB-030', 'price' => 449000],
        ];

        $templates = collect($products)->keyBy('slug');

        foreach ($duplicateProducts as $duplicate) {
            $template = $templates->get($duplicate['source']);

            if (! $template) {
                throw new RuntimeException("Product template slug [{$duplicate['source']}] tidak ditemukan.");
            }

            $slug = Str::slug($duplicate['name']);

            $products[] = array_merge($template, [
                'name' => $duplicate['name'],
                'slug' => $slug,
                'sku' => $duplicate['sku'],
                'base_price' => $duplicate['price'],
                'is_featured' => ((int) Str::afterLast($duplicate['sku'], '-')) % 2 === 0,
                'is_new_arrival' => ((int) Str::afterLast($duplicate['sku'], '-')) % 3 !== 0,
                'is_best_seller' => ((int) Str::afterLast($duplicate['sku'], '-')) % 4 === 0,
                'meta_title' => "{$duplicate['name']} | Itsar Syar'i",
                'meta_description' => "{$duplicate['name']} dari katalog Itsar Syar'i dengan foto katalog lama dan detail produk modest premium.",
            ]);
        }

        $categoryIds = Category::query()
            ->pluck('id', 'slug');

        $collectionIds = Collection::query()
            ->pluck('id', 'slug');

        $currentSlugs = collect($products)->pluck('slug');

        foreach ($products as $product) {
            $categoryId = $categoryIds->get($product['category_slug']);
            $collectionId = $collectionIds->get($product['collection_slug']);

            if (! $categoryId) {
                throw new RuntimeException("Category slug [{$product['category_slug']}] tidak ditemukan.");
            }

            if (! $collectionId) {
                throw new RuntimeException("Collection slug [{$product['collection_slug']}] tidak ditemukan.");
            }

            $record = Product::query()
                ->withTrashed()
                ->updateOrCreate(
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

            if ($record->trashed()) {
                $record->restore();
            }
        }

        Product::query()
            ->where('sku', 'like', 'ITS-%')
            ->whereNotIn('slug', $currentSlugs)
            ->delete();
    }
}
