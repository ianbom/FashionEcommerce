import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    Box,
    CalendarDays,
    PackageCheck,
    Shirt,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
});

type SummaryItem = {
    label: string;
    value: number;
    format: 'currency' | 'number';
};

type ChartPoint = { date: string; revenue: number; orders?: number };

type RecentOrder = {
    id?: number;
    user_id?: number | null;
    order_number: string;
    customer_name: string;
    grand_total: number;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    created_at?: string;
};

type LowStockVariant = {
    id?: number;
    product_id?: number | null;
    product_name: string | null;
    sku?: string;
    color_name?: string | null;
    size?: string | null;
    available_stock: number;
};

type AttentionOrder = {
    id: number;
    user_id?: number | null;
    order_number: string;
    customer_name: string;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    action: string;
};

type SummaryMetric = { label: string; value: number };

function summaryHref(label: string) {
    const normalized = label.toLowerCase();

    if (normalized.includes('payment')) {
        return '/admin/payments';
    }

    if (normalized.includes('shipment') || normalized.includes('delivery')) {
        return '/admin/shipments';
    }

    return '/admin/orders';
}

type Props = {
    filters: {
        date_from: string;
        date_to: string;
        range: string;
    };
    summary: SummaryItem[];
    salesChart: ChartPoint[];
    attentionOrders: AttentionOrder[];
    recentOrders: RecentOrder[];
    lowStockVariants: LowStockVariant[];
    paymentSummary: SummaryMetric[];
    shippingSummary: SummaryMetric[];
};

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

function formatCurrency(value: number) {
    return currencyFormatter.format(value).replace('IDR', 'Rp').trim();
}

function formatSummaryValue(item: SummaryItem) {
    return item.format === 'currency'
        ? formatCurrency(item.value)
        : new Intl.NumberFormat('id-ID').format(item.value);
}

function dashboardStats(summary: SummaryItem[]) {
    return summary.slice(0, 4).map((item, index) => ({
        href:
            [
                '/admin/reports/sales',
                '/admin/orders',
                '/admin/orders',
                '/admin/stock',
            ][index] ?? '/admin/dashboard',
        icon: [Banknote, ShoppingBag, Truck, Box][index] ?? PackageCheck,
        label: item.label,
        note:
            [
                '+12% from yesterday',
                '5 waiting to be processed',
                'Paid orders need shipment',
                'Need restock soon',
            ][index] ?? 'Needs review today',
        value: formatSummaryValue(item),
    }));
}

function badgeTone(value: string | null | undefined): BadgeTone {
    const normalized = (value ?? '').toLowerCase();

    if (
        ['paid', 'delivered', 'completed', 'shipped', 'in transit'].some(
            (status) => normalized.includes(status),
        )
    ) {
        return 'success';
    }

    if (
        ['pending', 'processing', 'waiting', 'need shipment'].some((status) =>
            normalized.includes(status),
        )
    ) {
        return 'warning';
    }

    if (
        ['failed', 'cancelled', 'expired', 'issue', 'return', 'critical'].some(
            (status) => normalized.includes(status),
        )
    ) {
        return 'danger';
    }

    if (normalized === '-') {
        return 'neutral';
    }

    return 'info';
}

export default function AdminDashboard({
    filters,
    summary,
    salesChart,
    attentionOrders,
    recentOrders,
    lowStockVariants,
    paymentSummary,
    shippingSummary,
}: Props) {
    return (
        <>
            <Head title="Dasbor Admin" />

            <main className="min-h-[100dvh] bg-white px-8 py-7 text-zinc-900">
                <div className="mx-auto flex max-w-7xl flex-col gap-8">
                    <DashboardHeader filters={filters} />
                    <StatCards stats={dashboardStats(summary)} />
                    <StatusSummary
                        paymentSummary={paymentSummary}
                        shippingSummary={shippingSummary}
                    />

                    <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)] gap-10 border-t border-zinc-200 pt-8">
                        <div className="flex min-w-0 flex-col gap-10">
                            <SalesTrendCard data={salesChart} />
                            <RecentOrdersTable
                                orders={recentOrders.slice(0, 5)}
                            />
                        </div>

                        <aside className="flex min-w-0 flex-col gap-10 border-l border-zinc-200 pl-8">
                            <OrdersNeedAttention orders={attentionOrders} />
                            <LowStockProductsCard
                                products={lowStockVariants.slice(0, 4)}
                            />
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function DashboardHeader({ filters }: { filters: Props['filters'] }) {
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            '/admin/dashboard',
            { date_from: dateFrom, date_to: dateTo, range: 'custom' },
            { preserveState: true, replace: true },
        );
    };

    const reset = () => router.get('/admin/dashboard', {}, { preserveState: false });

    return (
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-[#7F2020]/50 uppercase">
                    <Shirt className="size-4" strokeWidth={1.7} />
                    Modest Fashion Admin
                </p>
                <h1 className="font-serif text-4xl leading-tight text-zinc-900">
                    Dasbor
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
                    Pantau aktivitas toko hari ini dan tindakan penting.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
                    <label className="grid gap-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                        Tanggal Awal
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                            className="h-11 w-[165px] cursor-pointer rounded-lg border-zinc-200 bg-white px-3 text-sm shadow-none transition-colors hover:border-zinc-300 focus:border-[#7F2020] focus:ring-2 focus:ring-[#7F2020]/20"
                        />
                    </label>
                    <label className="grid gap-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                        Tanggal Akhir
                        <Input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(event) => setDateTo(event.target.value)}
                            className="h-11 w-[165px] cursor-pointer rounded-lg border-zinc-200 bg-white px-3 text-sm shadow-none transition-colors hover:border-zinc-300 focus:border-[#7F2020] focus:ring-2 focus:ring-[#7F2020]/20"
                        />
                    </label>
                    <Button
                        type="submit"
                        variant="outline"
                        className="h-9 rounded-lg border-zinc-200 bg-white px-4 text-zinc-600 shadow-none hover:bg-zinc-50 hover:text-zinc-800 active:scale-[0.98]"
                    >
                        <CalendarDays className="size-4" strokeWidth={1.7} />
                        Filter
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={reset}
                        className="h-9 rounded-lg px-4 text-zinc-500 shadow-none hover:bg-zinc-50 hover:text-zinc-800 active:scale-[0.98]"
                    >
                        Reset
                    </Button>
                </form>
                <Button
                    asChild
                    className="h-9 rounded-lg bg-[#7F2020] px-4 text-white shadow-none hover:bg-[#5F1717] active:scale-[0.98]"
                >
                    <Link href="/admin/orders">
                        View Orders
                        <ArrowRight className="size-4" strokeWidth={1.7} />
                    </Link>
                </Button>
            </div>
        </header>
    );
}

function StatCards({ stats }: { stats: ReturnType<typeof dashboardStats> }) {
    return (
        <section className="grid grid-cols-4 divide-x divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="block px-5 py-5 transition-colors hover:bg-zinc-50/70"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
                                <Icon className="size-5" strokeWidth={1.7} />
                            </div>
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-500">
                                Today
                            </span>
                        </div>
                        <p className="mt-5 text-sm font-semibold text-zinc-600">
                            {stat.label}
                        </p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                            {stat.value}
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                            {stat.note}
                        </p>
                    </Link>
                );
            })}
        </section>
    );
}

function StatusSummary({
    paymentSummary,
    shippingSummary,
}: {
    paymentSummary: SummaryMetric[];
    shippingSummary: SummaryMetric[];
}) {
    return (
        <section className="grid grid-cols-2 gap-8 border-b border-zinc-200 pb-6">
            <MiniSummaryCard
                icon={Banknote}
                items={paymentSummary}
                title="Payment Summary"
            />
            <MiniSummaryCard
                icon={Truck}
                items={shippingSummary}
                title="Shipping Summary"
            />
        </section>
    );
}

function MiniSummaryCard({
    icon: Icon,
    items,
    title,
}: {
    icon: typeof Banknote;
    items: SummaryMetric[];
    title: string;
}) {
    return (
        <article className="rounded-2xl border border-zinc-200 p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
                    <Icon className="size-4" strokeWidth={1.7} />
                </div>
                <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
            </div>
            <div className="grid grid-cols-4 divide-x divide-zinc-200 border-t border-zinc-200 pt-3">
                {items.map((item) => (
                    <Link
                        key={item.label}
                        href={summaryHref(item.label)}
                        className="block px-4 transition-colors first:pl-0 last:pr-0 hover:bg-zinc-50/70"
                    >
                        <p className="text-xs text-zinc-400">{item.label}</p>
                        <p className="mt-1 text-xl font-bold tracking-tight text-zinc-900">
                            {item.value}
                        </p>
                    </Link>
                ))}
            </div>
        </article>
    );
}

function SalesTrendCard({ data }: { data: ChartPoint[] }) {
    return (
        <section className="rounded-2xl border border-zinc-200 p-5">
            <SectionHeader
                subtitle="Revenue and orders from the last 7 days"
                title="Sales Trend"
            />

            <div className="mt-6 h-[310px] border-y border-zinc-200 bg-zinc-50/30 py-5">
                <ResponsiveContainer height="100%" width="100%">
                    <BarChart
                        data={data}
                        margin={{ left: 6, right: 8, top: 12 }}
                    >
                        <CartesianGrid
                            stroke="#f4f4f5"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            axisLine={false}
                            dataKey="date"
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            axisLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                            tickFormatter={(value) =>
                                `Rp ${Number(value) / 1000000}m`
                            }
                            tickLine={false}
                            width={76}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#ffffff',
                                border: '1px solid #e4e4e7',
                                borderRadius: 18,
                                boxShadow: '0 10px 20px -16px rgba(0,0,0,0.3)',
                                color: '#18181b',
                            }}
                            formatter={(value) => [
                                formatCurrency(Number(value)),
                                'Revenue',
                            ]}
                            labelStyle={{ color: '#71717a' }}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#7F2020"
                            radius={[12, 12, 4, 4]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

function OrdersNeedAttention({ orders }: { orders: AttentionOrder[] }) {
    return (
        <section className="rounded-2xl border border-zinc-200 p-5">
            <SectionHeader
                icon={AlertTriangle}
                subtitle="Admin actions with highest priority"
                title="Orders Need Attention"
            />

            <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="-mx-3 px-3 py-4 transition-colors hover:bg-zinc-50/70"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="text-sm font-semibold text-zinc-900 transition-colors hover:text-[#7F2020]"
                                >
                                    {order.order_number}
                                </Link>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Customer:{' '}
                                    {order.user_id ? (
                                        <Link
                                            href={`/admin/customers/${order.user_id}`}
                                            className="transition-colors hover:text-[#7F2020]"
                                        >
                                            {order.customer_name}
                                        </Link>
                                    ) : (
                                        order.customer_name
                                    )}
                                </p>
                            </div>
                            <StatusBadge label={order.payment_status} />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <StatusBadge label={order.shipping_status} />
                            <Button
                                asChild
                                variant="outline"
                                className="h-8 rounded-lg border-zinc-200 bg-white px-3 text-xs text-zinc-600 shadow-none hover:bg-zinc-50 active:scale-[0.98]"
                            >
                                <Link href={`/admin/orders/${order.id}`}>
                                    {order.action}
                                </Link>
                            </Button>
                        </div>
                    </article>
                ))}
                {orders.length === 0 && (
                    <p className="py-5 text-sm text-zinc-400">
                        No orders need action right now.
                    </p>
                )}
            </div>
        </section>
    );
}

function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
    return (
        <section className="rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between gap-4">
                <SectionHeader
                    subtitle="Latest activity from checkout"
                    title="Recent Orders"
                />
                <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-lg border-zinc-200 bg-white px-4 text-zinc-600 shadow-none hover:bg-zinc-50"
                >
                    <Link href="/admin/orders">Open Orders</Link>
                </Button>
            </div>

            <table className="mt-5 w-full border-y border-zinc-200 text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/70 text-xs tracking-wider text-zinc-500 uppercase">
                    <tr>
                        {[
                            'Order',
                            'Customer',
                            'Payment',
                            'Order Status',
                            'Shipping',
                            'Total',
                            'Date',
                        ].map((heading) => (
                            <th
                                key={heading}
                                className="py-4 pr-5 font-semibold first:pl-4"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                    {orders.map((order, index) => (
                        <tr
                            key={`${order.order_number}-${index}`}
                            className="transition-colors hover:bg-zinc-50/70"
                        >
                            <td className="py-4 pr-5 pl-4 font-semibold text-zinc-900">
                                {order.id ? (
                                    <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="transition-colors hover:text-[#7F2020]"
                                    >
                                        {order.order_number}
                                    </Link>
                                ) : (
                                    order.order_number
                                )}
                            </td>
                            <td className="py-4 pr-5 text-zinc-600">
                                {order.user_id ? (
                                    <Link
                                        href={`/admin/customers/${order.user_id}`}
                                        className="transition-colors hover:text-[#7F2020]"
                                    >
                                        {order.customer_name}
                                    </Link>
                                ) : (
                                    order.customer_name
                                )}
                            </td>
                            <td className="py-4 pr-5">
                                <StatusBadge label={order.payment_status} />
                            </td>
                            <td className="py-4 pr-5">
                                <StatusBadge label={order.order_status} />
                            </td>
                            <td className="py-4 pr-5">
                                <StatusBadge label={order.shipping_status} />
                            </td>
                            <td className="py-4 pr-5 font-semibold text-zinc-900">
                                {formatCurrency(order.grand_total)}
                            </td>
                            <td className="py-4 text-zinc-400">
                                {order.created_at ?? 'Today'}
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td
                                className="px-4 py-8 text-center text-sm text-zinc-400"
                                colSpan={7}
                            >
                                No recent orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
}

function LowStockProductsCard({ products }: { products: LowStockVariant[] }) {
    return (
        <section className="rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    icon={Box}
                    subtitle="Products that need restock soon"
                    title="Low Stock Products"
                />
                <Button
                    asChild
                    variant="outline"
                    className="h-9 rounded-lg border-zinc-200 bg-white px-4 text-zinc-600 shadow-none hover:bg-zinc-50"
                >
                    <Link href="/admin/stock">Manage Stock</Link>
                </Button>
            </div>

            <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
                {products.map((product, index) => {
                    const status = stockStatus(product.available_stock);

                    return (
                        <article
                            key={`${product.product_name}-${index}`}
                            className="-mx-3 flex items-center gap-4 px-3 py-4 transition-colors hover:bg-zinc-50/70"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
                                <PackageCheck
                                    className="size-5"
                                    strokeWidth={1.7}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                {product.product_id ? (
                                    <Link
                                        href={`/admin/products/${product.product_id}`}
                                        className="block truncate text-sm font-semibold text-zinc-900 transition-colors hover:text-[#7F2020]"
                                    >
                                        {product.product_name ??
                                            'Unnamed Product'}
                                    </Link>
                                ) : (
                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                        {product.product_name ??
                                            'Unnamed Product'}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-zinc-400">
                                    {[
                                        product.color_name,
                                        product.size && `Size ${product.size}`,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ') || 'Standard variant'}
                                </p>
                            </div>
                            <div className="text-right">
                                {product.id ? (
                                    <Link
                                        href={`/admin/product-variants/${product.id}/stock-adjustment`}
                                        className="text-sm font-semibold text-zinc-900 transition-colors hover:text-[#7F2020]"
                                    >
                                        Stock: {product.available_stock}
                                    </Link>
                                ) : (
                                    <p className="text-sm font-semibold text-zinc-900">
                                        Stock: {product.available_stock}
                                    </p>
                                )}
                                <div className="mt-1">
                                    <StatusBadge label={status} />
                                </div>
                            </div>
                        </article>
                    );
                })}
                {products.length === 0 && (
                    <p className="py-5 text-sm text-zinc-400">
                        No low stock products right now.
                    </p>
                )}
            </div>
        </section>
    );
}

function SectionHeader({
    icon: Icon,
    subtitle,
    title,
}: {
    icon?: typeof AlertTriangle;
    subtitle: string;
    title: string;
}) {
    return (
        <div>
            <div className="flex items-center gap-2">
                {Icon && (
                    <Icon className="size-4 text-[#7F2020]" strokeWidth={1.7} />
                )}
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                    {title}
                </h2>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
    );
}

function StatusBadge({ label }: { label: string }) {
    const tone = badgeTone(label);
    const toneClasses: Record<BadgeTone, string> = {
        danger: 'border-red-100 bg-red-50 text-red-600',
        info: 'border-blue-200 bg-blue-50 text-blue-700',
        neutral: 'border-zinc-200 bg-zinc-50 text-zinc-500',
        success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
        >
            {label}
        </span>
    );
}

function stockStatus(stock: number) {
    if (stock === 0) {
        return 'Out of Stock';
    }

    if (stock <= 1) {
        return 'Critical';
    }

    return 'Low Stock';
}

