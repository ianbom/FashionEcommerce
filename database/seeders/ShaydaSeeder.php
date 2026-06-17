<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use RuntimeException;

class ShaydaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = $this->products();

        $categoryIds = Category::query()->pluck('id', 'slug');
        $collectionIds = Collection::query()->pluck('id', 'slug');

        $productSlugs = [];
        $variantSkus = [];

        foreach ($products as $productData) {
            $categoryId = $categoryIds->get($productData['category_slug']);
            $collectionId = $collectionIds->get($productData['collection_slug']);

            if (! $categoryId) {
                throw new RuntimeException("Category slug [{$productData['category_slug']}] tidak ditemukan.");
            }

            if (! $collectionId) {
                throw new RuntimeException("Collection slug [{$productData['collection_slug']}] tidak ditemukan.");
            }

            $product = Product::query()
                ->withTrashed()
                ->updateOrCreate(
                    ['slug' => $productData['slug']],
                    [
                        'category_id' => $categoryId,
                        'collection_id' => $collectionId,
                        'name' => $productData['name'],
                        'sku' => $productData['sku'],
                        'short_description' => $productData['short_description'],
                        'description' => $productData['description'],
                        'material' => $productData['material'],
                        'care_instruction' => $productData['care_instruction'],
                        'base_price' => $productData['base_price'],
                        'sale_price' => $productData['sale_price'],
                        'weight' => $productData['weight'],
                        'length' => $productData['length'],
                        'width' => $productData['width'],
                        'height' => $productData['height'],
                        'status' => $productData['status'],
                        'is_featured' => $productData['is_featured'],
                        'is_new_arrival' => $productData['is_new_arrival'],
                        'is_best_seller' => $productData['is_best_seller'],
                        'meta_title' => $productData['meta_title'],
                        'meta_description' => $productData['meta_description'],
                    ],
                );

            if ($product->trashed()) {
                $product->restore();
            }

            $productSlugs[] = $product->slug;
            $this->syncImages($product, $productData['images']);
            $variantSkus = [...$variantSkus, ...$this->syncVariants($product, $productData['variants'])];
        }

        ProductVariant::query()
            ->where('sku', 'like', 'SHAYDA-%')
            ->whereNotIn('sku', $variantSkus)
            ->delete();

        Product::query()
            ->where('slug', 'like', 'shayda-%')
            ->whereNotIn('slug', $productSlugs)
            ->delete();
    }

    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    private function syncImages(Product $product, array $images): void
    {
        $keptImageIds = [];

        foreach ($images as $image) {
            $record = ProductImage::query()
                ->withTrashed()
                ->updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'sort_order' => $image['sort_order'],
                    ],
                    [
                        'image_url' => $image['image_url'],
                        'alt_text' => $image['alt_text'],
                        'is_primary' => $image['is_primary'],
                    ],
                );

            if ($record->trashed()) {
                $record->restore();
            }

            $keptImageIds[] = $record->id;
        }

        ProductImage::query()
            ->where('product_id', $product->id)
            ->whereNotIn('id', $keptImageIds)
            ->delete();
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     * @return array<int, string>
     */
    private function syncVariants(Product $product, array $variants): array
    {
        $keptVariantSkus = [];

        foreach ($variants as $variant) {
            $record = ProductVariant::query()
                ->withTrashed()
                ->updateOrCreate(
                    ['sku' => $variant['sku']],
                    [
                        'product_id' => $product->id,
                        'color_name' => $variant['color_name'],
                        'color_hex' => $variant['color_hex'],
                        'size' => $variant['size'],
                        'additional_price' => $variant['additional_price'],
                        'stock' => $variant['stock'],
                        'reserved_stock' => $variant['reserved_stock'],
                        'image_url' => $variant['image_url'],
                        'is_active' => $variant['is_active'],
                    ],
                );

            if ($record->trashed()) {
                $record->restore();
            }

            $keptVariantSkus[] = $record->sku;
        }

        ProductVariant::query()
            ->where('product_id', $product->id)
            ->where('sku', 'like', 'SHAYDA-%')
            ->whereNotIn('sku', $keptVariantSkus)
            ->delete();

        return $keptVariantSkus;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return [
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Shayda Naura Set',
                'slug' => 'shayda-naura-set',
                'sku' => 'SHAYDA-SET-001',
                'short_description' => 'Set dress syari plisket dengan piping kontras dan khimar flowy berwarna navy.',
                'description' => 'Shayda Naura Set menghadirkan siluet modest yang tenang lewat dress dusty mauve berpotongan lurus, detail piping halus, dan khimar panjang yang jatuh ringan. Cocok untuk agenda harian, kajian, sampai acara keluarga dengan tampilan rapi dan lembut.',
                'material' => 'Premium matte crepe dan ceruty airflow',
                'care_instruction' => 'Cuci tangan lembut, gunakan deterjen ringan, hindari pemutih, jemur teduh, dan setrika suhu rendah dari sisi dalam.',
                'base_price' => 489000,
                'sale_price' => 459000,
                'weight' => 850,
                'length' => 36,
                'width' => 28,
                'height' => 8,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'meta_title' => 'Shayda Naura Set | Dress Syari Dusty Mauve',
                'meta_description' => 'Set dress syari dusty mauve dengan khimar navy, detail piping halus, dan bahan matte crepe yang nyaman dipakai seharian.',
                'images' => [
                    [
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'alt_text' => 'Shayda Naura Set tampak depan warna dusty mauve dengan khimar navy',
                        'sort_order' => 0,
                        'is_primary' => true,
                    ],
                    [
                        'image_url' => '/FotoShayda/A450596C-21FD-44B9-9442-BF5985F7EC04.JPEG',
                        'alt_text' => 'Shayda Naura Set detail plisket dan jatuh khimar',
                        'sort_order' => 1,
                        'is_primary' => false,
                    ],
                    [
                        'image_url' => '/FotoShayda/E1DC6E63-0303-4D06-ABB2-6E13A3084C24.JPEG',
                        'alt_text' => 'Shayda Naura Set tampak penuh untuk styling modest formal',
                        'sort_order' => 2,
                        'is_primary' => false,
                    ],
                ],
                'variants' => [
                    [
                        'sku' => 'SHAYDA-SET-001-MAUVE-S',
                        'color_name' => 'Dusty Mauve',
                        'color_hex' => '#B6A5AE',
                        'size' => 'S',
                        'additional_price' => 0,
                        'stock' => 12,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-001-MAUVE-M',
                        'color_name' => 'Dusty Mauve',
                        'color_hex' => '#B6A5AE',
                        'size' => 'M',
                        'additional_price' => 0,
                        'stock' => 15,
                        'reserved_stock' => 2,
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-001-NAVY-M',
                        'color_name' => 'Midnight Navy',
                        'color_hex' => '#2B3C57',
                        'size' => 'M',
                        'additional_price' => 10000,
                        'stock' => 9,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/A450596C-21FD-44B9-9442-BF5985F7EC04.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-001-NAVY-L',
                        'color_name' => 'Midnight Navy',
                        'color_hex' => '#2B3C57',
                        'size' => 'L',
                        'additional_price' => 10000,
                        'stock' => 8,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/A450596C-21FD-44B9-9442-BF5985F7EC04.JPEG',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Shayda Selma Set',
                'slug' => 'shayda-selma-set',
                'sku' => 'SHAYDA-SET-002',
                'short_description' => 'Set modest warna cocoa dengan khimar blush pink untuk look manis dan clean.',
                'description' => 'Shayda Selma Set memadukan dress cocoa bernuansa hangat dengan khimar blush pink yang lembut. Siluetnya lurus, ringan bergerak, dan tetap memberi coverage nyaman untuk aktivitas semi-formal hingga momen silaturahmi.',
                'material' => 'Premium matte crepe dan ceruty airflow',
                'care_instruction' => 'Cuci tangan lembut, jangan direndam terlalu lama, jemur teduh, dan setrika suhu rendah agar tekstur tetap rapi.',
                'base_price' => 495000,
                'sale_price' => null,
                'weight' => 840,
                'length' => 36,
                'width' => 28,
                'height' => 8,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => true,
                'is_best_seller' => false,
                'meta_title' => 'Shayda Selma Set | Dress Cocoa Blush',
                'meta_description' => 'Set modest cocoa dengan khimar blush pink, material nyaman, dan look lembut untuk acara harian maupun semi-formal.',
                'images' => [
                    [
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'alt_text' => 'Shayda Selma Set dua look warna cocoa dan blush pink',
                        'sort_order' => 0,
                        'is_primary' => true,
                    ],
                    [
                        'image_url' => '/FotoShayda/ACB04034-F5C0-456C-ADA1-A78D7876E582.JPEG',
                        'alt_text' => 'Shayda Selma Set tampak samping warna blush pink',
                        'sort_order' => 1,
                        'is_primary' => false,
                    ],
                    [
                        'image_url' => '/FotoShayda/A450596C-21FD-44B9-9442-BF5985F7EC04.JPEG',
                        'alt_text' => 'Shayda Selma Set tampak duduk memperlihatkan jatuh bahan',
                        'sort_order' => 2,
                        'is_primary' => false,
                    ],
                ],
                'variants' => [
                    [
                        'sku' => 'SHAYDA-SET-002-COCOA-S',
                        'color_name' => 'Cocoa Brown',
                        'color_hex' => '#6B4C3B',
                        'size' => 'S',
                        'additional_price' => 0,
                        'stock' => 11,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-002-COCOA-M',
                        'color_name' => 'Cocoa Brown',
                        'color_hex' => '#6B4C3B',
                        'size' => 'M',
                        'additional_price' => 0,
                        'stock' => 14,
                        'reserved_stock' => 2,
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-002-BLUSH-M',
                        'color_name' => 'Soft Blush',
                        'color_hex' => '#D9C8CF',
                        'size' => 'M',
                        'additional_price' => 5000,
                        'stock' => 10,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/ACB04034-F5C0-456C-ADA1-A78D7876E582.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-002-BLUSH-L',
                        'color_name' => 'Soft Blush',
                        'color_hex' => '#D9C8CF',
                        'size' => 'L',
                        'additional_price' => 5000,
                        'stock' => 7,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/ACB04034-F5C0-456C-ADA1-A78D7876E582.JPEG',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Shayda Layla Set',
                'slug' => 'shayda-layla-set',
                'sku' => 'SHAYDA-SET-003',
                'short_description' => 'Set dress plum gelap dengan khimar aubergine untuk tampilan anggun dan tegas.',
                'description' => 'Shayda Layla Set dirancang untuk pemakai yang menyukai tone gelap elegan. Dress bernuansa plum pekat dipadukan dengan khimar aubergine yang jatuh rapi, memberi kesan refined tanpa kehilangan kenyamanan untuk dipakai lama.',
                'material' => 'Premium matte crepe dan ceruty airflow',
                'care_instruction' => 'Cuci tangan dengan deterjen ringan, hindari mesin pengering, jemur di tempat teduh, dan rapikan dengan setrika suhu rendah.',
                'base_price' => 505000,
                'sale_price' => 475000,
                'weight' => 850,
                'length' => 36,
                'width' => 28,
                'height' => 8,
                'status' => 'published',
                'is_featured' => false,
                'is_new_arrival' => true,
                'is_best_seller' => true,
                'meta_title' => 'Shayda Layla Set | Dress Plum Aubergine',
                'meta_description' => 'Set dress plum gelap dengan khimar aubergine, clean cut, dan nyaman untuk agenda formal maupun daily refined look.',
                'images' => [
                    [
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'alt_text' => 'Shayda Layla Set tampak depan warna aubergine plum',
                        'sort_order' => 0,
                        'is_primary' => true,
                    ],
                    [
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'alt_text' => 'Shayda Layla Set look belakang dengan khimar panjang',
                        'sort_order' => 1,
                        'is_primary' => false,
                    ],
                    [
                        'image_url' => '/FotoShayda/E1DC6E63-0303-4D06-ABB2-6E13A3084C24.JPEG',
                        'alt_text' => 'Shayda Layla Set dipadukan untuk acara malam dan semi-formal',
                        'sort_order' => 2,
                        'is_primary' => false,
                    ],
                ],
                'variants' => [
                    [
                        'sku' => 'SHAYDA-SET-003-PLUM-S',
                        'color_name' => 'Aubergine Plum',
                        'color_hex' => '#5A2748',
                        'size' => 'S',
                        'additional_price' => 0,
                        'stock' => 8,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-003-PLUM-M',
                        'color_name' => 'Aubergine Plum',
                        'color_hex' => '#5A2748',
                        'size' => 'M',
                        'additional_price' => 0,
                        'stock' => 12,
                        'reserved_stock' => 2,
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-003-BLACK-M',
                        'color_name' => 'Charcoal Black',
                        'color_hex' => '#2E2832',
                        'size' => 'M',
                        'additional_price' => 10000,
                        'stock' => 9,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-003-BLACK-L',
                        'color_name' => 'Charcoal Black',
                        'color_hex' => '#2E2832',
                        'size' => 'L',
                        'additional_price' => 10000,
                        'stock' => 6,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Shayda Azka Set',
                'slug' => 'shayda-azka-set',
                'sku' => 'SHAYDA-SET-004',
                'short_description' => 'Set dress navy dengan khimar olive taupe untuk look bold namun tetap earthy.',
                'description' => 'Shayda Azka Set memadukan dress deep navy dengan khimar olive taupe yang earthy. Kombinasi ini memberi tampilan tegas, mudah dipakai untuk kegiatan kantor, undangan keluarga, maupun layering modest yang lebih modern.',
                'material' => 'Premium matte crepe dan ceruty airflow',
                'care_instruction' => 'Cuci tangan atau mode lembut, hindari pemutih, jemur teduh, dan simpan digantung agar khimar tetap jatuh rapi.',
                'base_price' => 499000,
                'sale_price' => null,
                'weight' => 860,
                'length' => 36,
                'width' => 28,
                'height' => 8,
                'status' => 'published',
                'is_featured' => true,
                'is_new_arrival' => false,
                'is_best_seller' => true,
                'meta_title' => 'Shayda Azka Set | Dress Navy Olive Taupe',
                'meta_description' => 'Set dress navy dengan khimar olive taupe, potongan clean, dan bahan matte crepe nyaman untuk dipakai seharian.',
                'images' => [
                    [
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'alt_text' => 'Shayda Azka Set tampak belakang warna navy olive taupe',
                        'sort_order' => 0,
                        'is_primary' => true,
                    ],
                    [
                        'image_url' => '/FotoShayda/E1DC6E63-0303-4D06-ABB2-6E13A3084C24.JPEG',
                        'alt_text' => 'Shayda Azka Set tampak depan dengan tas hitam untuk styling formal',
                        'sort_order' => 1,
                        'is_primary' => false,
                    ],
                    [
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'alt_text' => 'Shayda Azka Set close-up khimar olive taupe',
                        'sort_order' => 2,
                        'is_primary' => false,
                    ],
                ],
                'variants' => [
                    [
                        'sku' => 'SHAYDA-SET-004-NAVY-S',
                        'color_name' => 'Deep Navy',
                        'color_hex' => '#24374F',
                        'size' => 'S',
                        'additional_price' => 0,
                        'stock' => 10,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-004-NAVY-M',
                        'color_name' => 'Deep Navy',
                        'color_hex' => '#24374F',
                        'size' => 'M',
                        'additional_price' => 0,
                        'stock' => 13,
                        'reserved_stock' => 2,
                        'image_url' => '/FotoShayda/D12FB670-CE16-4B48-8CAF-EDF5934969D3.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-004-OLIVE-M',
                        'color_name' => 'Olive Taupe',
                        'color_hex' => '#746A55',
                        'size' => 'M',
                        'additional_price' => 5000,
                        'stock' => 9,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-004-OLIVE-L',
                        'color_name' => 'Olive Taupe',
                        'color_hex' => '#746A55',
                        'size' => 'L',
                        'additional_price' => 5000,
                        'stock' => 7,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'category_slug' => 'womens-dresses',
                'collection_slug' => 'eid-radiance',
                'name' => 'Shayda Mecca Set',
                'slug' => 'shayda-mecca-set',
                'sku' => 'SHAYDA-SET-005',
                'short_description' => 'Set dress espresso dengan khimar mocha olive untuk tampilan earthy yang dewasa.',
                'description' => 'Shayda Mecca Set mengusung kombinasi warna espresso dan mocha olive yang kaya namun tetap easy to style. Potongannya modest, clean, dan memberi kesan dewasa untuk kebutuhan daily elevated look maupun agenda spesial.',
                'material' => 'Premium matte crepe dan ceruty airflow',
                'care_instruction' => 'Cuci dengan tangan secara lembut, jangan diperas kuat, jemur di tempat teduh, dan hindari suhu setrika yang terlalu panas.',
                'base_price' => 515000,
                'sale_price' => 489000,
                'weight' => 860,
                'length' => 36,
                'width' => 28,
                'height' => 8,
                'status' => 'published',
                'is_featured' => false,
                'is_new_arrival' => false,
                'is_best_seller' => true,
                'meta_title' => 'Shayda Mecca Set | Dress Espresso Mocha',
                'meta_description' => 'Set dress espresso dengan khimar mocha olive, tone earthy yang dewasa, dan bahan nyaman untuk berbagai kesempatan.',
                'images' => [
                    [
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'alt_text' => 'Shayda Mecca Set tampilan koleksi warna espresso dan mocha olive',
                        'sort_order' => 0,
                        'is_primary' => true,
                    ],
                    [
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'alt_text' => 'Shayda Mecca Set close-up khimar earthy tone',
                        'sort_order' => 1,
                        'is_primary' => false,
                    ],
                    [
                        'image_url' => '/FotoShayda/E1DC6E63-0303-4D06-ABB2-6E13A3084C24.JPEG',
                        'alt_text' => 'Shayda Mecca Set styling formal dengan siluet panjang',
                        'sort_order' => 2,
                        'is_primary' => false,
                    ],
                ],
                'variants' => [
                    [
                        'sku' => 'SHAYDA-SET-005-ESP-S',
                        'color_name' => 'Espresso Brown',
                        'color_hex' => '#4C352C',
                        'size' => 'S',
                        'additional_price' => 0,
                        'stock' => 9,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-005-ESP-M',
                        'color_name' => 'Espresso Brown',
                        'color_hex' => '#4C352C',
                        'size' => 'M',
                        'additional_price' => 0,
                        'stock' => 12,
                        'reserved_stock' => 2,
                        'image_url' => '/FotoShayda/56F72D08-D55A-428D-9112-35B115FB59B7.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-005-MOCHA-M',
                        'color_name' => 'Mocha Olive',
                        'color_hex' => '#6A5A46',
                        'size' => 'M',
                        'additional_price' => 5000,
                        'stock' => 10,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'is_active' => true,
                    ],
                    [
                        'sku' => 'SHAYDA-SET-005-MOCHA-L',
                        'color_name' => 'Mocha Olive',
                        'color_hex' => '#6A5A46',
                        'size' => 'L',
                        'additional_price' => 5000,
                        'stock' => 8,
                        'reserved_stock' => 1,
                        'image_url' => '/FotoShayda/9DD1EBEB-DCBF-45E7-9563-17A40782156F.JPEG',
                        'is_active' => true,
                    ],
                ],
            ],
        ];
    }
}
