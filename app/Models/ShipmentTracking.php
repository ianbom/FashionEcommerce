<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['shipment_id', 'status', 'description', 'location', 'happened_at', 'raw_payload'])]
class ShipmentTracking extends Model
{
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    protected function casts(): array
    {
        return [
            'happened_at' => 'datetime',
            'raw_payload' => 'array',
        ];
    }
}
