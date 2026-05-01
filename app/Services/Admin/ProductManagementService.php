<?php

namespace App\Services\Admin;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Stock\StockLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductManagementService
{
    public function __construct(
        private readonly ProductImageService $images,
        private readonly StockLogService $stockLogs,
    ) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'category_id' => $request->string('category_id')->toString(),
            'collection_id' => $request->string('collection_id')->toString(),
            'status' => $request->string('status')->toString(),
            'stock_status' => $request->string('stock_status')->toString(),
            'is_featured' => $request->string('is_featured')->toString(),
            'is_new_arrival' => $request->string('is_new_arrival')->toString(),
            'is_best_seller' => $request->string('is_best_seller')->toString(),
        ];

        return [
            'products' => Product::query()
                ->with(['category:id,name', 'collection:id,name', 'primaryImage:id,product_id,image_url,alt_text'])
                ->withSum('variants as total_stock', 'stock')
                ->withCount('variants')
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('sku', 'like', "%{$filters['search']}%")))
                ->when($filters['category_id'] !== '', fn ($query) => $query->where('category_id', $filters['category_id']))
                ->when($filters['collection_id'] !== '', fn ($query) => $query->where('collection_id', $filters['collection_id']))
                ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
                ->when($filters['is_featured'] !== '', fn ($query) => $query->where('is_featured', $filters['is_featured'] === '1'))
                ->when($filters['is_new_arrival'] !== '', fn ($query) => $query->where('is_new_arrival', $filters['is_new_arrival'] === '1'))
                ->when($filters['is_best_seller'] !== '', fn ($query) => $query->where('is_best_seller', $filters['is_best_seller'] === '1'))
                ->when($filters['stock_status'] === 'in_stock', fn ($query) => $query->whereHas('variants', fn ($query) => $query->where('stock', '>', 5)))
                ->when($filters['stock_status'] === 'low_stock', fn ($query) => $query->whereHas('variants', fn ($query) => $query->whereBetween('stock', [1, 5])))
                ->when($filters['stock_status'] === 'sold_out', fn ($query) => $query->whereDoesntHave('variants', fn ($query) => $query->where('stock', '>', 0)))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Product $product): array => $this->row($product)),
            'filters' => $filters,
            'options' => $this->options(),
        ];
    }

    public function create(Request $request): Product
    {
        $validated = $request->validated();
        $this->assertVariantSkusAreUnique($validated['variants'] ?? []);

        return DB::transaction(function () use ($request, $validated): Product {
            $product = Product::query()->create($this->payload($request, $validated));
            $this->images->sync($request, $product, $validated['images'] ?? []);
            $this->syncVariants($product, $validated['variants'] ?? [], $request->user()->id);

            return $product;
        });
    }

    public function update(Product $product, Request $request): void
    {
        $validated = $request->validated();
        $this->assertVariantSkusAreUnique($validated['variants'] ?? [], $product);

        DB::transaction(function () use ($request, $product, $validated): void {
            $product->update($this->payload($request, $validated));
            $this->images->sync($request, $product, $validated['images'] ?? []);
            $this->syncVariants($product, $validated['variants'] ?? [], $request->user()->id);
        });
    }

    public function publish(Product $product): void
    {
        $product->loadCount(['images as primary_images_count' => fn ($query) => $query->where('is_primary', true)]);
        $hasActiveVariant = $product->variants()->where('is_active', true)->where('stock', '>', 0)->exists();

        if ($product->primary_images_count < 1 || ! $hasActiveVariant || $product->weight < 1 || $product->base_price < 0) {
            throw ValidationException::withMessages([
                'product' => 'Produk published membutuhkan gambar utama, varian aktif dengan stok, berat, dan harga valid.',
            ]);
        }

        $product->update(['status' => 'published']);
    }

    public function archive(Product $product): void
    {
        $product->update(['status' => 'archived']);
    }

    public function duplicate(Product $product): Product
    {
        return DB::transaction(function () use ($product): Product {
            $product->load(['images', 'variants']);
            $copy = $product->replicate(['slug', 'sku', 'status']);
            $copy->name = $product->name.' Copy';
            $copy->slug = $this->uniqueSlug($product->slug.'-copy');
            $copy->sku = $product->sku ? $this->uniqueSku($product->sku.'-COPY') : null;
            $copy->status = 'draft';
            $copy->save();

            foreach ($product->images as $image) {
                $copy->images()->create($image->only(['image_url', 'alt_text', 'sort_order', 'is_primary']));
            }

            foreach ($product->variants as $variant) {
                $variantCopy = $variant->replicate(['sku']);
                $variantCopy->sku = $this->uniqueVariantSku($variant->sku.'-COPY');
                $copy->variants()->save($variantCopy);
            }

            return $copy;
        });
    }

    public function delete(Product $product): array
    {
        if ($product->orderItems()->exists()) {
            $product->update(['status' => 'archived']);

            return [
                'archived' => true,
                'message' => 'Product sudah pernah dipesan, jadi diarsipkan.',
            ];
        }

        $product->delete();

        return [
            'archived' => false,
            'message' => 'Product berhasil dihapus.',
        ];
    }

    public function showData(Product $product): array
    {
        $product->load([
            'category:id,name',
            'collection:id,name',
            'images',
            'variants' => fn ($query) => $query->withCount('orderItems')->latest(),
            'variants.stockLogs' => fn ($query) => $query->latest()->limit(10),
            'orderItems' => fn ($query) => $query->latest()->limit(10),
        ]);

        return $this->detail($product);
    }

    public function formData(Product $product): array
    {
        $product->loadMissing(['images', 'variants']);

        return [
            ...$product->only([
                'id', 'category_id', 'collection_id', 'name', 'slug', 'sku', 'short_description', 'description',
                'material', 'care_instruction', 'base_price', 'sale_price', 'weight', 'length', 'width', 'height',
                'status', 'is_featured', 'is_new_arrival', 'is_best_seller', 'meta_title', 'meta_description',
            ]),
            'images' => $product->images->map->only(['id', 'image_url', 'alt_text', 'sort_order', 'is_primary'])->values(),
            'variants' => $product->variants->map->only(['id', 'sku', 'color_name', 'color_hex', 'size', 'additional_price', 'stock', 'reserved_stock', 'image_url', 'is_active'])->values(),
        ];
    }

    public function options(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'collections' => Collection::query()->orderBy('name')->get(['id', 'name']),
            'statuses' => ['draft', 'published', 'archived'],
        ];
    }

    private function payload(Request $request, array $validated): array
    {
        return [
            ...collect($validated)->except(['images', 'variants'])->all(),
            'is_featured' => $request->boolean('is_featured'),
            'is_new_arrival' => $request->boolean('is_new_arrival'),
            'is_best_seller' => $request->boolean('is_best_seller'),
        ];
    }

    private function syncVariants(Product $product, array $variants, int $userId): void
    {
        $variants = collect($variants)->filter(fn (array $variant): bool => filled($variant['sku'] ?? null))->values();
        $keptIds = [];

        foreach ($variants as $variant) {
            $payload = [
                'sku' => $variant['sku'],
                'color_name' => $variant['color_name'] ?? null,
                'color_hex' => $variant['color_hex'] ?? null,
                'size' => $variant['size'] ?? null,
                'additional_price' => $variant['additional_price'] ?? 0,
                'stock' => $variant['stock'] ?? 0,
                'reserved_stock' => $variant['reserved_stock'] ?? 0,
                'image_url' => $variant['image_url'] ?? null,
                'is_active' => (bool) ($variant['is_active'] ?? false),
            ];

            if (! empty($variant['id'])) {
                $productVariant = $product->variants()->whereKey($variant['id'])->firstOrFail();
                $stockBefore = $productVariant->stock;
                $productVariant->update($payload);
                $this->stockLogs->logIfChanged($productVariant, $stockBefore, $payload['stock'], $userId, 'adjustment', 'Stock updated from product form.');
                $keptIds[] = (int) $variant['id'];

                continue;
            }

            $created = $product->variants()->create($payload);
            $this->stockLogs->logIfChanged($created, 0, $created->stock, $userId, 'adjustment', 'Initial variant stock.');
            $keptIds[] = $created->id;
        }

        $product->variants()->whereNotIn('id', $keptIds)->get()->each(function (ProductVariant $variant): void {
            if ($variant->orderItems()->exists()) {
                $variant->update(['is_active' => false]);

                return;
            }

            $variant->delete();
        });
    }

    private function assertVariantSkusAreUnique(array $variants, ?Product $product = null): void
    {
        $incoming = collect($variants)->pluck('sku')->filter()->values();

        if ($incoming->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages(['variants' => 'SKU varian tidak boleh duplikat dalam satu produk.']);
        }

        $query = ProductVariant::query()->whereIn('sku', $incoming);

        if ($product) {
            $query->where('product_id', '!=', $product->id);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages(['variants' => 'Salah satu SKU varian sudah digunakan produk lain.']);
        }
    }

    private function uniqueSlug(string $slug): string
    {
        $base = Str::slug($slug);
        $candidate = $base;
        $count = 2;

        while (Product::query()->where('slug', $candidate)->exists()) {
            $candidate = "{$base}-{$count}";
            $count++;
        }

        return $candidate;
    }

    private function uniqueSku(string $sku): string
    {
        $candidate = $sku;
        $count = 2;

        while (Product::query()->where('sku', $candidate)->exists()) {
            $candidate = "{$sku}-{$count}";
            $count++;
        }

        return $candidate;
    }

    private function uniqueVariantSku(string $sku): string
    {
        $candidate = $sku;
        $count = 2;

        while (ProductVariant::query()->where('sku', $candidate)->exists()) {
            $candidate = "{$sku}-{$count}";
            $count++;
        }

        return $candidate;
    }

    private function row(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category' => $product->category?->name,
            'collection' => $product->collection?->name,
            'thumbnail' => $product->primaryImage?->image_url,
            'base_price' => $product->base_price,
            'sale_price' => $product->sale_price,
            'total_stock' => (int) ($product->total_stock ?? 0),
            'variants_count' => $product->variants_count,
            'status' => $product->status,
            'is_featured' => $product->is_featured,
            'is_new_arrival' => $product->is_new_arrival,
            'is_best_seller' => $product->is_best_seller,
            'created_at' => $product->created_at?->toFormattedDateString(),
        ];
    }

    private function detail(Product $product): array
    {
        return [
            ...$this->formData($product),
            'category' => $product->category?->name,
            'collection' => $product->collection?->name,
            'orders' => $product->orderItems->map(fn ($item): array => [
                'id' => $item->id,
                'order_id' => $item->order_id,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
                'created_at' => $item->created_at?->toFormattedDateString(),
            ])->values(),
            'stock_logs' => $product->variants
                ->flatMap(fn (ProductVariant $variant) => $variant->stockLogs->map(fn ($log): array => [
                    'id' => $log->id,
                    'variant' => $variant->sku,
                    'type' => $log->type,
                    'quantity' => $log->quantity,
                    'stock_before' => $log->stock_before,
                    'stock_after' => $log->stock_after,
                    'created_at' => $log->created_at?->toFormattedDateString(),
                ]))
                ->sortByDesc('created_at')
                ->take(10)
                ->values(),
        ];
    }
}
