<?php

namespace App\Actions\Vouchers;

use App\Models\Order;
use App\Models\Voucher;

class ReleaseVoucherReservationAction
{
    public function execute(Order $order): void
    {
        $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

        if (! $order->voucher_id || $order->voucher_released_at) {
            return;
        }

        $voucher = Voucher::query()->whereKey($order->voucher_id)->lockForUpdate()->first();

        if ($voucher && $voucher->used_count > 0) {
            $voucher->decrement('used_count');
        }

        $order->forceFill(['voucher_released_at' => now()])->save();
    }
}
