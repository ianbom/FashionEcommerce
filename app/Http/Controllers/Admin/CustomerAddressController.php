<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CustomerAddressRequest;
use App\Models\CustomerAddress;
use App\Services\Admin\CustomerAddressManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CustomerAddressController extends Controller
{
    public function index(Request $request, CustomerAddressManagementService $addresses): Response
    {
        return inertia('admin/customer-addresses/index', $addresses->indexData($request));
    }

    public function show(CustomerAddress $customerAddress, CustomerAddressManagementService $addresses): Response
    {
        return inertia('admin/customer-addresses/show', $addresses->detailData($customerAddress));
    }

    public function edit(CustomerAddress $customerAddress, CustomerAddressManagementService $addresses): Response
    {
        return inertia('admin/customer-addresses/form', $addresses->formData($customerAddress));
    }

    public function update(CustomerAddressRequest $request, CustomerAddress $customerAddress, CustomerAddressManagementService $addresses): RedirectResponse
    {
        $addresses->update($customerAddress, $request);

        return redirect()->route('admin.customer-addresses.show', $customerAddress)->with('success', 'Alamat customer berhasil diperbarui.');
    }

    public function destroy(CustomerAddress $customerAddress, CustomerAddressManagementService $addresses): RedirectResponse
    {
        $addresses->delete($customerAddress);

        return redirect()->route('admin.customer-addresses.index')->with('success', 'Alamat customer berhasil dihapus.');
    }
}
