<?php

namespace App\Services\Admin;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VoucherManagementService
{
    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'discount_type' => $request->string('discount_type')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        return [
            'vouchers' => Voucher::query()
                ->withCount(['orders as paid_orders_count' => fn ($query) => $query->where('payment_status', 'paid')])
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('code', 'like', "%{$filters['search']}%")
                    ->orWhere('name', 'like', "%{$filters['search']}%")))
                ->when($filters['discount_type'] !== '', fn ($query) => $query->where('discount_type', $filters['discount_type']))
                ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Voucher $voucher): array => $this->row($voucher)),
            'filters' => $filters,
        ];
    }

    public function create(Request $request): Voucher
    {
        return Voucher::query()->create($this->payload($request, true));
    }

    public function update(Voucher $voucher, Request $request): void
    {
        $voucher->update($this->payload($request, false));
    }

    public function delete(Voucher $voucher): void
    {
        $voucher->delete();
    }

    public function row(Voucher $voucher): array
    {
        return [
            'id' => $voucher->id,
            'code' => $voucher->code,
            'name' => $voucher->name,
            'description' => $voucher->description,
            'discount_type' => $voucher->discount_type,
            'discount_value' => $voucher->discount_value,
            'max_discount' => $voucher->max_discount,
            'min_order_amount' => $voucher->min_order_amount,
            'usage_limit' => $voucher->usage_limit,
            'used_count' => $voucher->used_count,
            'paid_orders_count' => $voucher->paid_orders_count ?? 0,
            'starts_at' => $voucher->starts_at?->format('Y-m-d\TH:i'),
            'ends_at' => $voucher->ends_at?->format('Y-m-d\TH:i'),
            'is_active' => $voucher->is_active,
            'created_at' => $voucher->created_at?->toFormattedDateString(),
        ];
    }

    private function payload(Request $request, bool $defaultActive): array
    {
        $data = $request->validated();
        $data['code'] = Str::upper($data['code']);
        $data['is_active'] = $request->boolean('is_active', $defaultActive);

        return $data;
    }
}
