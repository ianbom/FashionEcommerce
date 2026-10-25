<?php

namespace App\Actions\Payments;

use App\Actions\Stock\FinalizeReservedStockAction;
use App\Actions\Stock\ReleaseStockReservationAction;
use App\Actions\Vouchers\ReleaseVoucherReservationAction;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
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
            $order = Order::query()->lockForUpdate()->findOrFail($payment->order_id);
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            $this->assertManual($payment);

            if ($order->payment_status === PaymentStatus::Paid->value) {
                return;
            }

            if ($order->payment_status !== 'pending' || $order->order_status !== 'pending_payment' || $order->stock_released_at) {
                throw ValidationException::withMessages(['payment' => 'Hanya pembayaran pending dengan reservasi aktif yang dapat dikonfirmasi.']);
            }

            try {
                $this->finalizeStock->execute($order, $order->order_number);
            } catch (\DomainException $exception) {
                throw ValidationException::withMessages(['payment' => 'Reservasi stok tidak konsisten. Periksa stok sebelum mengonfirmasi pembayaran.']);
            }
            $now = now();
            $order->update(['payment_status' => PaymentStatus::Paid->value, 'order_status' => OrderStatus::Paid->value, 'paid_at' => $now]);
            $payment->update(['transaction_status' => 'settlement', 'paid_at' => $now, 'failure_reason' => null]);
            $this->notifications->forOrder($order->fresh(), 'Payment received', "Transfer manual untuk order {$order->order_number} dikonfirmasi.", 'payment');
        });
    }

    public function cancel(Payment $payment): void
    {
        $this->assertManual($payment);

        DB::transaction(function () use ($payment): void {
            $order = Order::query()->lockForUpdate()->findOrFail($payment->order_id);
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            $this->assertManual($payment);

            if ($order->payment_status === 'cancelled') {
                return;
            }

            if ($order->payment_status !== PaymentStatus::Pending->value || $order->stock_finalized_at) {
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
