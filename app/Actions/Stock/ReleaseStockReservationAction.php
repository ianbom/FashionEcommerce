<?php

namespace App\Actions\Stock;

use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Log;

class ReleaseStockReservationAction
{
    public function execute(Order $order): void
    {
        $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);

        if ($order->stock_released_at || $order->stock_finalized_at) {
            return;
        }

        foreach ($order->items as $item) {
            if (! $item->product_variant_id) {
                continue;
            }

            $variant = ProductVariant::query()->whereKey($item->product_variant_id)->lockForUpdate()->first();

            if (! $variant) {
                continue;
            }

            if ($variant->reserved_stock < $item->quantity) {
                Log::error('stock_release_invariant_failed', [
                    'order_id' => $order->id,
                    'variant_id' => $variant->id,
                    'reserved_stock' => $variant->reserved_stock,
                    'quantity' => $item->quantity,
                ]);
            }

            $variant->update(['reserved_stock' => max(0, $variant->reserved_stock - $item->quantity)]);
        }

        $order->forceFill(['stock_released_at' => now()])->save();
    }
}
