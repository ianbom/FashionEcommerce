<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BiteshipWebhookLog;
use App\Services\Admin\BiteshipWebhookLogService;
use Illuminate\Http\Request;
use Inertia\Response;

class BiteshipWebhookLogController extends Controller
{
    public function index(Request $request, BiteshipWebhookLogService $logs): Response
    {
        return inertia('admin/biteship-webhook-logs/index', $logs->indexData($request));
    }

    public function show(BiteshipWebhookLog $biteshipWebhookLog, BiteshipWebhookLogService $logs): Response
    {
        return inertia('admin/biteship-webhook-logs/show', $logs->detailData($biteshipWebhookLog));
    }
}
