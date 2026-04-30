<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'payment_provider',
    'payment_method',
    'midtrans_order_id',
    'midtrans_transaction_id',
    'midtrans_snap_token',
    'midtrans_redirect_url',
    'transaction_status',
    'fraud_status',
    'gross_amount',
    'currency',
    'paid_at',
    'expired_at',
    'raw_response',
])]
class Payment extends Model
{
    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'expired_at' => 'datetime',
            'gross_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'raw_response' => 'array',
        ];
    }
}
