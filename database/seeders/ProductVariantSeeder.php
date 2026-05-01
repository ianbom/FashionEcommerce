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
                'product_slug' => 'aurelia-linen-relaxed-shirt',
                'sku' => 'PRD-WTS-LIN-001-IV-S',
                'color_name' => 'Ivory',
                'color_hex' => '#F6F1EA',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 18,
                'reserved_stock' => 2,
                'image_url' => 'https://picsum.photos/seed/variant-aurelia-ivory/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'aurelia-linen-relaxed-shirt',
                'sku' => 'PRD-WTS-LIN-001-SG-M',
                'color_name' => 'Sage',
                'color_hex' => '#A3B18A',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 14,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-aurelia-sage/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'selene-pleated-midi-dress',
                'sku' => 'PRD-WDR-PLT-002-NV-S',
                'color_name' => 'Navy',
                'color_hex' => '#1F2A44',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 12,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-selene-navy/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'selene-pleated-midi-dress',
                'sku' => 'PRD-WDR-PLT-002-MV-M',
                'color_name' => 'Mauve',
                'color_hex' => '#9D7D8A',
                'size' => 'M',
                'additional_price' => 20000,
                'stock' => 9,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-selene-mauve/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'noah-oxford-smart-shirt',
                'sku' => 'PRD-MSH-OXF-003-LB-M',
                'color_name' => 'Light Blue',
                'color_hex' => '#AFC8E8',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 20,
                'reserved_stock' => 3,
                'image_url' => 'https://picsum.photos/seed/variant-noah-lightblue/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'noah-oxford-smart-shirt',
                'sku' => 'PRD-MSH-OXF-003-WH-L',
                'color_name' => 'White',
                'color_hex' => '#F8F8F8',
                'size' => 'L',
                'additional_price' => 0,
                'stock' => 16,
                'reserved_stock' => 2,
                'image_url' => 'https://picsum.photos/seed/variant-noah-white/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'astra-cropped-blazer',
                'sku' => 'PRD-OUT-BLZ-004-BK-S',
                'color_name' => 'Black',
                'color_hex' => '#1C1C1C',
                'size' => 'S',
                'additional_price' => 0,
                'stock' => 10,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-astra-black/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'astra-cropped-blazer',
                'sku' => 'PRD-OUT-BLZ-004-BG-M',
                'color_name' => 'Beige',
                'color_hex' => '#D8C3A5',
                'size' => 'M',
                'additional_price' => 30000,
                'stock' => 8,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-astra-beige/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'mira-satin-hijab',
                'sku' => 'PRD-ACC-HJB-005-RG-STD',
                'color_name' => 'Rose Gold',
                'color_hex' => '#B76E79',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 45,
                'reserved_stock' => 5,
                'image_url' => 'https://picsum.photos/seed/variant-mira-rosegold/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'mira-satin-hijab',
                'sku' => 'PRD-ACC-HJB-005-SL-STD',
                'color_name' => 'Silver Mist',
                'color_hex' => '#C0C0C0',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 38,
                'reserved_stock' => 4,
                'image_url' => 'https://picsum.photos/seed/variant-mira-silver/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'arden-knit-cardigan',
                'sku' => 'PRD-OUT-KNT-006-CR-M',
                'color_name' => 'Cream',
                'color_hex' => '#F4EDE4',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 13,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-arden-cream/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'arden-knit-cardigan',
                'sku' => 'PRD-OUT-KNT-006-CH-L',
                'color_name' => 'Charcoal',
                'color_hex' => '#4A4A4A',
                'size' => 'L',
                'additional_price' => 25000,
                'stock' => 11,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-arden-charcoal/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'luca-slip-on-loafers',
                'sku' => 'PRD-FWT-LOF-007-BK-41',
                'color_name' => 'Black',
                'color_hex' => '#111111',
                'size' => '41',
                'additional_price' => 0,
                'stock' => 7,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-luca-black-41/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'luca-slip-on-loafers',
                'sku' => 'PRD-FWT-LOF-007-BK-42',
                'color_name' => 'Black',
                'color_hex' => '#111111',
                'size' => '42',
                'additional_price' => 0,
                'stock' => 6,
                'reserved_stock' => 1,
                'image_url' => 'https://picsum.photos/seed/variant-luca-black-42/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'elio-utility-overshirt',
                'sku' => 'PRD-MSH-UTL-008-OL-M',
                'color_name' => 'Olive',
                'color_hex' => '#6B705C',
                'size' => 'M',
                'additional_price' => 0,
                'stock' => 5,
                'reserved_stock' => 0,
                'image_url' => 'https://picsum.photos/seed/variant-elio-olive/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'elio-utility-overshirt',
                'sku' => 'PRD-MSH-UTL-008-SD-L',
                'color_name' => 'Sand',
                'color_hex' => '#D9C6A5',
                'size' => 'L',
                'additional_price' => 15000,
                'stock' => 4,
                'reserved_stock' => 0,
                'image_url' => 'https://picsum.photos/seed/variant-elio-sand/1200/1600',
                'is_active' => true,
            ],
            [
                'product_slug' => 'vera-classic-tote-bag',
                'sku' => 'PRD-ACC-TOT-009-BK-STD',
                'color_name' => 'Black',
                'color_hex' => '#1F1F1F',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 0,
                'reserved_stock' => 0,
                'image_url' => 'https://picsum.photos/seed/variant-vera-black/1200/1600',
                'is_active' => false,
            ],
            [
                'product_slug' => 'vera-classic-tote-bag',
                'sku' => 'PRD-ACC-TOT-009-TA-STD',
                'color_name' => 'Tan',
                'color_hex' => '#B08968',
                'size' => 'Standard',
                'additional_price' => 0,
                'stock' => 0,
                'reserved_stock' => 0,
                'image_url' => 'https://picsum.photos/seed/variant-vera-tan/1200/1600',
                'is_active' => false,
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
