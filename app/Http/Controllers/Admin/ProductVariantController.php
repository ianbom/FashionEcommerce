<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class ProductVariantController extends Controller
{
    public function index(Request $request, ?Product $product = null): Response
    {
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        $variants = ProductVariant::query()
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
            ->through(fn (ProductVariant $variant): array => $this->variantRow($variant));

        return inertia('admin/product-variants/index', [
            'variants' => $variants,
            'product' => $product ? ['id' => $product->id, 'name' => $product->name] : null,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function create(Request $request): Response
    {
        return inertia('admin/product-variants/form', [
            'mode' => 'create',
            'variant' => null,
            'products' => $this->productOptions(),
            'selectedProductId' => $request->integer('product_id') ?: null,
        ]);
    }

    public function store(ProductVariantRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active', true);
        unset($validated['image']);

        if ($request->hasFile('image')) {
            $validated['image_url'] = Storage::url(
                $request->file('image')->store('images/variants', 'public')
            );
        }

        $variant = DB::transaction(function () use ($request, $validated): ProductVariant {
            $variant = ProductVariant::query()->create($validated);

            if ($variant->stock !== 0) {
                $variant->stockLogs()->create([
                    'user_id' => $request->user()->id,
                    'type' => 'adjustment',
                    'quantity' => $variant->stock,
                    'stock_before' => 0,
                    'stock_after' => $variant->stock,
                    'reference_type' => 'manual_adjustment',
                    'note' => 'Initial variant stock.',
                ]);
            }

            return $variant;
        });

        return redirect()->route('admin.product-variants.edit', $variant)->with('success', 'Variant berhasil dibuat.');
    }

    public function edit(ProductVariant $productVariant): Response
    {
        $productVariant->load('product:id,name');

        return inertia('admin/product-variants/form', [
            'mode' => 'edit',
            'variant' => [
                ...$productVariant->only(['id', 'product_id', 'sku', 'color_name', 'color_hex', 'size', 'additional_price', 'stock', 'reserved_stock', 'image_url', 'is_active']),
                'product' => $productVariant->product?->name,
            ],
            'products' => $this->productOptions(),
            'selectedProductId' => null,
        ]);
    }

    public function update(ProductVariantRequest $request, ProductVariant $productVariant): RedirectResponse
    {
        $validated = $request->validated();
        $validated['is_active'] = $request->boolean('is_active');
        unset($validated['image']);

        if ($request->hasFile('image')) {
            if ($productVariant->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $productVariant->image_url));
            }
            $validated['image_url'] = Storage::url(
                $request->file('image')->store('images/variants', 'public')
            );
        }

        DB::transaction(function () use ($request, $productVariant, $validated): void {
            $stockBefore = $productVariant->stock;
            $productVariant->update($validated);

            if ($stockBefore !== $productVariant->stock) {
                $productVariant->stockLogs()->create([
                    'user_id' => $request->user()->id,
                    'type' => 'adjustment',
                    'quantity' => $productVariant->stock - $stockBefore,
                    'stock_before' => $stockBefore,
                    'stock_after' => $productVariant->stock,
                    'reference_type' => 'manual_adjustment',
                    'note' => 'Stock updated from variant form.',
                ]);
            }
        });

        return redirect()->route('admin.product-variants.edit', $productVariant)->with('success', 'Variant berhasil diperbarui.');
    }

    public function destroy(ProductVariant $productVariant): RedirectResponse
    {
        if ($productVariant->orderItems()->exists()) {
            $productVariant->update(['is_active' => false]);

            return back()->with('success', 'Variant sudah pernah dibeli, jadi dinonaktifkan.');
        }

        // Delete variant image from storage
        if ($productVariant->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $productVariant->image_url));
        }

        $productVariant->delete();

        return redirect()->route('admin.product-variants.index')->with('success', 'Variant berhasil dihapus.');
    }

    /**
     * @return Collection<int, Product>
     */
    private function productOptions()
    {
        return Product::query()->orderBy('name')->get(['id', 'name']);
    }

    /**
     * @return array<string, mixed>
     */
    private function variantRow(ProductVariant $variant): array
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
}
