<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function overview(string $range): array
    {
        [$start, $end, $label] = $this->dateWindow($range);

        return [
            'range' => [
                'key' => $range,
                'label' => $label,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'summary' => $this->summary($start, $end),
            'salesChart' => $this->salesChart($start, $end),
            'orderStatusChart' => $this->distribution('orders', 'order_status'),
            'paymentStatusChart' => $this->distribution('orders', 'payment_status'),
            'recentOrders' => $this->recentOrders(),
            'lowStockVariants' => $this->lowStockVariants(),
            'latestPaymentLogs' => $this->latestPaymentLogs(),
            'latestShipments' => $this->latestShipments(),
        ];
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: string}
     */
    private function dateWindow(string $range): array
    {
        $now = CarbonImmutable::now();

        return match ($range) {
            'today' => [$now->startOfDay(), $now->endOfDay(), 'Today'],
            '7d' => [$now->subDays(6)->startOfDay(), $now->endOfDay(), 'Last 7 Days'],
            'month' => [$now->startOfMonth(), $now->endOfMonth(), 'This Month'],
            default => [$now->subDays(29)->startOfDay(), $now->endOfDay(), 'Last 30 Days'],
        };
    }

    /**
     * @return array<int, array<string, string|int|float>>
     */
    private function summary(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $todayStart = CarbonImmutable::now()->startOfDay();
        $todayEnd = CarbonImmutable::now()->endOfDay();
        $monthStart = CarbonImmutable::now()->startOfMonth();
        $monthEnd = CarbonImmutable::now()->endOfMonth();

        return [
            ['label' => 'Revenue Today', 'value' => $this->paidRevenue($todayStart, $todayEnd), 'format' => 'currency'],
            ['label' => 'Revenue Month', 'value' => $this->paidRevenue($monthStart, $monthEnd), 'format' => 'currency'],
            ['label' => 'Orders Today', 'value' => $this->orderCount($todayStart, $todayEnd), 'format' => 'number'],
            ['label' => 'Pending Payment', 'value' => $this->countWhere('orders', 'order_status', 'pending_payment'), 'format' => 'number'],
            ['label' => 'Paid Orders', 'value' => $this->countWhere('orders', 'payment_status', 'paid'), 'format' => 'number'],
            ['label' => 'Processing', 'value' => $this->countWhere('orders', 'order_status', 'processing'), 'format' => 'number'],
            ['label' => 'Shipped', 'value' => $this->countWhere('orders', 'order_status', 'shipped'), 'format' => 'number'],
            ['label' => 'Completed', 'value' => $this->countWhere('orders', 'order_status', 'completed'), 'format' => 'number'],
            ['label' => 'Customers', 'value' => $this->customersCount(), 'format' => 'number'],
            ['label' => 'Published Products', 'value' => $this->countWhere('products', 'status', 'published'), 'format' => 'number'],
            ['label' => 'Low Stock Variants', 'value' => $this->variantStockCount(1, 5), 'format' => 'number'],
            ['label' => 'Sold Out Variants', 'value' => $this->variantStockCount(null, 0), 'format' => 'number'],
        ];
    }

    private function paidRevenue(CarbonImmutable $start, CarbonImmutable $end): float
    {
        if (! Schema::hasTable('orders')) {
            return 0;
        }

        return (float) DB::table('orders')
            ->where('payment_status', 'paid')
            ->whereBetween('paid_at', [$start, $end])
            ->sum('grand_total');
    }

    private function orderCount(CarbonImmutable $start, CarbonImmutable $end): int
    {
        if (! Schema::hasTable('orders')) {
            return 0;
        }

        return DB::table('orders')->whereBetween('created_at', [$start, $end])->count();
    }

    private function countWhere(string $table, string $column, string $value): int
    {
        if (! Schema::hasTable($table)) {
            return 0;
        }

        return DB::table($table)->where($column, $value)->count();
    }

    private function customersCount(): int
    {
        if (! Schema::hasTable('users')) {
            return 0;
        }

        return DB::table('users')->where('role', 'customer')->where('is_active', true)->count();
    }

    private function variantStockCount(?int $min, int $max): int
    {
        if (! Schema::hasTable('product_variants')) {
            return 0;
        }

        $query = DB::table('product_variants')
            ->whereRaw('(stock - reserved_stock) <= ?', [$max])
            ->where('is_active', true);

        if ($min !== null) {
            $query->whereRaw('(stock - reserved_stock) >= ?', [$min]);
        }

        return $query->count();
    }

    /**
     * @return array<int, array{date: string, revenue: float}>
     */
    private function salesChart(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $days = collect();
        $cursor = $start;

        while ($cursor->lte($end)) {
            $days->put($cursor->toDateString(), 0.0);
            $cursor = $cursor->addDay();
        }

        if (! Schema::hasTable('orders')) {
            return $days->map(fn (float $revenue, string $date): array => compact('date', 'revenue'))->values()->all();
        }

        DB::table('orders')
            ->selectRaw('date(paid_at) as paid_date, sum(grand_total) as revenue')
            ->where('payment_status', 'paid')
            ->whereBetween('paid_at', [$start, $end])
            ->groupBy('paid_date')
            ->get()
            ->each(function (object $row) use ($days): void {
                $days->put($row->paid_date, (float) $row->revenue);
            });

        return $days->map(fn (float $revenue, string $date): array => compact('date', 'revenue'))->values()->all();
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function distribution(string $table, string $column): array
    {
        if (! Schema::hasTable($table)) {
            return [];
        }

        return DB::table($table)
            ->selectRaw("{$column} as label, count(*) as value")
            ->groupBy($column)
            ->orderByDesc('value')
            ->get()
            ->map(fn (object $row): array => ['label' => (string) $row->label, 'value' => (int) $row->value])
            ->all();
    }

    private function recentOrders(): Collection
    {
        if (! Schema::hasTable('orders')) {
            return collect();
        }

        return DB::table('orders')
            ->select(['id', 'order_number', 'customer_name', 'grand_total', 'payment_status', 'order_status', 'shipping_status', 'created_at'])
            ->latest('created_at')
            ->limit(10)
            ->get();
    }

    private function lowStockVariants(): Collection
    {
        if (! Schema::hasTable('product_variants')) {
            return collect();
        }

        return DB::table('product_variants')
            ->leftJoin('products', 'products.id', '=', 'product_variants.product_id')
            ->select([
                'product_variants.id',
                'product_variants.sku',
                'product_variants.color_name',
                'product_variants.size',
                'product_variants.stock',
                'product_variants.reserved_stock',
                DB::raw('(product_variants.stock - product_variants.reserved_stock) as available_stock'),
                DB::raw('products.name as product_name'),
            ])
            ->whereRaw('(product_variants.stock - product_variants.reserved_stock) <= 5')
            ->orderBy('available_stock')
            ->limit(10)
            ->get();
    }

    private function latestPaymentLogs(): Collection
    {
        if (! Schema::hasTable('payment_logs')) {
            return collect();
        }

        return DB::table('payment_logs')
            ->leftJoin('orders', 'orders.id', '=', 'payment_logs.order_id')
            ->select(['payment_logs.id', 'provider', 'event_type', 'transaction_status', 'processed_at', 'payment_logs.created_at', DB::raw('orders.order_number as order_number')])
            ->latest('payment_logs.created_at')
            ->limit(8)
            ->get();
    }

    private function latestShipments(): Collection
    {
        if (! Schema::hasTable('shipments')) {
            return collect();
        }

        return DB::table('shipments')
            ->leftJoin('orders', 'orders.id', '=', 'shipments.order_id')
            ->select(['shipments.id', 'waybill_id', 'courier_company', 'courier_type', 'shipping_status', 'estimated_delivery', 'shipments.updated_at', DB::raw('orders.order_number as order_number')])
            ->latest('shipments.updated_at')
            ->limit(8)
            ->get();
    }
}
