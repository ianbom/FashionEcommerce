<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpsertAddressRequest;
use App\Models\CustomerAddress;
use App\Models\User;
use App\Services\Customer\AddressService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request, AddressService $addresses): Response
    {
        return Inertia::render('customer/manage-address/manage-address', $addresses->pageData($this->user($request)));
    }

    public function store(UpsertAddressRequest $request, AddressService $addresses): RedirectResponse
    {
        $addresses->store(
            $this->user($request),
            $request->validated(),
            $request->boolean('is_default'),
        );

        return redirect()->back()->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(
        UpsertAddressRequest $request,
        CustomerAddress $customerAddress,
        AddressService $addresses,
    ): RedirectResponse {
        $addresses->update(
            $this->user($request),
            $customerAddress,
            $request->validated(),
            $request->boolean('is_default'),
        );

        return redirect()->back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroy(
        Request $request,
        CustomerAddress $customerAddress,
        AddressService $addresses,
    ): RedirectResponse {
        $addresses->delete($this->user($request), $customerAddress);

        return redirect()->back()->with('success', 'Alamat berhasil dihapus.');
    }

    private function user(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        return $user;
    }
}
