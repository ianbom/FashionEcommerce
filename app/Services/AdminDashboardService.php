<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminDashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function overview(Request $request): array
    {
        [$start, $end, $label, $range] = $this->dateWindow($request);

        return [
            'filters' => [
                'range' => $range,
                'date_from' => $start->toDateString(),
                'date_to' => $end->toDateString(),
            ],
            'range' => [
                'key' => $range,
                'label' => $label,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'summary' => $this->summary($start, $end),
            'salesChart' => $this->salesChart($start, $end, $request->string('group_by')->toString()),
            'orderStatusChart' => $this->distribution('orders', 'order_status', [
                'pending_payment',
                'paid',
                'processing',
                'ready_to_ship',
                'shipped',
                'delivered',
                'completed',
                'cancelled',
                'expired',
            ], $start, $end),
            'paymentStatusChart' => $this->distribution('orders', 'payment_status', [
                'pending',
                'paid',
                'expired',
                'failed',
                'cancelled',
            ], $start, $end),
            'paymentSummary' => $this->paymentSummary($start, $end),
            'shippingSummary' => $this->shippingSummary($start, $end),
            'attentionOrders' => $this->attentionOrders($start, $end),
            'recentOrders' => $this->recentOrders($start, $end),
            'lowStockVariants' => $this->lowStockVariants(),
            'latestPaymentLogs' => $this->latestPaymentLogs(),
            'latestShipments' => $this->latestShipments(),
        ];
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: string, 3: string}
     */
    private function dateWindow(Request $request): array
    {
        $now = CarbonImmutable::now();
        $range = $request->string('range')->toString() ?: '30d';

        if ($range === 'custom') {
            $start = CarbonImmutable::parse($request->string('date_from')->toString() ?: $now->subDays(29)->toDateString())->startOfDay();
            $end = CarbonImmutable::parse($request->string('date_to')->toString() ?: $now->toDateString())->endOfDay();

            return [$start, $end, 'Custom Range', 'custom'];
        }

        return match ($range) {
            'today' => [$now->startOfDay(), $now->endOfDay(), 'Today', 'today'],
            '7d' => [$now->subDays(6)->startOfDay(), $now->endOfDay(), 'Last 7 Days', '7d'],
            'month' => [$now->startOfMonth(), $now->endOfMonth(), 'This Month', 'month'],
            default => [$now->subDays(29)->startOfDay(), $now->endOfDay(), 'Last 30 Days', '30d'],
        };
    }

    /**
     * @return array<int, array<string, string|int|float>>
     */
    private function summary(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $monthStart = CarbonImmutable::now()->startOfMonth();
        $monthEnd = CarbonImmutable::now()->endOfMonth();

        return [
            ['label' => 'Revenue', 'value' => $this->paidRevenue($start, $end), 'format' => 'currency'],
            ['label' => 'Orders', 'value' => $this->orderCount($start, $end), 'format' => 'number'],
            ['label' => 'Pending Shipment', 'value' => $this->pendingShipmentCount(), 'format' => 'number'],
            ['label' => 'Low Stock Products', 'value' => $this->variantStockCount(1, 5), 'format' => 'number'],
            ['label' => 'Revenue Month', 'value' => $this->paidRevenue($monthStart, $monthEnd), 'format' => 'currency'],
            ['label' => 'Pending Payment', 'value' => $this->paymentStatusCount('pending', $start, $end), 'format' => 'number'],
            ['label' => 'Processing', 'value' => $this->orderStatusCount('processing', $start, $end), 'format' => 'number'],
            ['label' => 'Shipped', 'value' => $this->orderStatusCount('shipped', $start, $end), 'format' => 'number'],
            ['label' => 'Completed', 'value' => $this->orderStatusCount('completed', $start, $end), 'format' => 'number'],
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

    private function orderStatusCount(string $status, CarbonImmutable $start, CarbonImmutable $end): int
    {
        if (! Schema::hasTable('orders')) {
            return 0;
        }

        return $this->ordersInRange($start, $end)->where('order_status', $status)->count();
    }

    private function paymentStatusCount(string $status, CarbonImmutable $start, CarbonImmutable $end): int
    {
        if (! Schema::hasTable('orders')) {
            return 0;
        }

        return $this->ordersInRange($start, $end)->where('payment_status', $status)->count();
    }

    private function ordersInRange(CarbonImmutable $start, CarbonImmutable $end): \Illuminate\Database\Query\Builder
    {
        return DB::table('orders')->whereBetween('created_at', [$start, $end]);
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
            ->whereNull('deleted_at')
            ->whereRaw('(stock - reserved_stock) <= ?', [$max])
            ->where('is_active', true);

        if ($min !== null) {
            $query->whereRaw('(stock - reserved_stock) >= ?', [$min]);
        }

        return $query->count();
    }

    private function pendingShipmentCount(): int
    {
        if (! Schema::hasTable('orders')) {
            return 0;
        }

        return DB::table('orders')
            ->where('payment_status', 'paid')
            ->whereIn('shipping_status', ['pending', 'not_created', 'ready_to_ship', 'need_shipment', 'waiting_for_shipment'])
            ->count();
    }

    /**
     * @return array<int, array{date: string, revenue: float, orders: int}>
     */
    private function salesChart(CarbonImmutable $start, CarbonImmutable $end, string $groupBy): array
    {
        $groupBy = in_array($groupBy, ['daily', 'weekly', 'monthly'], true) ? $groupBy : 'daily';
        $driver = DB::connection()->getDriverName();
        $dateExpression = match ($groupBy) {
            'monthly' => $driver === 'sqlite' ? "strftime('%Y-%m', paid_at)" : "date_format(paid_at, '%Y-%m')",
            'weekly' => $driver === 'sqlite' ? "strftime('%Y-W%W', paid_at)" : "date_format(paid_at, '%x-W%v')",
            default => $driver === 'sqlite' ? "strftime('%Y-%m-%d', paid_at)" : 'date(paid_at)',
        };

        if (! Schema::hasTable('orders')) {
            return [];
        }

        return DB::table('orders')
            ->selectRaw("{$dateExpression} as date, sum(grand_total) as revenue, count(*) as orders")
            ->where('payment_status', 'paid')
            ->whereBetween('paid_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn (object $row): array => [
                'date' => (string) $row->date,
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ])
            ->all();
    }

    /**
     * @param  array<int, string>  $labels
     * @return array<int, array{label: string, value: int}>
     */
    private function distribution(string $table, string $column, array $labels, CarbonImmutable $start, CarbonImmutable $end): array
    {
        if (! Schema::hasTable($table)) {
            return collect($labels)->map(fn (string $label): array => ['label' => $label, 'value' => 0])->all();
        }

        $counts = DB::table($table)
            ->selectRaw("{$column} as label, count(*) as value")
            ->whereBetween('created_at', [$start, $end])
            ->groupBy($column)
            ->pluck('value', 'label');

        return collect($labels)
            ->map(fn (string $label): array => ['label' => $label, 'value' => (int) ($counts[$label] ?? 0)])
            ->all();
    }

    private function recentOrders(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        if (! Schema::hasTable('orders')) {
            return collect();
        }

        return DB::table('orders')
            ->select(['id', 'user_id', 'order_number', 'customer_name', 'grand_total', 'payment_status', 'order_status', 'shipping_status', 'created_at'])
            ->whereBetween('created_at', [$start, $end])
            ->latest('created_at')
            ->limit(10)
            ->get();
    }

    private function attentionOrders(CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        if (! Schema::hasTable('orders')) {
            return collect();
        }

        return DB::table('orders')
            ->select(['id', 'user_id', 'order_number', 'customer_name', 'payment_status', 'order_status', 'shipping_status', 'created_at'])
            ->whereBetween('created_at', [$start, $end])
            ->where(function ($query): void {
                $query
                    ->whereIn('payment_status', ['pending', 'pending_payment', 'failed', 'expired'])
                    ->orWhereIn('order_status', ['return_requested', 'refund_requested'])
                    ->orWhereIn('shipping_status', ['pending', 'not_created', 'ready_to_ship', 'need_shipment', 'waiting_for_shipment', 'problem', 'delivery_issue', 'failed']);
            })
            ->orderByRaw("case
                when shipping_status in ('problem', 'delivery_issue', 'failed') then 0
                when order_status in ('return_requested', 'refund_requested') then 1
                when payment_status in ('failed', 'expired') then 2
                when payment_status in ('pending', 'pending_payment') then 3
                else 4
            end")
            ->latest('created_at')
            ->limit(4)
            ->get()
            ->map(fn (object $order): array => [
                'id' => (int) $order->id,
                'user_id' => $order->user_id ? (int) $order->user_id : null,
                'order_number' => (string) $order->order_number,
                'customer_name' => (string) $order->customer_name,
                'payment_status' => (string) $order->payment_status,
                'order_status' => (string) $order->order_status,
                'shipping_status' => (string) $order->shipping_status,
                'action' => $this->attentionAction((string) $order->payment_status, (string) $order->order_status, (string) $order->shipping_status),
            ]);
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function paymentSummary(CarbonImmutable $start, CarbonImmutable $end): array
    {
        if (! Schema::hasTable('orders')) {
            return $this->emptySummary(['Paid Today', 'Pending Payment', 'Failed Payment', 'Expired Payment']);
        }

        return [
            ['label' => 'Paid', 'value' => $this->paymentStatusCount('paid', $start, $end)],
            ['label' => 'Pending Payment', 'value' => $this->paymentStatusCount('pending', $start, $end)],
            ['label' => 'Failed Payment', 'value' => $this->paymentStatusCount('failed', $start, $end)],
            ['label' => 'Expired Payment', 'value' => $this->paymentStatusCount('expired', $start, $end)],
        ];
    }

    /**
     * @return array<int, array{label: string, value: int}>
     */
    private function shippingSummary(CarbonImmutable $start, CarbonImmutable $end): array
    {
        if (! Schema::hasTable('orders')) {
            return $this->emptySummary(['Need Shipment', 'In Delivery', 'Delivered Today', 'Shipping Issue']);
        }

        return [
            ['label' => 'Need Shipment', 'value' => $this->pendingShipmentCount()],
            ['label' => 'In Delivery', 'value' => $this->shippingStatusCount(['shipped', 'in_transit', 'allocated', 'picked'], $start, $end)],
            ['label' => 'Delivered', 'value' => $this->shippingStatusCount(['delivered'], $start, $end)],
            ['label' => 'Shipping Issue', 'value' => $this->shippingStatusCount(['problem', 'delivery_issue', 'failed'], $start, $end)],
        ];
    }

    /**
     * @param  array<int, string>  $statuses
     */
    private function shippingStatusCount(array $statuses, CarbonImmutable $start, CarbonImmutable $end): int
    {
        return $this->ordersInRange($start, $end)->whereIn('shipping_status', $statuses)->count();
    }

    /**
     * @param  array<int, string>  $labels
     * @return array<int, array{label: string, value: int}>
     */
    private function emptySummary(array $labels): array
    {
        return collect($labels)->map(fn (string $label): array => ['label' => $label, 'value' => 0])->all();
    }

    private function attentionAction(string $paymentStatus, string $orderStatus, string $shippingStatus): string
    {
        if (in_array($shippingStatus, ['problem', 'delivery_issue', 'failed'], true)) {
            return 'Check Shipping';
        }

        if (in_array($orderStatus, ['return_requested', 'refund_requested'], true)) {
            return 'Review Return';
        }

        if (in_array($paymentStatus, ['pending', 'pending_payment', 'failed', 'expired'], true)) {
            return 'View Order';
        }

        return 'Process Shipment';
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
                'product_variants.product_id',
                'product_variants.sku',
                'product_variants.color_name',
                'product_variants.size',
                'product_variants.stock',
                'product_variants.reserved_stock',
                DB::raw('(product_variants.stock - product_variants.reserved_stock) as available_stock'),
                DB::raw('products.name as product_name'),
            ])
            ->whereNull('product_variants.deleted_at')
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
            ->select([
                'shipments.id',
                'shipments.waybill_id',
                'shipments.courier_company',
                'shipments.courier_type',
                'shipments.estimated_delivery',
                'shipments.updated_at',
                DB::raw('shipments.shipping_status as shipping_status'),
                DB::raw('orders.order_number as order_number'),
            ])
            ->latest('shipments.updated_at')
            ->limit(8)
            ->get();
    }
}
