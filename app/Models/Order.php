<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'customer_address_id',
    'order_number',
    'customer_name',
    'customer_email',
    'customer_phone',
    'subtotal',
    'discount_amount',
    'shipping_cost',
    'service_fee',
    'grand_total',
    'voucher_id',
    'voucher_code',
    'payment_status',
    'order_status',
    'shipping_status',
    'no_return_refund_agreed',
    'no_return_refund_agreed_at',
    'notes',
    'paid_at',
    'cancelled_at',
    'expired_at',
    'completed_at',
])]
class Order extends Model
{
    public function address(): HasOne
    {
        return $this->hasOne(OrderAddress::class);
    }

    public function customerAddress(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function paymentLogs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    protected function casts(): array
    {
        return [
            'cancelled_at' => 'datetime',
            'completed_at' => 'datetime',
            'discount_amount' => 'decimal:2',
            'expired_at' => 'datetime',
            'grand_total' => 'decimal:2',
            'no_return_refund_agreed' => 'boolean',
            'no_return_refund_agreed_at' => 'datetime',
            'paid_at' => 'datetime',
            'service_fee' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }
}
