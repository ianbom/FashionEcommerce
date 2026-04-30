<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'event_type',
    'biteship_order_id',
    'biteship_tracking_id',
    'waybill_id',
    'payload',
    'processed_at',
])]
class BiteshipWebhookLog extends Model
{
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
