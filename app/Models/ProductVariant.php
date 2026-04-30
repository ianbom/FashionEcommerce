<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'product_id',
    'sku',
    'color_name',
    'color_hex',
    'size',
    'additional_price',
    'stock',
    'reserved_stock',
    'image_url',
    'is_active',
])]
class ProductVariant extends Model
{
    use SoftDeletes;

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }

    protected function casts(): array
    {
        return [
            'additional_price' => 'decimal:2',
            'is_active' => 'boolean',
            'reserved_stock' => 'integer',
            'stock' => 'integer',
        ];
    }
}
