<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use Illuminate\Http\Request;
use Inertia\Response;

class PaymentLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'provider' => $request->string('provider')->toString(),
            'transaction_status' => $request->string('transaction_status')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        $logs = PaymentLog::query()
            ->with('order:id,order_number')
            ->when($filters['search'] !== '', fn ($query) => $query->whereHas('order', fn ($query) => $query->where('order_number', 'like', "%{$filters['search']}%")))
            ->when($filters['provider'] !== '', fn ($query) => $query->where('provider', $filters['provider']))
            ->when($filters['transaction_status'] !== '', fn ($query) => $query->where('transaction_status', $filters['transaction_status']))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (PaymentLog $log): array => $this->row($log));

        return inertia('admin/payment-logs/index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    public function show(PaymentLog $paymentLog): Response
    {
        $paymentLog->load('order:id,order_number');

        return inertia('admin/payment-logs/show', [
            'log' => [
                ...$this->row($paymentLog),
                'payload' => $paymentLog->payload,
            ],
        ]);
    }

    private function row(PaymentLog $log): array
    {
        return [
            'id' => $log->id,
            'order_number' => $log->order?->order_number,
            'provider' => $log->provider,
            'event_type' => $log->event_type,
            'transaction_status' => $log->transaction_status,
            'processed_at' => $log->processed_at?->toDateTimeString(),
            'created_at' => $log->created_at?->toFormattedDateString(),
        ];
    }
}
