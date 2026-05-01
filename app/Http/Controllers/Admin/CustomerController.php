<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\CustomerManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request, CustomerManagementService $customers): Response
    {
        return inertia('admin/customers/index', $customers->indexData($request));
    }

    public function show(User $customer, CustomerManagementService $customers): Response
    {
        return inertia('admin/customers/show', $customers->detailData($customer));
    }

    public function toggleActive(User $customer, CustomerManagementService $customers): RedirectResponse
    {
        $customers->toggleActive($customer);

        return back()->with('success', 'Status customer berhasil diperbarui.');
    }
}
