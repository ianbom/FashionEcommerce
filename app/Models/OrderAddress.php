<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id',
    'recipient_name',
    'recipient_phone',
    'province',
    'city',
    'district',
    'subdistrict',
    'postal_code',
    'biteship_area_id',
    'latitude',
    'longitude',
    'full_address',
    'note',
])]
class OrderAddress extends Model
{
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }
}
