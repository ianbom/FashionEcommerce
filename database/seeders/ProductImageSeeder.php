<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imagesByProduct = [
            'aurelia-linen-relaxed-shirt' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-aurelia-1/1200/1600',
                    'alt_text' => 'Aurelia Linen Relaxed Shirt warna ivory tampak depan',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-aurelia-2/1200/1600',
                    'alt_text' => 'Detail tekstur bahan linen pada Aurelia Shirt',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'selene-pleated-midi-dress' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-selene-1/1200/1600',
                    'alt_text' => 'Selene Pleated Midi Dress tampilan full body',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-selene-2/1200/1600',
                    'alt_text' => 'Detail pleats pada Selene Midi Dress',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'noah-oxford-smart-shirt' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-noah-1/1200/1600',
                    'alt_text' => 'Noah Oxford Smart Shirt warna biru muda',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-noah-2/1200/1600',
                    'alt_text' => 'Noah Shirt dipadukan dengan celana formal',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'astra-cropped-blazer' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-astra-1/1200/1600',
                    'alt_text' => 'Astra Cropped Blazer warna hitam tampak depan',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-astra-2/1200/1600',
                    'alt_text' => 'Detail tailoring Astra Cropped Blazer',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'mira-satin-hijab' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-mira-1/1200/1600',
                    'alt_text' => 'Mira Satin Hijab warna rose gold',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-mira-2/1200/1600',
                    'alt_text' => 'Drape halus Mira Satin Hijab saat dipakai',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'arden-knit-cardigan' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-arden-1/1200/1600',
                    'alt_text' => 'Arden Knit Cardigan tampilan depan',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-arden-2/1200/1600',
                    'alt_text' => 'Detail tekstur rajut Arden Knit Cardigan',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'luca-slip-on-loafers' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-luca-1/1200/1600',
                    'alt_text' => 'Luca Slip-On Loafers warna black',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-luca-2/1200/1600',
                    'alt_text' => 'Detail insole empuk pada Luca Loafers',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'elio-utility-overshirt' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-elio-1/1200/1600',
                    'alt_text' => 'Elio Utility Overshirt warna olive',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-elio-2/1200/1600',
                    'alt_text' => 'Detail pocket utility pada Elio Overshirt',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
            'vera-classic-tote-bag' => [
                [
                    'image_url' => 'https://picsum.photos/seed/product-vera-1/1200/1600',
                    'alt_text' => 'Vera Classic Tote Bag tampilan utama',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://picsum.photos/seed/product-vera-2/1200/1600',
                    'alt_text' => 'Kompartemen dalam Vera Classic Tote Bag',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
            ],
        ];

        $products = Product::query()
            ->whereIn('slug', array_keys($imagesByProduct))
            ->get()
            ->keyBy('slug');

        foreach ($imagesByProduct as $productSlug => $images) {
            $product = $products->get($productSlug);

            if (! $product) {
                throw new RuntimeException("Product slug [{$productSlug}] tidak ditemukan.");
            }

            $keptIds = [];

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

                $keptIds[] = $record->id;
            }

            ProductImage::query()
                ->where('product_id', $product->id)
                ->whereNotIn('id', $keptIds)
                ->delete();
        }
    }
}
