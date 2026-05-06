<?php

namespace App\Enums;

enum ShippingStatus: string
{
    case NotCreated = 'not_created';
    case Creating = 'creating';
    case Confirmed = 'confirmed';
    case Allocated = 'allocated';
    case Picked = 'picked';
    case InTransit = 'in_transit';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Failed = 'failed';
    case Problem = 'problem';
    case Lost = 'lost';
    case Returned = 'returned';

    public static function activeValues(): array
    {
        return [self::Creating->value, self::Confirmed->value, self::Allocated->value, self::Picked->value, self::InTransit->value, self::Delivered->value];
    }

    public static function retryableValues(): array
    {
        return [self::NotCreated->value, self::Failed->value, self::Problem->value];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function issueValues(): array
    {
        return [self::Failed->value, self::Cancelled->value, self::Problem->value, self::Lost->value, self::Returned->value];
    }
}
