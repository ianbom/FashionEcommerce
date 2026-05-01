<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Customer\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request, OrderService $orders): Response
    {
        return Inertia::render('customer/order/my-order', $orders->indexData($request));
    }

    public function show(Request $request, Order $order, OrderService $orders): Response
    {
        return Inertia::render('customer/order/detail-order', $orders->detailData($request, $order));
    }
}
