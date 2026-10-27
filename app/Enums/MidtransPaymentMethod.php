<?php

namespace App\Enums;

enum MidtransPaymentMethod: string
{
    case BcaVa = 'bca_va';
    case BniVa = 'bni_va';
    case BriVa = 'bri_va';
    case MandiriVa = 'echannel';
    case PermataVa = 'permata_va';
    case Qris = 'other_qris';
    case Gopay = 'gopay';
    case Shopeepay = 'shopeepay';

    public function label(): string
    {
        return match ($this) {
            self::BcaVa => 'BCA Virtual Account',
            self::BniVa => 'BNI Virtual Account',
            self::BriVa => 'BRI Virtual Account',
            self::MandiriVa => 'Mandiri Bill Payment',
            self::PermataVa => 'Permata Virtual Account',
            self::Qris => 'QRIS',
            self::Gopay => 'GoPay',
            self::Shopeepay => 'ShopeePay',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(fn (self $method): array => [
            'id' => $method->value,
            'label' => $method->label(),
            'group' => match ($method) {
                self::Qris => 'QRIS',
                self::Gopay, self::Shopeepay => 'E-wallet',
                default => 'Virtual Account',
            },
        ], self::cases());
    }
}
