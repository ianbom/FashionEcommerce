<?php

namespace App\Services\Admin;

use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentManagementService
{
    use ResolvesAdminPagination;

    public function __construct(private readonly SyncMidtransPaymentAction $syncPayment) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'transaction_status' => $request->string('transaction_status')->toString(),
            'payment_method' => $request->string('payment_method')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
            'amount_min' => $request->string('amount_min')->toString(),
            'amount_max' => $request->string('amount_max')->toString(),
        ];

        return [
            'payments' => Payment::query()
                ->with('order:id,order_number,customer_name,customer_email')
                ->when($filters['transaction_status'] !== '', fn ($query) => $query->where('transaction_status', $filters['transaction_status']))
                ->when($filters['payment_method'] !== '', fn ($query) => $query->where('payment_method', $filters['payment_method']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->when($filters['amount_min'] !== '', fn ($query) => $query->where('gross_amount', '>=', $filters['amount_min']))
                ->when($filters['amount_max'] !== '', fn ($query) => $query->where('gross_amount', '<=', $filters['amount_max']))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Payment $payment): array => $this->row($payment)),
            'filters' => $filters,
            'statuses' => ['pending', 'settlement', 'capture', 'expire', 'cancel', 'deny', 'failure'],
            'stats' => [
                'total' => Payment::query()->count(),
                'settled' => Payment::query()->whereIn('transaction_status', ['settlement', 'capture', 'paid', 'success'])->count(),
                'pending' => Payment::query()->whereIn('transaction_status', ['pending', 'authorize'])->count(),
                'challenge' => Payment::query()->where('fraud_status', 'challenge')->count(),
                'failed' => Payment::query()->whereIn('transaction_status', ['deny', 'cancel', 'expire', 'expired', 'failure', 'failed'])->count(),
                'manual_review' => Payment::query()->whereIn('fraud_status', ['challenge', 'deny'])->count(),
            ],
        ];
    }

    public function detailData(Payment $payment): array
    {
        $payment->load(['order:id,order_number,customer_name,customer_email,payment_status,order_status,paid_at', 'logs' => fn ($query) => $query->latest()]);

        return [
            'payment' => [
                ...$this->row($payment),
                'payment_provider' => $payment->payment_provider,
                'midtrans_snap_token' => $payment->midtrans_snap_token,
                'midtrans_redirect_url' => $payment->midtrans_redirect_url,
                'currency' => $payment->currency,
                'raw_response' => $payment->raw_response,
                'order' => $payment->order,
                'logs' => $payment->logs->map(fn ($log): array => [
                    'id' => $log->id,
                    'event_type' => $log->event_type,
                    'transaction_status' => $log->transaction_status,
                    'processed_at' => $log->processed_at?->toDateTimeString(),
                    'payload' => $log->payload,
                ]),
            ],
        ];
    }

    public function sync(Payment $payment): void
    {
        $this->syncPayment->execute($payment);
    }

    public function row(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'order_id' => $payment->order_id,
            'order_number' => $payment->order?->order_number,
            'customer' => $payment->order?->customer_name,
            'midtrans_order_id' => $payment->midtrans_order_id,
            'midtrans_transaction_id' => $payment->midtrans_transaction_id,
            'payment_method' => $payment->payment_method,
            'gross_amount' => $payment->gross_amount,
            'transaction_status' => $payment->transaction_status,
            'fraud_status' => $payment->fraud_status,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
            'expired_at' => $payment->expired_at?->toDateTimeString(),
            'created_at' => $payment->created_at?->toFormattedDateString(),
        ];
    }

}
