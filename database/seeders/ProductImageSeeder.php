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
            'najran-piping-lace-abaya' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Najran_Offwhite-2_1776392577451_resized1024-JPG.webp',
                    'alt_text' => 'Najran Piping Lace Abaya Off White tampak depan',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Najran_Offwhite-4_1776392577524_resized1024-JPG.webp',
                    'alt_text' => 'Najran Piping Lace Abaya detail piping dan lace',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Najran_Offwhite-3_1776392577582_resized1024-JPG.webp',
                    'alt_text' => 'Najran Piping Lace Abaya tampak samping',
                    'sort_order' => 2,
                    'is_primary' => false,
                ],
            ],
            'abargo-abaya-cargo' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Abargo_Offwhite-3_1776392924292_resized1024-jpeg.webp',
                    'alt_text' => 'Abargo Abaya Cargo Off White tampak depan',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Abargo_Offwhite-2_1776392924353_resized1024-jpeg.webp',
                    'alt_text' => 'Abargo Abaya Cargo detail pocket',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Abargo_Offwhite-4_1776392924228_resized1024-jpeg.webp',
                    'alt_text' => 'Abargo Abaya Cargo tampak samping',
                    'sort_order' => 2,
                    'is_primary' => false,
                ],
            ],
            'kufah-khimar' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Dark_Plum_1758282141686_resized1024-JPG.webp',
                    'alt_text' => 'Kufah Khimar warna Dark Plum',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Sepia_1_1758282141797_resized1024-JPG.webp',
                    'alt_text' => 'Kufah Khimar warna Sepia',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Silver_1758282142019_resized1024-JPG.webp',
                    'alt_text' => 'Kufah Khimar warna Silver',
                    'sort_order' => 2,
                    'is_primary' => false,
                ],
            ],
            'sila-scarf-itsar-syari-x-napocut' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/35_1750942152256_resized1024-jpg.webp',
                    'alt_text' => 'Sila Scarf Itsar Syari x Napocut tampilan utama',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/36_1750942152379_resized1024-jpg.webp',
                    'alt_text' => 'Sila Scarf detail motif dan warna',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/37_1750942152462_resized1024-jpg.webp',
                    'alt_text' => 'Sila Scarf detail handmade fagotting',
                    'sort_order' => 2,
                    'is_primary' => false,
                ],
            ],
            'rabita-abaya-itsar-syari-x-napocut' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/12_1750941526800_resized1024-jpg.webp',
                    'alt_text' => 'Rabita Abaya Itsar Syari x Napocut tampilan utama',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/15_1750941526929_resized1024-jpg.webp',
                    'alt_text' => 'Rabita Abaya detail material dan cutting',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Rabita_Abaya_-_Black_3_-_HEN_5918_1750910260318_resized1024-JPG.webp',
                    'alt_text' => 'Rabita Abaya warna Black',
                    'sort_order' => 2,
                    'is_primary' => false,
                ],
            ],
            'nisbah-khimar-itsar-syari-x-napocut' => [
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/24_1750941944929_resized1024-jpg.webp',
                    'alt_text' => 'Nisbah Khimar Itsar Syari x Napocut tampilan utama',
                    'sort_order' => 0,
                    'is_primary' => true,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/26_1750941944996_resized1024-jpg.webp',
                    'alt_text' => 'Nisbah Khimar detail side khimar',
                    'sort_order' => 1,
                    'is_primary' => false,
                ],
                [
                    'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/27_1750941945068_resized1024-jpg.webp',
                    'alt_text' => 'Nisbah Khimar detail handmade fagotting',
                    'sort_order' => 2,
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
