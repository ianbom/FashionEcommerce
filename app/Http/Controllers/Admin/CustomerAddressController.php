<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CustomerAddressRequest;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class CustomerAddressController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'province' => $request->string('province')->toString(),
            'city' => $request->string('city')->toString(),
            'is_default' => $request->string('is_default')->toString(),
        ];

        $addresses = CustomerAddress::query()
            ->with('user:id,name,email')
            ->withCount('orders')
            ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('recipient_name', 'like', "%{$filters['search']}%")
                ->orWhere('recipient_phone', 'like', "%{$filters['search']}%")
                ->orWhere('city', 'like', "%{$filters['search']}%")
                ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$filters['search']}%")->orWhere('email', 'like', "%{$filters['search']}%"))))
            ->when($filters['province'] !== '', fn ($query) => $query->where('province', 'like', "%{$filters['province']}%"))
            ->when($filters['city'] !== '', fn ($query) => $query->where('city', 'like', "%{$filters['city']}%"))
            ->when($filters['is_default'] !== '', fn ($query) => $query->where('is_default', $filters['is_default'] === 'yes'))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (CustomerAddress $address): array => $this->row($address));

        return inertia('admin/customer-addresses/index', [
            'addresses' => $addresses,
            'filters' => $filters,
        ]);
    }

    public function show(CustomerAddress $customerAddress): Response
    {
        $customerAddress->load(['user:id,name,email,phone', 'orders' => fn ($query) => $query->latest()->limit(10)])->loadCount('orders');

        return inertia('admin/customer-addresses/show', [
            'address' => [
                ...$this->row($customerAddress),
                'district' => $customerAddress->district,
                'subdistrict' => $customerAddress->subdistrict,
                'biteship_area_id' => $customerAddress->biteship_area_id,
                'latitude' => $customerAddress->latitude,
                'longitude' => $customerAddress->longitude,
                'note' => $customerAddress->note,
                'orders' => $customerAddress->orders->map(fn ($order): array => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'grand_total' => $order->grand_total,
                    'order_status' => $order->order_status,
                    'created_at' => $order->created_at?->toFormattedDateString(),
                ])->values(),
            ],
        ]);
    }

    public function edit(CustomerAddress $customerAddress): Response
    {
        return inertia('admin/customer-addresses/form', [
            'address' => $this->payload($customerAddress),
        ]);
    }

    public function update(CustomerAddressRequest $request, CustomerAddress $customerAddress): RedirectResponse
    {
        $data = $request->validated();
        $data['is_default'] = $request->boolean('is_default');

        $customerAddress->update($data);

        return redirect()->route('admin.customer-addresses.show', $customerAddress)->with('success', 'Alamat customer berhasil diperbarui.');
    }

    public function destroy(CustomerAddress $customerAddress): RedirectResponse
    {
        if ($customerAddress->orders()->exists()) {
            throw ValidationException::withMessages([
                'address' => 'Alamat yang sudah dipakai order tidak boleh dihapus agar snapshot lama tetap aman.',
            ]);
        }

        $customerAddress->delete();

        return redirect()->route('admin.customer-addresses.index')->with('success', 'Alamat customer berhasil dihapus.');
    }

    private function row(CustomerAddress $address): array
    {
        return [
            'id' => $address->id,
            'user_id' => $address->user_id,
            'customer' => $address->user?->name,
            'customer_email' => $address->user?->email,
            'recipient_name' => $address->recipient_name,
            'recipient_phone' => $address->recipient_phone,
            'label' => $address->label,
            'province' => $address->province,
            'city' => $address->city,
            'postal_code' => $address->postal_code,
            'full_address' => $address->full_address,
            'is_default' => $address->is_default,
            'orders_count' => $address->orders_count ?? 0,
            'created_at' => $address->created_at?->toFormattedDateString(),
        ];
    }

    private function payload(CustomerAddress $address): array
    {
        return [
            ...$this->row($address),
            'district' => $address->district,
            'subdistrict' => $address->subdistrict,
            'biteship_area_id' => $address->biteship_area_id,
            'latitude' => $address->latitude,
            'longitude' => $address->longitude,
            'note' => $address->note,
        ];
    }
}
