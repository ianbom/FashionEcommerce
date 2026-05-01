<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StockAdjustmentRequest;
use App\Models\ProductVariant;
use App\Models\StockLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $stockStatus = $request->string('stock_status')->toString();

        $variants = ProductVariant::query()
            ->with('product:id,name')
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('sku', 'like', "%{$search}%")
                ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$search}%"))))
            ->when($stockStatus === 'low_stock', fn ($query) => $query->whereBetween('stock', [1, 5]))
            ->when($stockStatus === 'sold_out', fn ($query) => $query->where('stock', '<=', 0))
            ->when($stockStatus === 'in_stock', fn ($query) => $query->where('stock', '>', 5))
            ->orderBy('stock')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ProductVariant $variant): array => [
                'id' => $variant->id,
                'product' => $variant->product?->name,
                'sku' => $variant->sku,
                'color_name' => $variant->color_name,
                'size' => $variant->size,
                'stock' => $variant->stock,
                'reserved_stock' => $variant->reserved_stock,
                'available_stock' => $variant->stock - $variant->reserved_stock,
                'is_active' => $variant->is_active,
            ]);

        return inertia('admin/stock/index', [
            'variants' => $variants,
            'filters' => ['search' => $search, 'stock_status' => $stockStatus],
        ]);
    }

    public function logs(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();

        $logs = StockLog::query()
            ->with(['variant.product:id,name', 'user:id,name'])
            ->when($search !== '', fn ($query) => $query->whereHas('variant', fn ($query) => $query->where('sku', 'like', "%{$search}%")))
            ->when($type !== '', fn ($query) => $query->where('type', $type))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (StockLog $log): array => [
                'id' => $log->id,
                'product' => $log->variant?->product?->name,
                'variant' => $log->variant?->sku,
                'type' => $log->type,
                'quantity' => $log->quantity,
                'stock_before' => $log->stock_before,
                'stock_after' => $log->stock_after,
                'reference' => trim(($log->reference_type ?? '').' #'.($log->reference_id ?? ''), ' #'),
                'admin' => $log->user?->name,
                'note' => $log->note,
                'created_at' => $log->created_at?->toFormattedDateString(),
            ]);

        return inertia('admin/stock/logs', [
            'logs' => $logs,
            'filters' => ['search' => $search, 'type' => $type],
        ]);
    }

    public function edit(ProductVariant $productVariant): Response
    {
        $productVariant->load('product:id,name');

        return inertia('admin/stock/adjustment', [
            'variant' => [
                'id' => $productVariant->id,
                'product' => $productVariant->product?->name,
                'sku' => $productVariant->sku,
                'stock' => $productVariant->stock,
                'reserved_stock' => $productVariant->reserved_stock,
                'available_stock' => $productVariant->stock - $productVariant->reserved_stock,
            ],
        ]);
    }

    public function update(StockAdjustmentRequest $request, ProductVariant $productVariant): RedirectResponse
    {
        DB::transaction(function () use ($request, $productVariant): void {
            $variant = ProductVariant::query()->whereKey($productVariant->id)->lockForUpdate()->firstOrFail();
            $quantity = (int) $request->integer('quantity');

            if ($request->input('type') === 'out' && $quantity > 0) {
                $quantity = -$quantity;
            }

            $stockAfter = $variant->stock + $quantity;

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'Adjustment tidak boleh membuat stok menjadi negatif.',
                ]);
            }

            $stockBefore = $variant->stock;
            $variant->update(['stock' => $stockAfter]);
            $variant->stockLogs()->create([
                'user_id' => $request->user()->id,
                'type' => $request->input('type'),
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reference_type' => 'manual_adjustment',
                'note' => $request->input('note'),
            ]);
        });

        return redirect()->route('admin.stock.index')->with('success', 'Stock adjustment berhasil disimpan.');
    }
}
