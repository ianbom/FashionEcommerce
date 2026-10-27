<?php

namespace App\Models;

use App\Enums\MidtransPaymentMethod;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'order_id',
    'payment_provider',
    'payment_method',
    'requested_payment_method',
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
    'expires_at',
    'raw_response',
    'failure_reason',
    'last_synced_at',
])]
class Payment extends Model
{
    protected $appends = ['requested_payment_method_label'];

    protected function requestedPaymentMethodLabel(): Attribute
    {
        return Attribute::get(fn (): ?string => MidtransPaymentMethod::tryFrom((string) $this->requested_payment_method)?->label());
    }

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
            'expires_at' => 'datetime',
            'gross_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'last_synced_at' => 'datetime',
            'raw_response' => 'array',
        ];
    }
}
