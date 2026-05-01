<?php

namespace App\Services\Admin;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    private const TYPES = ['sales', 'products', 'customers', 'shipments', 'vouchers'];

    /**
     * @return array<string, mixed>
     */
    public function data(Request $request, string $type): array
    {
        abort_unless(in_array($type, self::TYPES, true), 404);

        [$start, $end] = $this->window($request);

        return [
            'type' => $type,
            'tabs' => self::TYPES,
            'filters' => [
                'date_from' => $start->toDateString(),
                'date_to' => $end->toDateString(),
                'payment_status' => $request->string('payment_status')->toString(),
                'order_status' => $request->string('order_status')->toString(),
                'category_id' => $request->string('category_id')->toString(),
                'collection_id' => $request->string('collection_id')->toString(),
            ],
            'options' => $this->options(),
            'report' => match ($type) {
                'products' => $this->productReport($start, $end, $request),
                'customers' => $this->customerReport($start, $end),
                'shipments' => $this->shipmentReport($start, $end),
                'vouchers' => $this->voucherReport($start, $end),
                default => $this->salesReport($start, $end, $request),
            },
        ];
    }

    public function exportCsv(Request $request, string $type): StreamedResponse
    {
        $payload = $this->data($request, $type);
        $filename = "report-{$type}-{$payload['filters']['date_from']}-{$payload['filters']['date_to']}.csv";

        return response()->streamDownload(function () use ($payload): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Metric', 'Value']);

            foreach ($payload['report']['metrics'] as $metric) {
                fputcsv($handle, [$metric['label'], $metric['value']]);
            }

            foreach ($payload['report']['tables'] as $table) {
                fputcsv($handle, []);
                fputcsv($handle, [$table['title']]);
                fputcsv($handle, $table['columns']);

                foreach ($table['rows'] as $row) {
                    fputcsv($handle, collect($table['columns'])->map(fn (string $column): mixed => $row[$column] ?? null)->all());
                }
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function window(Request $request): array
    {
        $now = CarbonImmutable::now();
        $start = CarbonImmutable::parse($request->string('date_from')->toString() ?: $now->startOfMonth()->toDateString())->startOfDay();
        $end = CarbonImmutable::parse($request->string('date_to')->toString() ?: $now->toDateString())->endOfDay();

        return [$start, $end];
    }

    /**
     * @return array<string, mixed>
     */
    private function salesReport(CarbonImmutable $start, CarbonImmutable $end, Request $request): array
    {
        $orders = $this->ordersQuery($start, $end, $request);
        $paidOrders = (clone $orders)->where('payment_status', 'paid');
        $gross = (float) (clone $paidOrders)->sum('grand_total');
        $shipping = (float) (clone $paidOrders)->sum('shipping_cost');
        $discount = (float) (clone $paidOrders)->sum('discount_amount');
        $service = (float) (clone $paidOrders)->sum('service_fee');
        $paidCount = (clone $paidOrders)->count();

        return [
            'metrics' => [
                ['label' => 'Gross revenue', 'value' => $gross, 'format' => 'currency'],
                ['label' => 'Net revenue', 'value' => $gross - $shipping - $service, 'format' => 'currency'],
                ['label' => 'Total shipping cost', 'value' => $shipping, 'format' => 'currency'],
                ['label' => 'Total discount', 'value' => $discount, 'format' => 'currency'],
                ['label' => 'Total service fee', 'value' => $service, 'format' => 'currency'],
                ['label' => 'Total orders', 'value' => (clone $orders)->count(), 'format' => 'number'],
                ['label' => 'Average order value', 'value' => $paidCount > 0 ? $gross / $paidCount : 0, 'format' => 'currency'],
                ['label' => 'Paid orders', 'value' => $paidCount, 'format' => 'number'],
                ['label' => 'Cancelled orders', 'value' => (clone $orders)->where('order_status', 'cancelled')->count(), 'format' => 'number'],
                ['label' => 'Expired orders', 'value' => (clone $orders)->where('order_status', 'expired')->count(), 'format' => 'number'],
            ],
            'tables' => [
                [
                    'title' => 'Recent filtered orders',
                    'columns' => ['order_number', 'customer_name', 'grand_total', 'payment_status', 'order_status', 'created_at'],
                    'rows' => (clone $orders)->latest('created_at')->limit(25)->get()->map(fn (object $row): array => (array) $row)->all(),
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function productReport(CarbonImmutable $start, CarbonImmutable $end, Request $request): array
    {
        $items = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->leftJoin('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.paid_at', [$start, $end])
            ->when($request->string('category_id')->toString() !== '', fn ($query) => $query->where('products.category_id', $request->string('category_id')->toString()))
            ->when($request->string('collection_id')->toString() !== '', fn ($query) => $query->where('products.collection_id', $request->string('collection_id')->toString()));

        $products = (clone $items)
            ->selectRaw('order_items.product_name, coalesce(order_items.product_sku, "-") as product_sku, sum(order_items.quantity) as quantity, sum(order_items.subtotal) as revenue')
            ->groupBy('order_items.product_name', 'order_items.product_sku')
            ->orderByDesc('quantity')
            ->limit(20)
            ->get();
        $variants = (clone $items)
            ->selectRaw('coalesce(order_items.variant_sku, "-") as variant_sku, order_items.product_name, order_items.color_name, order_items.size, sum(order_items.quantity) as quantity, sum(order_items.subtotal) as revenue')
            ->groupBy('order_items.variant_sku', 'order_items.product_name', 'order_items.color_name', 'order_items.size')
            ->orderByDesc('quantity')
            ->limit(20)
            ->get();
        $lowStock = $this->stockTable('<=', 5);
        $soldOut = $this->stockTable('<=', 0);

        return [
            'metrics' => [
                ['label' => 'Products sold', 'value' => (clone $items)->distinct('order_items.product_name')->count('order_items.product_name'), 'format' => 'number'],
                ['label' => 'Units sold', 'value' => (int) (clone $items)->sum('order_items.quantity'), 'format' => 'number'],
                ['label' => 'Product revenue', 'value' => (float) (clone $items)->sum('order_items.subtotal'), 'format' => 'currency'],
                ['label' => 'Low stock products', 'value' => $lowStock->count(), 'format' => 'number'],
                ['label' => 'Sold out products', 'value' => $soldOut->count(), 'format' => 'number'],
            ],
            'tables' => [
                ['title' => 'Best selling products', 'columns' => ['product_name', 'product_sku', 'quantity', 'revenue'], 'rows' => $products->map(fn (object $row): array => (array) $row)->all()],
                ['title' => 'Best selling variants', 'columns' => ['variant_sku', 'product_name', 'color_name', 'size', 'quantity', 'revenue'], 'rows' => $variants->map(fn (object $row): array => (array) $row)->all()],
                ['title' => 'Low stock variants', 'columns' => ['product_name', 'sku', 'stock', 'reserved_stock', 'available_stock'], 'rows' => $lowStock->map(fn (object $row): array => (array) $row)->all()],
                ['title' => 'Sold out variants', 'columns' => ['product_name', 'sku', 'stock', 'reserved_stock', 'available_stock'], 'rows' => $soldOut->map(fn (object $row): array => (array) $row)->all()],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function customerReport(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $newCustomers = DB::table('users')->where('role', 'customer')->whereBetween('created_at', [$start, $end])->count();
        $repeatCustomers = DB::table('orders')
            ->whereBetween('created_at', [$start, $end])
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('count(*) > 1')
            ->count();
        $topSpend = DB::table('orders')
            ->selectRaw('customer_name, customer_email, count(*) as orders_count, sum(grand_total) as total_spending')
            ->where('payment_status', 'paid')
            ->whereBetween('paid_at', [$start, $end])
            ->groupBy('customer_name', 'customer_email')
            ->orderByDesc('total_spending')
            ->limit(20)
            ->get();
        $cities = DB::table('orders')
            ->join('customer_addresses', 'customer_addresses.id', '=', 'orders.customer_address_id')
            ->selectRaw('customer_addresses.city, count(*) as customers')
            ->whereBetween('orders.created_at', [$start, $end])
            ->groupBy('customer_addresses.city')
            ->orderByDesc('customers')
            ->limit(20)
            ->get();

        return [
            'metrics' => [
                ['label' => 'New customers', 'value' => $newCustomers, 'format' => 'number'],
                ['label' => 'Repeat customers', 'value' => $repeatCustomers, 'format' => 'number'],
                ['label' => 'Customers with paid orders', 'value' => $topSpend->count(), 'format' => 'number'],
            ],
            'tables' => [
                ['title' => 'Top customers by spending', 'columns' => ['customer_name', 'customer_email', 'orders_count', 'total_spending'], 'rows' => $topSpend->map(fn (object $row): array => (array) $row)->all()],
                ['title' => 'Customer city distribution', 'columns' => ['city', 'customers'], 'rows' => $cities->map(fn (object $row): array => (array) $row)->all()],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function shipmentReport(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $shipments = DB::table('shipments')->whereBetween('created_at', [$start, $end]);
        $byCourier = (clone $shipments)->selectRaw('courier_company, count(*) as shipments')->groupBy('courier_company')->orderByDesc('shipments')->get();
        $byStatus = (clone $shipments)->selectRaw('shipping_status, count(*) as shipments')->groupBy('shipping_status')->orderByDesc('shipments')->get();
        $driver = DB::connection()->getDriverName();
        $averageExpression = $driver === 'sqlite'
            ? "avg((julianday(delivered_at) - julianday(shipped_at)) * 24)"
            : 'avg(timestampdiff(hour, shipped_at, delivered_at))';
        $averageDelivery = (clone $shipments)
            ->whereNotNull('shipped_at')
            ->whereNotNull('delivered_at')
            ->selectRaw("{$averageExpression} as hours")
            ->value('hours');

        return [
            'metrics' => [
                ['label' => 'Total shipments', 'value' => (clone $shipments)->count(), 'format' => 'number'],
                ['label' => 'Delivered shipments', 'value' => (clone $shipments)->where('shipping_status', 'delivered')->count(), 'format' => 'number'],
                ['label' => 'Problem shipments', 'value' => (clone $shipments)->whereIn('shipping_status', ['problem', 'cancelled'])->count(), 'format' => 'number'],
                ['label' => 'Avg delivery hours', 'value' => round((float) $averageDelivery, 1), 'format' => 'number'],
            ],
            'tables' => [
                ['title' => 'Shipment by courier', 'columns' => ['courier_company', 'shipments'], 'rows' => $byCourier->map(fn (object $row): array => (array) $row)->all()],
                ['title' => 'Shipment by status', 'columns' => ['shipping_status', 'shipments'], 'rows' => $byStatus->map(fn (object $row): array => (array) $row)->all()],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function voucherReport(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $orders = DB::table('orders')->whereNotNull('voucher_id')->whereBetween('created_at', [$start, $end]);
        $usage = (clone $orders)
            ->selectRaw('voucher_code, count(*) as usage_count, sum(discount_amount) as total_discount, sum(case when payment_status = "paid" then 1 else 0 end) as paid_usage')
            ->groupBy('voucher_code')
            ->orderByDesc('usage_count')
            ->limit(20)
            ->get();

        return [
            'metrics' => [
                ['label' => 'Voucher orders', 'value' => (clone $orders)->count(), 'format' => 'number'],
                ['label' => 'Total discount given', 'value' => (float) (clone $orders)->sum('discount_amount'), 'format' => 'currency'],
                ['label' => 'Paid voucher orders', 'value' => (clone $orders)->where('payment_status', 'paid')->count(), 'format' => 'number'],
            ],
            'tables' => [
                ['title' => 'Most used voucher', 'columns' => ['voucher_code', 'usage_count', 'paid_usage', 'total_discount'], 'rows' => $usage->map(fn (object $row): array => (array) $row)->all()],
            ],
        ];
    }

    private function ordersQuery(CarbonImmutable $start, CarbonImmutable $end, Request $request): \Illuminate\Database\Query\Builder
    {
        $query = DB::table('orders')->whereBetween('created_at', [$start, $end]);

        $paymentStatus = $request->string('payment_status')->toString();
        $orderStatus = $request->string('order_status')->toString();

        return $query
            ->when($paymentStatus !== '', fn ($query) => $query->where('payment_status', $paymentStatus))
            ->when($orderStatus !== '', fn ($query) => $query->where('order_status', $orderStatus));
    }

    private function stockTable(string $operator, int $threshold): Collection
    {
        return DB::table('product_variants')
            ->leftJoin('products', 'products.id', '=', 'product_variants.product_id')
            ->selectRaw('products.name as product_name, product_variants.sku, product_variants.stock, product_variants.reserved_stock, (product_variants.stock - product_variants.reserved_stock) as available_stock')
            ->whereNull('product_variants.deleted_at')
            ->whereRaw("(product_variants.stock - product_variants.reserved_stock) {$operator} ?", [$threshold])
            ->orderBy('available_stock')
            ->limit(20)
            ->get();
    }

    /**
     * @return array<string, mixed>
     */
    private function options(): array
    {
        return [
            'paymentStatuses' => ['pending', 'paid', 'expired', 'failed', 'cancelled'],
            'orderStatuses' => ['pending_payment', 'paid', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled', 'expired'],
            'categories' => Schema::hasTable('categories') ? DB::table('categories')->select('id', 'name')->orderBy('name')->get() : [],
            'collections' => Schema::hasTable('collections') ? DB::table('collections')->select('id', 'name')->orderBy('name')->get() : [],
        ];
    }
}
