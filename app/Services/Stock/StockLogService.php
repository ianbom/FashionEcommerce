<?php

namespace App\Services\Stock;

use App\Models\ProductVariant;

class StockLogService
{
    public function logIfChanged(
        ProductVariant $variant,
        int $before,
        int $after,
        ?int $userId,
        string $type,
        string $note,
        string $referenceType = 'manual_adjustment',
        ?int $referenceId = null
    ): void {
        if ($before === $after) {
            return;
        }

        $variant->stockLogs()->create([
            'user_id' => $userId,
            'type' => $type,
            'quantity' => $after - $before,
            'stock_before' => $before,
            'stock_after' => $after,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'note' => $note,
        ]);
    }
}
