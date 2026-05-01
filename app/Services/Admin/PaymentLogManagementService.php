<?php

namespace App\Services\Admin;

use App\Models\PaymentLog;
use Illuminate\Http\Request;

class PaymentLogManagementService
{
    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'provider' => $request->string('provider')->toString(),
            'transaction_status' => $request->string('transaction_status')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        return [
            'logs' => PaymentLog::query()
                ->with('order:id,order_number')
                ->when($filters['search'] !== '', fn ($query) => $query->whereHas('order', fn ($query) => $query->where('order_number', 'like', "%{$filters['search']}%")))
                ->when($filters['provider'] !== '', fn ($query) => $query->where('provider', $filters['provider']))
                ->when($filters['transaction_status'] !== '', fn ($query) => $query->where('transaction_status', $filters['transaction_status']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (PaymentLog $log): array => $this->row($log)),
            'filters' => $filters,
        ];
    }

    public function detailData(PaymentLog $log): array
    {
        $log->load('order:id,order_number');

        return [
            'log' => [
                ...$this->row($log),
                'payload' => $log->payload,
            ],
        ];
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
