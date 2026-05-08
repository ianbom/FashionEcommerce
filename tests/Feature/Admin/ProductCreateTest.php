<?php

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

it('creates a product with images, variants, and stock logs from the admin form payload', function () {
    Storage::fake('public');

    $admin = User::factory()->create([
        'role' => 'admin',
        'is_active' => true,
    ]);

    $category = Category::query()->create([
        'name' => 'Gamis',
        'slug' => 'gamis',
        'description' => 'Gamis category',
        'is_active' => true,
    ]);

    $collection = Collection::query()->create([
        'name' => 'Ramadan Collection',
        'slug' => 'ramadan-collection',
        'description' => 'Ramadan collection',
        'is_featured' => true,
        'is_active' => true,
    ]);

    $payload = productPayload($category, $collection);

    $this->actingAs($admin)
        ->post(route('admin.products.store'), $payload)
        ->assertRedirect();

    $product = Product::query()
        ->where('slug', 'gamis-syari-pita')
        ->firstOrFail();

    expect($product)
        ->category_id->toBe($category->id)
        ->collection_id->toBe($collection->id)
        ->name->toBe('Gamis Syar\'i Pita')
        ->sku->toBe('GMS-001')
        ->short_description->toBe('Gamis premium untuk daily wear.')
        ->description->toBe('Gamis premium dengan detail pita dan bahan nyaman.')
        ->material->toBe('Premium voile')
        ->care_instruction->toBe('Hand wash cold, do not bleach.')
        ->status->toBe('published')
        ->is_featured->toBeTrue()
        ->is_new_arrival->toBeTrue()
        ->is_best_seller->toBeFalse()
        ->meta_title->toBe('Gamis Syar\'i Pita Premium')
        ->meta_description->toBe('Gamis premium nyaman untuk aktivitas harian.');

    expect((float) $product->base_price)->toBe(350000.00)
        ->and((float) $product->sale_price)->toBe(299000.00)
        ->and($product->weight)->toBe(500)
        ->and($product->length)->toBe(30)
        ->and($product->width)->toBe(25)
        ->and($product->height)->toBe(5);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'category_id' => $category->id,
        'collection_id' => $collection->id,
        'name' => 'Gamis Syar\'i Pita',
        'slug' => 'gamis-syari-pita',
        'sku' => 'GMS-001',
        'base_price' => 350000,
        'sale_price' => 299000,
        'status' => 'published',
        'is_featured' => true,
        'is_new_arrival' => true,
        'is_best_seller' => false,
    ]);

    $this->assertDatabaseHas('product_images', [
        'product_id' => $product->id,
        'alt_text' => 'Gamis Syar\'i Pita tampak depan',
        'sort_order' => 0,
        'is_primary' => true,
    ]);

    $image = $product->images()->firstOrFail();
    expect($image->image_url)->toStartWith('/storage/product/gamis-syari-pita/');
    Storage::disk('public')->assertExists(Str::after($image->image_url, '/storage/'));

    $variant = ProductVariant::query()
        ->where('sku', 'GMS-001-BLK-M')
        ->firstOrFail();

    expect($variant)
        ->product_id->toBe($product->id)
        ->color_name->toBe('Black')
        ->color_hex->toBe('#000000')
        ->size->toBe('M')
        ->stock->toBe(12)
        ->reserved_stock->toBe(2)
        ->is_active->toBeTrue();

    expect((float) $variant->additional_price)->toBe(15000.00);
    expect($variant->image_url)->toStartWith('/storage/product/gamis-syari-pita/variants/');
    Storage::disk('public')->assertExists(Str::after($variant->image_url, '/storage/'));

    $this->assertDatabaseHas('product_variants', [
        'id' => $variant->id,
        'product_id' => $product->id,
        'sku' => 'GMS-001-BLK-M',
        'color_name' => 'Black',
        'color_hex' => '#000000',
        'size' => 'M',
        'additional_price' => 15000,
        'stock' => 12,
        'reserved_stock' => 2,
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('stock_logs', [
        'product_variant_id' => $variant->id,
        'user_id' => $admin->id,
        'type' => 'adjustment',
        'quantity' => 12,
        'stock_before' => 0,
        'stock_after' => 12,
        'reference_type' => 'manual_adjustment',
        'note' => 'Initial variant stock.',
    ]);
});

/**
 * @return array<string, mixed>
 */
function productPayload(Category $category, Collection $collection): array
{
    return [
        'category_id' => $category->id,
        'collection_id' => $collection->id,
        'name' => 'Gamis Syar\'i Pita',
        'slug' => 'gamis-syari-pita',
        'sku' => 'GMS-001',
        'short_description' => 'Gamis premium untuk daily wear.',
        'description' => 'Gamis premium dengan detail pita dan bahan nyaman.',
        'material' => 'Premium voile',
        'care_instruction' => 'Hand wash cold, do not bleach.',
        'base_price' => 350000,
        'sale_price' => 299000,
        'weight' => 500,
        'length' => 30,
        'width' => 25,
        'height' => 5,
        'status' => 'published',
        'is_featured' => true,
        'is_new_arrival' => true,
        'is_best_seller' => false,
        'meta_title' => 'Gamis Syar\'i Pita Premium',
        'meta_description' => 'Gamis premium nyaman untuk aktivitas harian.',
        'images' => [
            [
                'image_url' => null,
                'image' => UploadedFile::fake()->image('product-front.jpg', 800, 1067),
                'alt_text' => 'Gamis Syar\'i Pita tampak depan',
                'sort_order' => 0,
                'is_primary' => true,
            ],
        ],
        'variants' => [
            [
                'sku' => 'GMS-001-BLK-M',
                'color_name' => 'Black',
                'color_hex' => '#000000',
                'size' => 'M',
                'additional_price' => 15000,
                'stock' => 12,
                'reserved_stock' => 2,
                'image_url' => null,
                'image' => UploadedFile::fake()->image('variant-black.jpg', 800, 1067),
                'is_active' => true,
            ],
        ],
    ];
}
