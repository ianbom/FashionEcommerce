<?php

namespace App\Services\Admin;

use App\Models\AdminActivityLog;
use Illuminate\Http\Request;

class AuditLogService
{
    /**
     * @return array<string, mixed>
     */
    public function indexData(Request $request): array
    {
        $filters = [
            'module' => $request->string('module')->toString(),
            'action' => $request->string('action')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        return [
            'filters' => $filters,
            'logs' => AdminActivityLog::query()
                ->with('user:id,name,email')
                ->when($filters['module'] !== '', fn ($query) => $query->where('module', $filters['module']))
                ->when($filters['action'] !== '', fn ($query) => $query->where('action', $filters['action']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (AdminActivityLog $log): array => [
                    'id' => $log->id,
                    'admin' => $log->user?->name,
                    'action' => $log->action,
                    'module' => $log->module,
                    'reference_type' => $log->reference_type,
                    'reference_id' => $log->reference_id,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at?->toDateTimeString(),
                    'new_values' => $log->new_values,
                ]),
        ];
    }
}
