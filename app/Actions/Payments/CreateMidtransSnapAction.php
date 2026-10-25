<?php

namespace App\Actions\Payments;

use App\Actions\Stock\ReleaseStockReservationAction;
use App\Actions\Vouchers\ReleaseVoucherReservationAction;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Services\Integrations\MidtransService;
use Illuminate\Support\Facades\DB;

class CreateMidtransSnapAction
{
    public function __construct(
        private readonly MidtransService $midtrans,
        private readonly ReleaseStockReservationAction $releaseStock,
        private readonly ReleaseVoucherReservationAction $releaseVoucher,
    ) {}

    public function execute(Payment $payment): array
    {
        $claimed = DB::transaction(function () use ($payment): bool {
            $order = Order::query()->whereKey($payment->order_id)->lockForUpdate()->firstOrFail();
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            if ($payment->payment_provider !== 'midtrans' || $order->payment_status !== 'pending' || $order->stock_released_at
                || $payment->expires_at?->isPast()
                || $payment->midtrans_snap_token || data_get($payment->raw_response, 'snap_creation_state') !== 'new') {
                return false;
            }
            $payment->update(['raw_response' => array_replace($payment->raw_response ?? [], [
                'snap_creation_state' => 'creating', 'snap_creation_started_at' => now()->toISOString(),
            ])]);

            return true;
        });
        if (! $claimed) {
            return $this->result($payment);
        }

        try {
            $response = $this->midtrans->createSnapTransaction($payment->order()->firstOrFail());
        } catch (\Throwable $exception) {
            $response = ['state' => 'uncertain'];
        }

        DB::transaction(function () use ($payment, $response): void {
            $candidate = $payment->order()->firstOrFail();
            $cart = Cart::query()->where('user_id', $candidate->user_id)->lockForUpdate()->firstOrFail();
            $order = Order::query()->whereKey($candidate->id)->lockForUpdate()->firstOrFail();
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $raw = array_replace($payment->raw_response ?? [], [
                'snap_creation_state' => $response['state'],
                'snap_creation_uncertain' => $response['state'] === 'uncertain',
            ]);
            if ($response['state'] === 'ready') {
                $payment->update(['midtrans_snap_token' => $response['token'], 'midtrans_redirect_url' => $response['redirect_url'], 'raw_response' => $raw]);

                return;
            }
            if ($order->payment_status !== 'pending' || $order->stock_finalized_at) {
                return;
            }
            if ($response['state'] !== 'rejected') {
                $payment->update(['raw_response' => $raw, 'failure_reason' => 'Pembuatan pembayaran belum dapat dipastikan. Jangan membuat pembayaran ulang; tunggu rekonsiliasi.']);

                return;
            }

            $this->releaseStock->execute($order);
            $this->releaseVoucher->execute($order);
            $order->update(['payment_status' => 'failed', 'order_status' => 'payment_failed']);
            $unavailable = 0;
            foreach ($order->items->sortBy('product_variant_id') as $item) {
                $variant = ProductVariant::withTrashed()->whereKey($item->product_variant_id)->lockForUpdate()->first();
                if (! $variant || ! $item->product_id) {
                    $unavailable++;

                    continue;
                }
                $existing = $cart->items()->where('product_variant_id', $variant->id)->first();
                if ($existing) {
                    $existing->increment('quantity', $item->quantity);
                } else {
                    $cart->items()->create(['product_id' => $item->product_id, 'product_variant_id' => $variant->id, 'quantity' => $item->quantity, 'price_snapshot' => $item->price]);
                }
            }
            $raw['checkout_cart_restored'] = true;
            $raw['unrestorable_items'] = $unavailable;
            $payment->update(['transaction_status' => 'failure', 'raw_response' => $raw, 'failure_reason' => 'Midtrans menolak pembuatan pembayaran. Item tersedia dikembalikan ke keranjang; detail lengkap tetap tersimpan pada pesanan.']);
        });

        return $this->result($payment);
    }

    public function result(Payment $payment): array
    {
        $payment->refresh()->load('order');
        $order = $payment->order;
        $pending = $order->payment_status === 'pending' && ! $order->stock_released_at;
        $ready = $payment->payment_provider === 'midtrans' && $pending && (! $payment->expires_at || $payment->expires_at->isFuture())
            && filled($payment->midtrans_snap_token) && $this->midtrans->validRedirectUrl($payment->midtrans_redirect_url);
        $rejected = data_get($payment->raw_response, 'snap_creation_state') === 'rejected' && $order->payment_status === 'failed';
        $state = $ready ? 'ready' : ($rejected ? 'failed' : (in_array($order->payment_status, ['pending', 'manual_review'], true) ? 'processing' : 'final'));

        return [
            'order_id' => $order->id, 'payment_id' => $payment->id, 'payment_state' => $state,
            'redirect_url' => $ready ? $payment->midtrans_redirect_url : ($rejected ? route('cart') : route('order.detail', $order)),
        ];
    }
}
