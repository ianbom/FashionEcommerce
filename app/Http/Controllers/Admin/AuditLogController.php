<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request, AuditLogService $logs): Response
    {
        return inertia('admin/audit-logs/index', $logs->indexData($request));
    }
}
