<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PendingPayment = 'pending_payment';
    case Paid = 'paid';
    case Processing = 'processing';
    case ReadyToShip = 'ready_to_ship';
    case ShipmentCreated = 'shipment_created';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case PaymentFailed = 'payment_failed';
    case PaymentExpired = 'payment_expired';
    case ShipmentFailed = 'shipment_failed';
    case ShipmentProblem = 'shipment_problem';
    case Lost = 'lost';
    case Returned = 'returned';
    case Refunded = 'refunded';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function fulfillmentValues(): array
    {
        return [self::Processing->value, self::ReadyToShip->value, self::ShipmentCreated->value, self::Shipped->value, self::Delivered->value, self::Completed->value];
    }
}
