<?php

namespace App\Http\Middleware;

use App\Models\AdminActivityLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class LogAdminActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = $request->user();
        if (
            $user
            && $user->role === 'admin'
            && ! $request->isMethod('get')
            && ! $request->isMethod('head')
            && Schema::hasTable('admin_activity_logs')
        ) {
            AdminActivityLog::query()->create([
                'user_id' => $user->id,
                'action' => strtolower($request->method()),
                'module' => $this->module($request),
                'reference_type' => $request->route()?->getName(),
                'reference_id' => $this->referenceId($request),
                'new_values' => $this->safeNewValues($request),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }

    /**
     * @return array<string, mixed>
     */
    private function safeNewValues(Request $request): array
    {
        return $this->sanitizeForJson($request->except(['password', 'password_confirmation', '_token']));
    }

    /**
     * @param  mixed  $value
     * @return mixed
     */
    private function sanitizeForJson($value)
    {
        if ($value instanceof UploadedFile) {
            return [
                'name' => $value->getClientOriginalName(),
                'size' => $value->getSize(),
                'mime' => $value->getMimeType(),
            ];
        }

        if (is_array($value)) {
            return array_map(fn ($item) => $this->sanitizeForJson($item), $value);
        }

        return $value;
    }

    private function module(Request $request): string
    {
        $segment = $request->segment(2);

        return $segment ?: 'dashboard';
    }

    private function referenceId(Request $request): ?int
    {
        foreach ($request->route()?->parameters() ?? [] as $parameter) {
            if (is_object($parameter) && isset($parameter->id)) {
                return (int) $parameter->id;
            }

            if (is_numeric($parameter)) {
                return (int) $parameter;
            }
        }

        return null;
    }
}
