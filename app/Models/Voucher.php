<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'code',
    'name',
    'description',
    'discount_type',
    'discount_value',
    'max_discount',
    'min_order_amount',
    'usage_limit',
    'used_count',
    'starts_at',
    'ends_at',
    'is_active',
])]
class Voucher extends Model
{
    use SoftDeletes;

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
            'max_discount' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
        ];
    }
}
