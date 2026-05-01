<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'is_active' => $request->string('is_active')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
            'spent_min' => $request->string('spent_min')->toString(),
            'spent_max' => $request->string('spent_max')->toString(),
        ];

        $customers = User::query()
            ->where('role', 'customer')
            ->withCount(['orders', 'addresses'])
            ->withSum(['orders as total_spent' => fn ($query) => $query->where('payment_status', 'paid')], 'grand_total')
            ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$filters['search']}%")
                ->orWhere('email', 'like', "%{$filters['search']}%")
                ->orWhere('phone', 'like', "%{$filters['search']}%")))
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
            ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
            ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
            ->when($filters['spent_min'] !== '', fn ($query) => $query->havingRaw('coalesce(total_spent, 0) >= ?', [$filters['spent_min']]))
            ->when($filters['spent_max'] !== '', fn ($query) => $query->havingRaw('coalesce(total_spent, 0) <= ?', [$filters['spent_max']]))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $customer): array => $this->row($customer));

        return inertia('admin/customers/index', [
            'customers' => $customers,
            'filters' => $filters,
        ]);
    }

    public function show(User $customer): Response
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->load([
            'addresses' => fn ($query) => $query->latest(),
            'orders' => fn ($query) => $query->latest()->limit(20),
            'wishlists.product.primaryImage',
            'customerNotifications' => fn ($query) => $query->latest()->limit(20),
        ])->loadCount(['orders', 'addresses', 'wishlists', 'customerNotifications'])
            ->loadSum(['orders as total_spent' => fn ($query) => $query->where('payment_status', 'paid')], 'grand_total');

        return inertia('admin/customers/show', [
            'customer' => [
                ...$this->row($customer),
                'addresses_count' => $customer->addresses_count,
                'wishlists_count' => $customer->wishlists_count,
                'notifications_count' => $customer->customer_notifications_count,
                'last_order_at' => $customer->orders->first()?->created_at?->toDateTimeString(),
                'addresses' => $customer->addresses->map(fn ($address): array => [
                    'id' => $address->id,
                    'label' => $address->label,
                    'recipient_name' => $address->recipient_name,
                    'recipient_phone' => $address->recipient_phone,
                    'province' => $address->province,
                    'city' => $address->city,
                    'district' => $address->district,
                    'postal_code' => $address->postal_code,
                    'full_address' => $address->full_address,
                    'is_default' => $address->is_default,
                ])->values(),
                'orders' => $customer->orders->map(fn ($order): array => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'grand_total' => $order->grand_total,
                    'payment_status' => $order->payment_status,
                    'order_status' => $order->order_status,
                    'shipping_status' => $order->shipping_status,
                    'created_at' => $order->created_at?->toFormattedDateString(),
                ])->values(),
                'wishlists' => $customer->wishlists->map(fn ($wishlist): array => [
                    'id' => $wishlist->id,
                    'product_id' => $wishlist->product_id,
                    'product_name' => $wishlist->product?->name,
                    'product_image' => $wishlist->product?->primaryImage?->image_url,
                    'created_at' => $wishlist->created_at?->toFormattedDateString(),
                ])->values(),
                'notifications' => $customer->customerNotifications->map(fn ($notification): array => [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'type' => $notification->type,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at?->toFormattedDateString(),
                ])->values(),
            ],
        ]);
    }

    public function toggleActive(User $customer): RedirectResponse
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->update(['is_active' => ! $customer->is_active]);

        return back()->with('success', 'Status customer berhasil diperbarui.');
    }

    private function row(User $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'avatar_url' => $customer->avatar_url,
            'is_active' => $customer->is_active,
            'orders_count' => $customer->orders_count ?? 0,
            'addresses_count' => $customer->addresses_count ?? 0,
            'total_spent' => $customer->total_spent ?? 0,
            'registered_at' => $customer->created_at?->toFormattedDateString(),
        ];
    }
}
