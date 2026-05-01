<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentLog;
use App\Services\Admin\PaymentLogManagementService;
use Illuminate\Http\Request;
use Inertia\Response;

class PaymentLogController extends Controller
{
    public function index(Request $request, PaymentLogManagementService $logs): Response
    {
        return inertia('admin/payment-logs/index', $logs->indexData($request));
    }

    public function show(PaymentLog $paymentLog, PaymentLogManagementService $logs): Response
    {
        return inertia('admin/payment-logs/show', $logs->detailData($paymentLog));
    }
}
