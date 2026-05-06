<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case ManualReview = 'manual_review';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';

    public static function terminalFailureValues(): array
    {
        return [self::Failed->value, self::Cancelled->value, self::Expired->value];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
