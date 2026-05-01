<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Admin\PaymentManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request, PaymentManagementService $payments): Response
    {
        return inertia('admin/payments/index', $payments->indexData($request));
    }

    public function show(Payment $payment, PaymentManagementService $payments): Response
    {
        return inertia('admin/payments/show', $payments->detailData($payment));
    }

    public function sync(Payment $payment, PaymentManagementService $payments): RedirectResponse
    {
        $payments->sync($payment);

        return back()->with('success', 'Payment status berhasil disinkronkan.');
    }
}
