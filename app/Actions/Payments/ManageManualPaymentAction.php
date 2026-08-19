<?php

namespace App\Actions\Payments;

use App\Actions\Stock\FinalizeReservedStockAction;
use App\Actions\Stock\ReleaseStockReservationAction;
use App\Actions\Vouchers\ReleaseVoucherReservationAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ManageManualPaymentAction
{
    public function __construct(
        private readonly FinalizeReservedStockAction $finalizeStock,
        private readonly ReleaseStockReservationAction $releaseStock,
        private readonly ReleaseVoucherReservationAction $releaseVoucher,
        private readonly NotificationService $notifications,
    ) {}

    public function confirm(Payment $payment): void
    {
        $this->assertManual($payment);

        DB::transaction(function () use ($payment): void {
            $payment = Payment::query()->with('order')->lockForUpdate()->findOrFail($payment->id);
            $order = $payment->order;

            if ($order->payment_status === PaymentStatus::Paid->value) {
                return;
            }

            $this->finalizeStock->execute($order, $order->order_number);
            $now = now();
            $order->update(['payment_status' => PaymentStatus::Paid->value, 'order_status' => OrderStatus::Paid->value, 'paid_at' => $now]);
            $payment->update(['transaction_status' => 'settlement', 'paid_at' => $now]);
            $this->notifications->forOrder($order->fresh(), 'Payment received', "Transfer manual untuk order {$order->order_number} dikonfirmasi.", 'payment');
        });
    }

    public function cancel(Payment $payment): void
    {
        $this->assertManual($payment);

        DB::transaction(function () use ($payment): void {
            $payment = Payment::query()->with('order')->lockForUpdate()->findOrFail($payment->id);
            $order = $payment->order;

            if ($order->payment_status === PaymentStatus::Paid->value) {
                throw ValidationException::withMessages(['payment' => 'Pembayaran yang sudah dikonfirmasi tidak dapat dibatalkan.']);
            }

            $this->releaseStock->execute($order);
            $this->releaseVoucher->execute($order);
            $order->update(['payment_status' => PaymentStatus::Cancelled->value, 'order_status' => OrderStatus::Cancelled->value, 'cancelled_at' => $order->cancelled_at ?? now()]);
            $payment->update(['transaction_status' => 'cancel']);
        });
    }

    private function assertManual(Payment $payment): void
    {
        if ($payment->payment_provider !== 'manual') {
            throw ValidationException::withMessages(['payment' => 'Aksi ini hanya tersedia untuk transfer manual.']);
        }
    }
}
