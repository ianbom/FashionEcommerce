<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'user_id',
    'recipient_name',
    'recipient_phone',
    'label',
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
    'is_default',
])]
class CustomerAddress extends Model
{
    use SoftDeletes;

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }
}
