<?php

namespace App\Enums;

enum MidtransTransactionStatus: string
{
    case Pending = 'pending';
    case Capture = 'capture';
    case Settlement = 'settlement';
    case Deny = 'deny';
    case Cancel = 'cancel';
    case Expire = 'expire';
    case Failure = 'failure';
    case Refund = 'refund';
    case PartialRefund = 'partial_refund';
    case Authorize = 'authorize';
}
