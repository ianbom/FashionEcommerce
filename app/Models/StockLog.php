<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'product_variant_id',
    'user_id',
    'type',
    'quantity',
    'stock_before',
    'stock_after',
    'reference_type',
    'reference_id',
    'note',
])]
class StockLog extends Model
{
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'stock_after' => 'integer',
            'stock_before' => 'integer',
        ];
    }
}
