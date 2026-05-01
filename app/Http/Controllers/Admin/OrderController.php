<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderNoteRequest;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Models\Order;
use App\Services\Admin\OrderManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request, OrderManagementService $orders): Response
    {
        return inertia('admin/orders/index', $orders->indexData($request));
    }

    public function show(Order $order, OrderManagementService $orders): Response
    {
        return inertia('admin/orders/show', $orders->detailData($order));
    }

    public function updateStatus(OrderStatusRequest $request, Order $order, OrderManagementService $orders): RedirectResponse
    {
        $orders->updateStatus($order, $request->string('status')->toString());

        return back()->with('success', 'Order status berhasil diperbarui.');
    }

    public function updateNotes(OrderNoteRequest $request, Order $order, OrderManagementService $orders): RedirectResponse
    {
        $validated = $request->validated();

        $orders->updateNotes($order, $validated['notes'] ?? null);

        return back()->with('success', 'Internal note berhasil disimpan.');
    }
}
