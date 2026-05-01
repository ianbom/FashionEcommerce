<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BiteshipWebhookLog;
use Illuminate\Http\Request;
use Inertia\Response;

class BiteshipWebhookLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'event_type' => $request->string('event_type')->toString(),
            'waybill_id' => $request->string('waybill_id')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        $logs = BiteshipWebhookLog::query()
            ->when($filters['event_type'] !== '', fn ($query) => $query->where('event_type', $filters['event_type']))
            ->when($filters['waybill_id'] !== '', fn ($query) => $query->where('waybill_id', 'like', "%{$filters['waybill_id']}%"))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (BiteshipWebhookLog $log): array => $this->row($log));

        return inertia('admin/biteship-webhook-logs/index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    public function show(BiteshipWebhookLog $biteshipWebhookLog): Response
    {
        return inertia('admin/biteship-webhook-logs/show', [
            'log' => [
                ...$this->row($biteshipWebhookLog),
                'payload' => $biteshipWebhookLog->payload,
            ],
        ]);
    }

    private function row(BiteshipWebhookLog $log): array
    {
        return [
            'id' => $log->id,
            'event_type' => $log->event_type,
            'biteship_order_id' => $log->biteship_order_id,
            'biteship_tracking_id' => $log->biteship_tracking_id,
            'waybill_id' => $log->waybill_id,
            'processed_at' => $log->processed_at?->toDateTimeString(),
            'created_at' => $log->created_at?->toFormattedDateString(),
        ];
    }
}
