<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Response;

class AdminPageController extends Controller
{
    /** @var array<string, array<string, mixed>> */
    private array $modules = [
        'products' => [
            'title' => 'Products',
            'group' => 'Catalog Management',
            'table' => 'products',
            'description' => 'Manage catalog products, prices, publication status, labels, and SEO metadata.',
            'columns' => ['name', 'sku', 'category', 'collection', 'base_price', 'sale_price', 'stock', 'status', 'created_at'],
        ],
        'product-variants' => [
            'title' => 'Product Variants',
            'group' => 'Catalog Management',
            'table' => 'product_variants',
            'description' => 'Review variant SKU, color, size, stock, reserved stock, and active status.',
            'columns' => ['sku', 'product', 'color_name', 'size', 'stock', 'reserved_stock', 'available_stock', 'is_active'],
        ],
        'categories' => [
            'title' => 'Categories',
            'group' => 'Catalog Management',
            'table' => 'categories',
            'description' => 'Organize customer-facing product categories.',
            'columns' => ['name', 'slug', 'products_count', 'is_active', 'created_at'],
        ],
        'collections' => [
            'title' => 'Collections',
            'group' => 'Catalog Management',
            'table' => 'collections',
            'description' => 'Manage campaign collections and featured homepage groupings.',
            'columns' => ['name', 'slug', 'products_count', 'is_featured', 'is_active', 'created_at'],
        ],
        'stock' => [
            'title' => 'Stock',
            'group' => 'Catalog Management',
            'table' => 'product_variants',
            'description' => 'Monitor stock, reserved quantity, and available inventory for each variant.',
            'columns' => ['sku', 'product', 'color_name', 'size', 'stock', 'reserved_stock', 'available_stock'],
            'readonly' => true,
        ],
        'stock-logs' => [
            'title' => 'Stock Logs',
            'group' => 'Catalog Management',
            'table' => 'stock_logs',
            'description' => 'Audit every stock movement and manual adjustment.',
            'columns' => ['variant', 'type', 'quantity', 'stock_before', 'stock_after', 'reference', 'created_at'],
            'readonly' => true,
        ],
        'orders' => [
            'title' => 'Orders',
            'group' => 'Sales Management',
            'table' => 'orders',
            'description' => 'Track and process customer orders from payment to completion.',
            'columns' => ['order_number', 'customer_name', 'grand_total', 'payment_status', 'order_status', 'shipping_status', 'created_at'],
            'readonly' => true,
        ],
        'payments' => [
            'title' => 'Payments',
            'group' => 'Sales Management',
            'table' => 'payments',
            'description' => 'Monitor Midtrans payment transactions and settlement status.',
            'columns' => ['order_number', 'midtrans_order_id', 'payment_method', 'gross_amount', 'transaction_status', 'paid_at'],
            'readonly' => true,
        ],
        'payment-logs' => [
            'title' => 'Payment Logs',
            'group' => 'Sales Management',
            'table' => 'payment_logs',
            'description' => 'Read webhook payloads and Midtrans audit logs.',
            'columns' => ['provider', 'event_type', 'transaction_status', 'order_number', 'processed_at', 'created_at'],
            'readonly' => true,
        ],
        'shipments' => [
            'title' => 'Shipments',
            'group' => 'Sales Management',
            'table' => 'shipments',
            'description' => 'Track Biteship shipment status, courier, waybill, and delivery timeline.',
            'columns' => ['order_number', 'waybill_id', 'courier_company', 'courier_type', 'shipping_status', 'estimated_delivery'],
            'readonly' => true,
        ],
        'vouchers' => [
            'title' => 'Vouchers',
            'group' => 'Sales Management',
            'table' => 'vouchers',
            'description' => 'Create and manage promotion codes, limits, and active periods.',
            'columns' => ['code', 'name', 'discount_type', 'discount_value', 'used_count', 'is_active', 'ends_at'],
        ],
        'customers' => [
            'title' => 'Customers',
            'group' => 'Customer Management',
            'table' => 'users',
            'description' => 'View customer profiles, activation state, and order activity.',
            'columns' => ['name', 'email', 'phone', 'is_active', 'orders_count', 'created_at'],
            'readonly' => true,
        ],
        'customer-addresses' => [
            'title' => 'Customer Addresses',
            'group' => 'Customer Management',
            'table' => 'customer_addresses',
            'description' => 'Review customer address book data used during checkout.',
            'columns' => ['recipient_name', 'recipient_phone', 'city', 'district', 'postal_code', 'is_default'],
            'readonly' => true,
        ],
        'notifications' => [
            'title' => 'Notifications',
            'group' => 'Customer Management',
            'table' => 'notifications',
            'description' => 'Review customer notification history and operational messages.',
            'columns' => ['title', 'type', 'user', 'is_read', 'created_at'],
        ],
        'banners' => [
            'title' => 'Banners',
            'group' => 'Content Management',
            'table' => 'banners',
            'description' => 'Manage homepage and campaign banner placements.',
            'columns' => ['title', 'placement', 'sort_order', 'is_active', 'starts_at', 'ends_at'],
        ],
        'pages' => [
            'title' => 'Pages',
            'group' => 'Content Management',
            'table' => 'pages',
            'description' => 'Manage static policy, FAQ, terms, privacy, shipping, and size guide pages.',
            'columns' => ['title', 'slug', 'type', 'is_active', 'created_at'],
        ],
        'settings' => [
            'title' => 'Site Settings',
            'group' => 'Settings',
            'table' => 'site_settings',
            'description' => 'Manage store, SEO, payment, and shipping settings stored as key-value records.',
            'columns' => ['key', 'value', 'type', 'updated_at'],
            'readonly' => true,
        ],
    ];

    public function index(Request $request): Response
    {
        $module = (string) $request->route('module');
        $definition = $this->definition($module);

        return inertia('admin/resource-index', [
            'definition' => $definition,
            'filters' => [
                'search' => $request->string('search')->toString(),
            ],
            'rows' => $this->rows($module, $request)->values(),
            'stats' => $this->stats($definition['table']),
        ]);
    }

    public function create(Request $request): Response
    {
        $module = (string) $request->route('module');

        return inertia('admin/resource-form', [
            'definition' => $this->definition($module),
            'mode' => 'create',
            'record' => null,
        ]);
    }

    public function edit(Request $request): Response
    {
        $module = (string) $request->route('module');
        $id = (int) $request->route('id');
        $definition = $this->definition($module);

        return inertia('admin/resource-form', [
            'definition' => $definition,
            'mode' => 'edit',
            'record' => $this->record($definition['table'], $id),
        ]);
    }

    public function show(Request $request): Response
    {
        $module = (string) $request->route('module');
        $id = (int) $request->route('id');
        $definition = $this->definition($module);

        return inertia('admin/resource-show', [
            'definition' => $definition,
            'record' => $this->record($definition['table'], $id),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function definition(string $module): array
    {
        abort_unless(isset($this->modules[$module]), 404);

        return [
            'key' => $module,
            ...$this->modules[$module],
        ];
    }

    private function tableExists(string $table): bool
    {
        return Schema::hasTable($table);
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function search(Builder $query, Request $request, array $definition, array $columns): Builder
    {
        $search = $request->string('search')->trim()->toString();

        if ($search === '') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($columns, $search): void {
            foreach ($columns as $column) {
                $query->orWhere($column, 'like', "%{$search}%");
            }
        });
    }

    private function rows(string $module, Request $request): Collection
    {
        $definition = $this->definition($module);

        if (! $this->tableExists($definition['table'])) {
            return collect();
        }

        return match ($module) {
            'products' => $this->products($request),
            'product-variants', 'stock' => $this->variants($request),
            'categories' => $this->categories($request),
            'collections' => $this->collections($request),
            'stock-logs' => $this->stockLogs($request),
            'orders' => $this->orders($request),
            'payments' => $this->payments($request),
            'payment-logs' => $this->paymentLogs($request),
            'shipments' => $this->shipments($request),
            'customers' => $this->customers($request),
            'customer-addresses' => $this->simpleRows('customer_addresses', $request, ['recipient_name', 'recipient_phone', 'city', 'district']),
            'notifications' => $this->notifications($request),
            default => $this->simpleRows($definition['table'], $request, $this->searchableColumns($definition['table'])),
        };
    }

    private function products(Request $request): Collection
    {
        $query = DB::table('products')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->leftJoin('collections', 'collections.id', '=', 'products.collection_id')
            ->select([
                'products.id',
                'products.name',
                'products.sku',
                'products.base_price',
                'products.sale_price',
                'products.status',
                'products.is_featured',
                'products.is_new_arrival',
                'products.is_best_seller',
                'products.created_at',
                DB::raw('categories.name as category'),
                DB::raw('collections.name as collection'),
                DB::raw('(select coalesce(sum(stock), 0) from product_variants where product_variants.product_id = products.id and product_variants.deleted_at is null) as stock'),
            ])
            ->whereNull('products.deleted_at')
            ->latest('products.created_at');

        return $this->search($query, $request, $this->definition('products'), ['products.name', 'products.sku'])->limit(50)->get();
    }

    private function variants(Request $request): Collection
    {
        $query = DB::table('product_variants')
            ->leftJoin('products', 'products.id', '=', 'product_variants.product_id')
            ->select([
                'product_variants.id',
                'product_variants.sku',
                'product_variants.color_name',
                'product_variants.size',
                'product_variants.stock',
                'product_variants.reserved_stock',
                'product_variants.is_active',
                DB::raw('products.name as product'),
                DB::raw('(product_variants.stock - product_variants.reserved_stock) as available_stock'),
            ])
            ->whereNull('product_variants.deleted_at')
            ->orderBy('products.name');

        return $this->search($query, $request, $this->definition('product-variants'), ['product_variants.sku', 'products.name'])->limit(50)->get();
    }

    private function categories(Request $request): Collection
    {
        $query = DB::table('categories')
            ->select([
                'categories.id',
                'categories.name',
                'categories.slug',
                'categories.is_active',
                'categories.created_at',
                DB::raw('(select count(*) from products where products.category_id = categories.id and products.deleted_at is null) as products_count'),
            ])
            ->whereNull('categories.deleted_at')
            ->latest('categories.created_at');

        return $this->search($query, $request, $this->definition('categories'), ['categories.name', 'categories.slug'])->limit(50)->get();
    }

    private function collections(Request $request): Collection
    {
        $query = DB::table('collections')
            ->select([
                'collections.id',
                'collections.name',
                'collections.slug',
                'collections.is_featured',
                'collections.is_active',
                'collections.created_at',
                DB::raw('(select count(*) from products where products.collection_id = collections.id and products.deleted_at is null) as products_count'),
            ])
            ->whereNull('collections.deleted_at')
            ->latest('collections.created_at');

        return $this->search($query, $request, $this->definition('collections'), ['collections.name', 'collections.slug'])->limit(50)->get();
    }

    private function stockLogs(Request $request): Collection
    {
        $query = DB::table('stock_logs')
            ->leftJoin('product_variants', 'product_variants.id', '=', 'stock_logs.product_variant_id')
            ->select([
                'stock_logs.id',
                DB::raw('product_variants.sku as variant'),
                'stock_logs.type',
                'stock_logs.quantity',
                'stock_logs.stock_before',
                'stock_logs.stock_after',
                'stock_logs.created_at',
                DB::raw("concat(coalesce(stock_logs.reference_type, '-'), '#', coalesce(stock_logs.reference_id, '-')) as reference"),
            ])
            ->latest('stock_logs.created_at');

        return $this->search($query, $request, $this->definition('stock-logs'), ['product_variants.sku', 'stock_logs.type'])->limit(50)->get();
    }

    private function orders(Request $request): Collection
    {
        $query = DB::table('orders')
            ->select(['id', 'order_number', 'customer_name', 'customer_email', 'grand_total', 'payment_status', 'order_status', 'shipping_status', 'created_at'])
            ->latest('created_at');

        return $this->search($query, $request, $this->definition('orders'), ['order_number', 'customer_name', 'customer_email'])->limit(50)->get();
    }

    private function payments(Request $request): Collection
    {
        $query = DB::table('payments')
            ->leftJoin('orders', 'orders.id', '=', 'payments.order_id')
            ->select([
                'payments.id',
                'payments.midtrans_order_id',
                'payments.payment_method',
                'payments.gross_amount',
                'payments.transaction_status',
                'payments.fraud_status',
                'payments.paid_at',
                DB::raw('orders.order_number as order_number'),
            ])
            ->latest('payments.created_at');

        return $this->search($query, $request, $this->definition('payments'), ['orders.order_number', 'payments.midtrans_order_id', 'payments.midtrans_transaction_id'])->limit(50)->get();
    }

    private function paymentLogs(Request $request): Collection
    {
        $query = DB::table('payment_logs')
            ->leftJoin('orders', 'orders.id', '=', 'payment_logs.order_id')
            ->select([
                'payment_logs.id',
                'payment_logs.provider',
                'payment_logs.event_type',
                'payment_logs.transaction_status',
                'payment_logs.processed_at',
                'payment_logs.created_at',
                DB::raw('orders.order_number as order_number'),
            ])
            ->latest('payment_logs.created_at');

        return $this->search($query, $request, $this->definition('payment-logs'), ['orders.order_number', 'payment_logs.event_type'])->limit(50)->get();
    }

    private function shipments(Request $request): Collection
    {
        $query = DB::table('shipments')
            ->leftJoin('orders', 'orders.id', '=', 'shipments.order_id')
            ->select([
                'shipments.id',
                'shipments.waybill_id',
                'shipments.courier_company',
                'shipments.courier_type',
                'shipments.courier_service_name',
                'shipments.shipping_status',
                'shipments.estimated_delivery',
                'shipments.shipped_at',
                'shipments.delivered_at',
                DB::raw('orders.order_number as order_number'),
            ])
            ->latest('shipments.created_at');

        return $this->search($query, $request, $this->definition('shipments'), ['orders.order_number', 'shipments.waybill_id', 'shipments.courier_company'])->limit(50)->get();
    }

    private function customers(Request $request): Collection
    {
        $query = DB::table('users')
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.is_active',
                'users.created_at',
                DB::raw('(select count(*) from orders where orders.user_id = users.id) as orders_count'),
            ])
            ->where('users.role', 'customer')
            ->whereNull('users.deleted_at')
            ->latest('users.created_at');

        return $this->search($query, $request, $this->definition('customers'), ['users.name', 'users.email', 'users.phone'])->limit(50)->get();
    }

    private function notifications(Request $request): Collection
    {
        $query = DB::table('notifications')
            ->leftJoin('users', 'users.id', '=', 'notifications.user_id')
            ->select([
                'notifications.id',
                'notifications.title',
                'notifications.type',
                'notifications.is_read',
                'notifications.created_at',
                DB::raw('users.name as user'),
            ])
            ->latest('notifications.created_at');

        return $this->search($query, $request, $this->definition('notifications'), ['notifications.title', 'notifications.type', 'users.name'])->limit(50)->get();
    }

    private function simpleRows(string $table, Request $request, array $searchable): Collection
    {
        $query = DB::table($table)->latest($this->hasColumn($table, 'created_at') ? 'created_at' : 'id');

        if ($this->hasColumn($table, 'deleted_at')) {
            $query->whereNull('deleted_at');
        }

        return $this->search($query, $request, ['table' => $table], $searchable)->limit(50)->get();
    }

    private function record(string $table, int $id): ?object
    {
        if (! $this->tableExists($table)) {
            return null;
        }

        return DB::table($table)->where('id', $id)->first();
    }

    /**
     * @return array<string, int>
     */
    private function stats(string $table): array
    {
        if (! $this->tableExists($table)) {
            return ['total' => 0, 'active' => 0, 'inactive' => 0];
        }

        $query = DB::table($table);

        if ($this->hasColumn($table, 'deleted_at')) {
            $query->whereNull('deleted_at');
        }

        $total = (clone $query)->count();
        $active = $this->hasColumn($table, 'is_active') ? (clone $query)->where('is_active', true)->count() : 0;
        $inactive = $this->hasColumn($table, 'is_active') ? (clone $query)->where('is_active', false)->count() : 0;

        return compact('total', 'active', 'inactive');
    }

    private function hasColumn(string $table, string $column): bool
    {
        return $this->tableExists($table) && Schema::hasColumn($table, $column);
    }

    private function searchableColumns(string $table): array
    {
        return collect(['name', 'title', 'slug', 'code', 'key', 'type', 'placement'])
            ->filter(fn (string $column): bool => $this->hasColumn($table, $column))
            ->values()
            ->all();
    }
}
