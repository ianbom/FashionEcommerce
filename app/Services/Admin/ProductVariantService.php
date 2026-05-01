<?php

namespace App\Services\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Stock\StockLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductVariantService
{
    use StoresUploadedFiles;

    public function __construct(private readonly StockLogService $stockLogs) {}

    public function indexData(Request $request, ?Product $product = null): array
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        return [
            'variants' => ProductVariant::query()
                ->with('product:id,name,slug')
                ->withCount('orderItems')
                ->when($product, fn ($query) => $query->whereBelongsTo($product))
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('sku', 'like', "%{$search}%")
                    ->orWhere('color_name', 'like', "%{$search}%")
                    ->orWhere('size', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$search}%"))))
                ->when($status === 'active', fn ($query) => $query->where('is_active', true))
                ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (ProductVariant $variant): array => $this->row($variant)),
            'product' => $product ? ['id' => $product->id, 'name' => $product->name] : null,
            'filters' => ['search' => $search, 'status' => $status],
        ];
    }

    public function create(Request $request): ProductVariant
    {
        $validated = $this->payload($request, true);

        return DB::transaction(function () use ($request, $validated): ProductVariant {
            $variant = ProductVariant::query()->create($validated);
            $this->stockLogs->logIfChanged($variant, 0, $variant->stock, $request->user()->id, 'adjustment', 'Initial variant stock.');

            return $variant;
        });
    }

    public function update(ProductVariant $variant, Request $request): void
    {
        $validated = $this->payload($request, false, $variant);

        DB::transaction(function () use ($request, $variant, $validated): void {
            $stockBefore = $variant->stock;
            $variant->update($validated);
            $this->stockLogs->logIfChanged($variant, $stockBefore, $variant->stock, $request->user()->id, 'adjustment', 'Stock updated from variant form.');
        });
    }

    public function delete(ProductVariant $variant): string
    {
        if ($variant->orderItems()->exists()) {
            $variant->update(['is_active' => false]);

            return 'Variant sudah pernah dibeli, jadi dinonaktifkan.';
        }

        $this->deletePublicFile($variant->image_url);
        $variant->delete();

        return 'Variant berhasil dihapus.';
    }

    public function productOptions()
    {
        return Product::query()->orderBy('name')->get(['id', 'name']);
    }

    public function formData(ProductVariant $variant): array
    {
        $variant->load('product:id,name');

        return [
            ...$variant->only(['id', 'product_id', 'sku', 'color_name', 'color_hex', 'size', 'additional_price', 'stock', 'reserved_stock', 'image_url', 'is_active']),
            'product' => $variant->product?->name,
        ];
    }

    public function row(ProductVariant $variant): array
    {
        return [
            'id' => $variant->id,
            'product_id' => $variant->product_id,
            'product' => $variant->product?->name,
            'sku' => $variant->sku,
            'color_name' => $variant->color_name,
            'color_hex' => $variant->color_hex,
            'size' => $variant->size,
            'additional_price' => $variant->additional_price,
            'stock' => $variant->stock,
            'reserved_stock' => $variant->reserved_stock,
            'available_stock' => $variant->stock - $variant->reserved_stock,
            'image_url' => $variant->image_url,
            'is_active' => $variant->is_active,
            'order_items_count' => $variant->order_items_count,
            'created_at' => $variant->created_at?->toFormattedDateString(),
        ];
    }

    private function payload(Request $request, bool $defaultActive, ?ProductVariant $variant = null): array
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', $defaultActive);
        unset($validated['image']);

        if ($request->hasFile('image')) {
            $this->deletePublicFile($variant?->image_url);
            $validated['image_url'] = $this->storePublicFile($request->file('image'), 'images/variants');
        }

        return $validated;
    }
}
