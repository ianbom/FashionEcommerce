<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VoucherRequest;
use App\Models\Voucher;
use App\Services\Admin\VoucherManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class VoucherController extends Controller
{
    public function index(Request $request, VoucherManagementService $vouchers): Response
    {
        return inertia('admin/vouchers/index', $vouchers->indexData($request));
    }

    public function create(): Response
    {
        return inertia('admin/vouchers/form', [
            'mode' => 'create',
            'voucher' => null,
        ]);
    }

    public function store(VoucherRequest $request, VoucherManagementService $vouchers): RedirectResponse
    {
        $vouchers->create($request);

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil dibuat.');
    }

    public function edit(Voucher $voucher, VoucherManagementService $vouchers): Response
    {
        return inertia('admin/vouchers/form', [
            'mode' => 'edit',
            'voucher' => $vouchers->row($voucher),
        ]);
    }

    public function update(VoucherRequest $request, Voucher $voucher, VoucherManagementService $vouchers): RedirectResponse
    {
        $vouchers->update($voucher, $request);

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil diperbarui.');
    }

    public function destroy(Voucher $voucher, VoucherManagementService $vouchers): RedirectResponse
    {
        $vouchers->delete($voucher);

        return redirect()->route('admin.vouchers.index')->with('success', 'Voucher berhasil dihapus.');
    }
}
