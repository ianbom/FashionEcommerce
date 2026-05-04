<?php

namespace App\Services\Admin;

use App\Models\CustomerAddress;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CustomerAddressManagementService
{
    use ResolvesAdminPagination;

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'province' => $request->string('province')->toString(),
            'city' => $request->string('city')->toString(),
            'is_default' => $request->string('is_default')->toString(),
        ];

        return [
            'addresses' => CustomerAddress::query()
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
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (CustomerAddress $address): array => $this->row($address)),
            'filters' => $filters,
        ];
    }

    public function detailData(CustomerAddress $address): array
    {
        $address->load(['user:id,name,email,phone', 'orders' => fn ($query) => $query->latest()->limit(10)])->loadCount('orders');

        return [
            'address' => [
                ...$this->payload($address),
                'orders' => $address->orders->map(fn ($order): array => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'grand_total' => $order->grand_total,
                    'order_status' => $order->order_status,
                    'created_at' => $order->created_at?->toFormattedDateString(),
                ])->values(),
            ],
        ];
    }

    public function formData(CustomerAddress $address): array
    {
        return ['address' => $this->payload($address)];
    }

    public function update(CustomerAddress $address, Request $request): void
    {
        $data = $request->validated();
        $data['is_default'] = $request->boolean('is_default');

        $address->update($data);
    }

    public function delete(CustomerAddress $address): void
    {
        if ($address->orders()->exists()) {
            throw ValidationException::withMessages([
                'address' => 'Alamat yang sudah dipakai order tidak boleh dihapus agar snapshot lama tetap aman.',
            ]);
        }

        $address->delete();
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
