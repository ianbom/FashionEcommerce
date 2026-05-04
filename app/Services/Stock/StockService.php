<?php

namespace App\Services\Stock;

use App\Services\Admin\ResolvesAdminPagination;
use App\Models\ProductVariant;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    use ResolvesAdminPagination;

    public function __construct(private readonly StockLogService $stockLogs) {}

    public function variantsIndex(Request $request): array
    {
        $search = $request->string('search')->toString();
        $stockStatus = $request->string('stock_status')->toString();

        return [
            'variants' => ProductVariant::query()
                ->with('product:id,name')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('sku', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$search}%"))))
                ->when($stockStatus === 'low_stock', fn ($query) => $query->whereBetween('stock', [1, 5]))
                ->when($stockStatus === 'sold_out', fn ($query) => $query->where('stock', '<=', 0))
                ->when($stockStatus === 'in_stock', fn ($query) => $query->where('stock', '>', 5))
                ->orderBy('stock')
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (ProductVariant $variant): array => $this->variantRow($variant)),
            'filters' => ['search' => $search, 'stock_status' => $stockStatus],
            'stats' => [
                'total' => ProductVariant::query()->count(),
                'in_stock' => ProductVariant::query()->whereRaw('(stock - reserved_stock) > 5')->count(),
                'low_stock' => ProductVariant::query()->whereRaw('(stock - reserved_stock) > 0')->whereRaw('(stock - reserved_stock) <= 5')->count(),
                'sold_out' => ProductVariant::query()->whereRaw('(stock - reserved_stock) = 0')->count(),
            ],
        ];
    }

    public function logsIndex(Request $request): array
    {
        $search = $request->string('search')->toString();
        $type = $request->string('type')->toString();

        return [
            'logs' => StockLog::query()
                ->with(['variant.product:id,name', 'user:id,name'])
                ->when($search !== '', fn ($query) => $query->whereHas('variant', fn ($query) => $query->where('sku', 'like', "%{$search}%")))
                ->when($type !== '', fn ($query) => $query->where('type', $type))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (StockLog $log): array => $this->logRow($log)),
            'filters' => ['search' => $search, 'type' => $type],
        ];
    }

    public function adjustmentForm(ProductVariant $variant): array
    {
        $variant->load('product:id,name');

        return [
            'id' => $variant->id,
            'product' => $variant->product?->name,
            'sku' => $variant->sku,
            'stock' => $variant->stock,
            'reserved_stock' => $variant->reserved_stock,
            'available_stock' => $variant->stock - $variant->reserved_stock,
        ];
    }

    public function adjust(ProductVariant $productVariant, Request $request): void
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
            $this->stockLogs->logIfChanged(
                $variant,
                $stockBefore,
                $stockAfter,
                $request->user()->id,
                $request->input('type'),
                (string) $request->input('note'),
            );
        });
    }

    public function variantRow(ProductVariant $variant): array
    {
        return [
            'id' => $variant->id,
            'product' => $variant->product?->name,
            'sku' => $variant->sku,
            'color_name' => $variant->color_name,
            'size' => $variant->size,
            'stock' => $variant->stock,
            'reserved_stock' => $variant->reserved_stock,
            'available_stock' => $variant->stock - $variant->reserved_stock,
            'is_active' => $variant->is_active,
        ];
    }

    private function logRow(StockLog $log): array
    {
        return [
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
        ];
    }
}
