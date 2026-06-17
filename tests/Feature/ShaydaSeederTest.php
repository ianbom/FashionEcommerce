<?php

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Database\Seeders\CategorySeeder;
use Database\Seeders\CollectionSeeder;
use Database\Seeders\ShaydaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('seeds shayda products with at least two real variants per product idempotently', function () {
    $this->seed([
        CategorySeeder::class,
        CollectionSeeder::class,
        ShaydaSeeder::class,
    ]);

    $dressCategory = Category::query()->where('slug', 'womens-dresses')->firstOrFail();
    $eidCollection = Collection::query()->where('slug', 'eid-radiance')->firstOrFail();

    $products = Product::query()
        ->with(['images', 'variants'])
        ->where('slug', 'like', 'shayda-%')
        ->orderBy('slug')
        ->get();

    expect($products)->toHaveCount(5);
    expect($products->flatMap->variants)->toHaveCount(20);

    foreach ($products as $product) {
        expect($product->category_id)->toBe($dressCategory->id)
            ->and($product->collection_id)->toBe($eidCollection->id)
            ->and($product->status)->toBe('published')
            ->and($product->images)->toHaveCount(3)
            ->and($product->images->where('is_primary', true))->toHaveCount(1)
            ->and($product->variants)->toHaveCount(4)
            ->and($product->variants->pluck('color_name')->unique()->count())->toBeGreaterThanOrEqual(2);

        expect($product->images->pluck('image_url')->every(fn (string $url): bool => str_starts_with($url, '/FotoShayda/')))->toBeTrue();
        expect($product->variants->pluck('image_url')->every(fn (?string $url): bool => is_string($url) && str_starts_with($url, '/FotoShayda/')))->toBeTrue();
        expect($product->variants->pluck('sku')->every(fn (string $sku): bool => str_starts_with($sku, 'SHAYDA-')))->toBeTrue();
    }

    $nauraProduct = $products->firstWhere('slug', 'shayda-naura-set');

    $this->assertDatabaseHas('products', [
        'slug' => 'shayda-naura-set',
        'sku' => 'SHAYDA-SET-001',
        'name' => 'Shayda Naura Set',
        'base_price' => 489000,
        'sale_price' => 459000,
        'status' => 'published',
    ]);

    $this->assertDatabaseHas('product_images', [
        'product_id' => $nauraProduct->id,
        'image_url' => '/FotoShayda/2353D225-97BD-4835-AF25-7599A8D1CCA0.JPEG',
        'sort_order' => 0,
        'is_primary' => true,
    ]);

    $this->assertDatabaseHas('product_variants', [
        'product_id' => $nauraProduct->id,
        'sku' => 'SHAYDA-SET-001-MAUVE-M',
        'color_name' => 'Dusty Mauve',
        'color_hex' => '#B6A5AE',
        'size' => 'M',
        'stock' => 15,
        'reserved_stock' => 2,
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('product_variants', [
        'product_id' => $nauraProduct->id,
        'sku' => 'SHAYDA-SET-001-NAVY-L',
        'color_name' => 'Midnight Navy',
        'color_hex' => '#2B3C57',
        'size' => 'L',
        'additional_price' => 10000,
        'is_active' => true,
    ]);

    $this->seed(ShaydaSeeder::class);

    expect(Product::query()->where('slug', 'like', 'shayda-%')->count())->toBe(5);

    $naura = Product::query()
        ->with(['images', 'variants'])
        ->where('slug', 'shayda-naura-set')
        ->firstOrFail();

    expect($naura->images)->toHaveCount(3)
        ->and($naura->variants)->toHaveCount(4)
        ->and($naura->variants->pluck('color_name')->unique()->count())->toBeGreaterThanOrEqual(2);
});
