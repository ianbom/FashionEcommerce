<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use RuntimeException;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $variants = [
            [
                'product_slug' => 'najran-piping-lace-abaya',
                'sku' => 'ITS-ABY-NAJ-001-OW-S',
                'color_name' => 'Off White',
                'color_hex' => '#F5F1E8',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 18,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Najran_Offwhite-2_1776392577451_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'najran-piping-lace-abaya',
                'sku' => 'ITS-ABY-NAJ-001-DM-M',
                'color_name' => 'Dark Maroon',
                'color_hex' => '#4B1E24',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 12,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/8_1753751655816_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'najran-piping-lace-abaya',
                'sku' => 'ITS-ABY-NAJ-001-NN-L',
                'color_name' => 'Night Navy',
                'color_hex' => '#1D2738',
                'size' => 'L',
                'additional_price' => 0,
                'stock' => 10,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/7_1753751655816_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'abargo-abaya-cargo',
                'sku' => 'ITS-ABY-ABG-002-OW-S',
                'color_name' => 'Off White',
                'color_hex' => '#F4EFE7',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 14,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Abargo_Offwhite-3_1776392924292_resized512-jpeg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'abargo-abaya-cargo',
                'sku' => 'ITS-ABY-ABG-002-BK-M',
                'color_name' => 'Black',
                'color_hex' => '#111111',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 11,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/12_1733396329407_resized256-png.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'abargo-abaya-cargo',
                'sku' => 'ITS-ABY-ABG-002-DP-LXL',
                'color_name' => 'Deep Purple',
                'color_hex' => '#33213F',
                'size' => 'L/XL',
                'additional_price' => 0,
                'stock' => 8,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/deep_purple_1770357984708_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'kufah-khimar',
                'sku' => 'ITS-KHM-KUF-003-DP-LONG',
                'color_name' => 'Dark Plum',
                'color_hex' => '#3A2435',
                'size' => 'Long+',
                'additional_price' => 0,
                'stock' => 25,
                'reserved_stock' => 4,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Dark_Plum_1758282141686_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'kufah-khimar',
                'sku' => 'ITS-KHM-KUF-003-SP-MED',
                'color_name' => 'Sepia',
                'color_hex' => '#806451',
                'size' => 'Medium',
                'additional_price' => 0,
                'stock' => 22,
                'reserved_stock' => 3,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Sepia_1_1758282141797_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'kufah-khimar',
                'sku' => 'ITS-KHM-KUF-003-SV-LONG',
                'color_name' => 'Silver',
                'color_hex' => '#B9B9B5',
                'size' => 'Long+',
                'additional_price' => 0,
                'stock' => 18,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Kufah_Khimar_-_Silver_1758282142019_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'sila-scarf-itsar-syari-x-napocut',
                'sku' => 'ITS-SCF-SIL-004-CR-140',
                'color_name' => 'Crimson Red',
                'color_hex' => '#8E1F2F',
                'size' => '140x140 cm',
                'additional_price' => 0,
                'stock' => 20,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/35_1750942152256_resized512-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'sila-scarf-itsar-syari-x-napocut',
                'sku' => 'ITS-SCF-SIL-004-MN-140',
                'color_name' => 'Midnight Navy',
                'color_hex' => '#1D2738',
                'size' => '140x140 cm',
                'additional_price' => 0,
                'stock' => 16,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/43_1750942153657_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'sila-scarf-itsar-syari-x-napocut',
                'sku' => 'ITS-SCF-SIL-004-MC-140',
                'color_name' => 'Mocha',
                'color_hex' => '#8A6A55',
                'size' => '140x140 cm',
                'additional_price' => 0,
                'stock' => 15,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/48_1750942153656_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'rabita-abaya-itsar-syari-x-napocut',
                'sku' => 'ITS-ABY-RBT-005-BK-S',
                'color_name' => 'Black',
                'color_hex' => '#111111',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 10,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Rabita_Abaya_-_Black_3_-_HEN_5918_1750910260318_resized512-JPG.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'rabita-abaya-itsar-syari-x-napocut',
                'sku' => 'ITS-ABY-RBT-005-BW-M',
                'color_name' => 'Broken White',
                'color_hex' => '#F5F0E8',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 9,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/22_1750941527978_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'rabita-abaya-itsar-syari-x-napocut',
                'sku' => 'ITS-ABY-RBT-005-DC-L',
                'color_name' => 'Dark Cherry',
                'color_hex' => '#4A1820',
                'size' => 'L',
                'additional_price' => 0,
                'stock' => 7,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/23_1750941527978_resized256-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'nisbah-khimar-itsar-syari-x-napocut',
                'sku' => 'ITS-KHM-NSB-006-BK-STD',
                'color_name' => 'Black',
                'color_hex' => '#111111',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 18,
                'reserved_stock' => 2,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/24_1750941944929_resized512-jpg.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'nisbah-khimar-itsar-syari-x-napocut',
                'sku' => 'ITS-KHM-NSB-006-DW-STD',
                'color_name' => 'Drift Wood',
                'color_hex' => '#7D6A58',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 14,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Nisbah_-_Driftwood_1749804276452_resized256-png.webp',
                'is_active' => true,
            ],
            [
                'product_slug' => 'nisbah-khimar-itsar-syari-x-napocut',
                'sku' => 'ITS-KHM-NSB-006-FP-STD',
                'color_name' => 'Fawn Pink',
                'color_hex' => '#C9A19A',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 12,
                'reserved_stock' => 1,
                'image_url' => 'https://d2kchovjbwl1tk.cloudfront.net/vendor/6241/product/Nisbah_-_Fawn_Pink_1749804276453_resized256-png.webp',
                'is_active' => true,
            ],
        ];

        $productIds = Product::query()
            ->whereIn('slug', collect($variants)->pluck('product_slug')->unique()->all())
            ->pluck('id', 'slug');

        foreach ($variants as $variant) {
            $productId = $productIds->get($variant['product_slug']);

            if (! $productId) {
                throw new RuntimeException("Product slug [{$variant['product_slug']}] tidak ditemukan.");
            }

            $record = ProductVariant::query()
                ->withTrashed()
                ->updateOrCreate(
                    ['sku' => $variant['sku']],
                    [
                        'product_id' => $productId,
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
        }
    }
}
