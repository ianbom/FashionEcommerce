<?php

namespace App\Actions\Stock;

use App\Models\Order;
use App\Models\ProductVariant;
use DomainException;
use Illuminate\Support\Facades\Log;

class FinalizeReservedStockAction
{
    public function execute(Order $order, ?string $reference = null): void
    {
        $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);

        if ($order->stock_finalized_at) {
            return;
        }

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->firstOrFail();

            if ($variant->stock < $item->quantity || $variant->reserved_stock < $item->quantity) {
                Log::error('stock_invariant_failed', [
                    'order_id' => $order->id,
                    'variant_id' => $variant->id,
                    'stock' => $variant->stock,
                    'reserved_stock' => $variant->reserved_stock,
                    'quantity' => $item->quantity,
                ]);

                throw new DomainException('Stock invariant failed.');
            }

            $before = $variant->stock;
            $after = $before - $item->quantity;
            $variant->update([
                'stock' => $after,
                'reserved_stock' => $variant->reserved_stock - $item->quantity,
            ]);
            $variant->stockLogs()->create([
                'type' => 'order',
                'quantity' => -$item->quantity,
                'stock_before' => $before,
                'stock_after' => $after,
                'reference_type' => 'order',
                'reference_id' => $order->id,
                'note' => "Stock finalized after payment {$reference}.",
            ]);
        }

        $order->forceFill(['stock_finalized_at' => now()])->save();
    }
}
