<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'shipping_provider',
    'biteship_order_id',
    'biteship_tracking_id',
    'waybill_id',
    'courier_company',
    'courier_type',
    'courier_service_name',
    'delivery_type',
    'shipping_cost',
    'insurance_cost',
    'estimated_delivery',
    'shipping_status',
    'shipped_at',
    'delivered_at',
    'cancelled_at',
    'raw_rate_response',
    'raw_order_response',
])]
class Shipment extends Model
{
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function trackings(): HasMany
    {
        return $this->hasMany(ShipmentTracking::class);
    }

    protected function casts(): array
    {
        return [
            'cancelled_at' => 'datetime',
            'delivered_at' => 'datetime',
            'insurance_cost' => 'decimal:2',
            'raw_order_response' => 'array',
            'raw_rate_response' => 'array',
            'shipped_at' => 'datetime',
            'shipping_cost' => 'decimal:2',
        ];
    }
}
