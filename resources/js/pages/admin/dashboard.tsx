import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    Box,
    CreditCard,
    Eye,
    Search,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import {
    Area,
    AreaChart,
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
import {
    formatPrice,
    PageHeader,
    TableShell,
} from '@/pages/admin/catalog/shared';
import { StatusBadge } from '@/pages/admin/sales/shared';

type SummaryItem = {
    label: string;
    value: number;
    format: 'currency' | 'number';
};

type ChartPoint = { date: string; revenue: number; orders: number };
type DistributionPoint = { label: string; value: number };

type RecentOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    grand_total: number;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    created_at: string;
};

type LowStockVariant = {
    id: number;
    product_name: string | null;
    sku: string;
    color_name: string | null;
    size: string | null;
    stock: number;
    reserved_stock: number;
    available_stock: number;
};

type PaymentLog = {
    id: number;
    order_number: string | null;
    provider: string;
    event_type: string | null;
    transaction_status: string | null;
    created_at: string | null;
};

type Shipment = {
    id: number;
    order_number: string | null;
    waybill_id: string | null;
    courier_company: string;
    courier_type: string;
    shipping_status: string;
    updated_at: string | null;
};

type Props = {
    filters: { range: string; date_from: string; date_to: string };
    range: { label: string; start: string; end: string };
    summary: SummaryItem[];
    salesChart: ChartPoint[];
    orderStatusChart: DistributionPoint[];
    paymentStatusChart: DistributionPoint[];
    recentOrders: RecentOrder[];
    lowStockVariants: LowStockVariant[];
    latestPaymentLogs: PaymentLog[];
    latestShipments: Shipment[];
};

const ranges = [
    ['today', 'Today'],
    ['7d', 'Last 7 Days'],
    ['30d', 'Last 30 Days'],
    ['month', 'This Month'],
    ['custom', 'Custom Range'],
];

function formatMetric(item: SummaryItem) {
    return item.format === 'currency'
        ? formatPrice(item.value)
        : new Intl.NumberFormat('id-ID').format(item.value);
}

function metricIcon(label: string) {
    const normalized = label.toLowerCase();

    if (normalized.includes('customer')) {
        return Users;
    }

    if (normalized.includes('stock') || normalized.includes('product')) {
        return Box;
    }

    if (normalized.includes('payment')) {
        return CreditCard;
    }

    if (normalized.includes('revenue') || normalized.includes('sales')) {
        return TrendingUp;
    }

    return ShoppingCart;
}

function sumValues(data: DistributionPoint[]) {
    return data.reduce((total, item) => total + item.value, 0);
}

function successRate(data: DistributionPoint[]) {
    const total = sumValues(data);

    if (total === 0) {
        return 0;
    }

    const success = data
        .filter((item) =>
            ['paid', 'completed', 'delivered', 'settlement', 'capture'].some(
                (keyword) => item.label.toLowerCase().includes(keyword),
            ),
        )
        .reduce((total, item) => total + item.value, 0);

    return Math.round((success / total) * 100);
}

export default function AdminDashboard({
    filters,
    range,
    summary,
    salesChart,
    orderStatusChart,
    paymentStatusChart,
    recentOrders,
    lowStockVariants,
    latestPaymentLogs,
    latestShipments,
}: Props) {
    const { data, setData, get, processing } = useForm({
        range: filters.range,
        date_from: filters.date_from,
        date_to: filters.date_to,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/dashboard', { preserveState: true, replace: true });
    };

    const orderRate = successRate(orderStatusChart);

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <PageHeader
                        eyebrow="Dashboard Overview"
                        title="Store health overview"
                        description={`Revenue, order status, stock risk, payment logs, and shipment status for ${range.label}.`}
                    />

                    <form
                        onSubmit={submit}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[170px_160px_160px_auto]"
                    >
                        <select
                            value={data.range}
                            onChange={(event) =>
                                setData('range', event.target.value)
                            }
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            {ranges.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <Input
                            type="date"
                            value={data.date_from}
                            onChange={(event) =>
                                setData('date_from', event.target.value)
                            }
                            disabled={data.range !== 'custom'}
                            className="h-10 rounded-lg border-gray-300 bg-white text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
                        />
                        <Input
                            type="date"
                            value={data.date_to}
                            onChange={(event) =>
                                setData('date_to', event.target.value)
                            }
                            disabled={data.range !== 'custom'}
                            className="h-10 rounded-lg border-gray-300 bg-white text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
                        />
                        <Button
                            type="submit"
                            disabled={processing}
                            variant="outline"
                            className="h-10 rounded-lg border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <Search className="size-4" /> Apply
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-12 gap-4 md:gap-6">
                    <div className="col-span-12 space-y-6 xl:col-span-7">
                        <MetricsGrid summary={summary} />
                        <MonthlySalesChart salesChart={salesChart} />
                    </div>

                    <div className="col-span-12 xl:col-span-5">
                        <MonthlyTarget
                            range={range.label}
                            percentage={orderRate}
                            orderTotal={sumValues(orderStatusChart)}
                            paymentTotal={sumValues(paymentStatusChart)}
                        />
                    </div>

                    <div className="col-span-12">
                        <StatisticsChart
                            range={range.label}
                            salesChart={salesChart}
                        />
                    </div>

                    <div className="col-span-12 xl:col-span-5">
                        <StatusOverview
                            orderStatusChart={orderStatusChart}
                            paymentStatusChart={paymentStatusChart}
                        />
                    </div>

                    <div className="col-span-12 xl:col-span-7">
                        <RecentOrders recentOrders={recentOrders} />
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <SimpleTable
                        title="Low Stock Products"
                        description="Variants with available stock <= 5"
                        columns={[
                            'product_name',
                            'sku',
                            'color_name',
                            'size',
                            'stock',
                            'reserved_stock',
                            'available_stock',
                        ]}
                        rows={lowStockVariants}
                    />
                    <SimpleTable
                        title="Latest Payment Logs"
                        description="Recent Midtrans webhook logs"
                        columns={[
                            'order_number',
                            'provider',
                            'event_type',
                            'transaction_status',
                            'created_at',
                        ]}
                        rows={latestPaymentLogs}
                    />
                    <SimpleTable
                        title="Latest Shipment Status"
                        description="Recent shipment updates"
                        columns={[
                            'order_number',
                            'waybill_id',
                            'courier_company',
                            'courier_type',
                            'shipping_status',
                            'updated_at',
                        ]}
                        rows={latestShipments}
                    />
                </div>
            </div>
        </>
    );
}

function MetricsGrid({ summary }: { summary: SummaryItem[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {summary.map((item, index) => {
                const Icon = metricIcon(item.label);
                const isPositive = index % 2 === 0;

                return (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                            <Icon className="size-6 text-gray-800 dark:text-white/90" />
                        </div>

                        <div className="mt-5 flex items-end justify-between gap-4">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.label}
                                </span>
                                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                                    {formatMetric(item)}
                                </h4>
                            </div>

                            <BadgeTone tone={isPositive ? 'success' : 'error'}>
                                {isPositive ? (
                                    <ArrowUp className="size-3" />
                                ) : (
                                    <ArrowDown className="size-3" />
                                )}
                                Live
                            </BadgeTone>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthlySalesChart({ salesChart }: { salesChart: ChartPoint[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Monthly Sales
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Paid revenue by paid date
                    </p>
                </div>
                <MoreButton />
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={salesChart}>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-gray-200 dark:stroke-gray-800"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `${Number(value) / 1000000}M`
                                }
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <Tooltip
                                formatter={(value) =>
                                    formatPrice(Number(value))
                                }
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#465FFF"
                                radius={[5, 5, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function MonthlyTarget({
    range,
    percentage,
    orderTotal,
    paymentTotal,
}: {
    range: string;
    percentage: number;
    orderTotal: number;
    paymentTotal: number;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="rounded-2xl bg-white px-5 pt-5 pb-11 shadow-sm dark:bg-gray-900 sm:px-6 sm:pt-6">
                <div className="flex justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Monthly Target
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Target for {range}
                        </p>
                    </div>
                    <MoreButton />
                </div>

                <div className="relative mx-auto mt-8 flex size-[260px] items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `conic-gradient(#465FFF ${percentage * 3.6}deg, transparent 0deg)`,
                        }}
                    />
                    <div className="relative flex size-[210px] flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                        <span className="text-4xl font-semibold text-gray-800 dark:text-white/90">
                            {percentage}%
                        </span>
                    </div>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[95%] rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-500">
                        +10%
                    </span>
                </div>

                <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                    {orderTotal} orders tracked. Payment event count currently
                    at {paymentTotal}.
                </p>
            </div>

            <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
                <TargetMetric label="Target" value={`${orderTotal}`} trend="down" />
                <Divider />
                <TargetMetric
                    label="Revenue"
                    value={`${paymentTotal}`}
                    trend="up"
                />
                <Divider />
                <TargetMetric label="Today" value={`${percentage}%`} trend="up" />
            </div>
        </div>
    );
}

function StatisticsChart({
    range,
    salesChart,
}: {
    range: string;
    salesChart: ChartPoint[];
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Statistics
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Revenue and orders for {range}
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                    {['Revenue', 'Orders'].map((label) => (
                        <button
                            key={label}
                            type="button"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1000px] xl:min-w-full">
                    <ResponsiveContainer width="100%" height={310}>
                        <AreaChart data={salesChart}>
                            <defs>
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#465FFF"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#465FFF"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-gray-200 dark:stroke-gray-800"
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `${Number(value) / 1000000}M`
                                }
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'revenue'
                                        ? formatPrice(Number(value))
                                        : value,
                                    name === 'revenue' ? 'Revenue' : 'Orders',
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#465FFF"
                                fill="url(#revenueGradient)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="orders"
                                stroke="#9CB9FF"
                                fill="transparent"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatusOverview({
    orderStatusChart,
    paymentStatusChart,
}: {
    orderStatusChart: DistributionPoint[];
    paymentStatusChart: DistributionPoint[];
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="flex justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Status Overview
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Order and payment distribution
                    </p>
                </div>
                <BarChart3 className="size-6 text-gray-400" />
            </div>

            <div className="mt-6 space-y-6">
                <StatusList title="Order Status" data={orderStatusChart} />
                <StatusList title="Payment Status" data={paymentStatusChart} />
            </div>
        </div>
    );
}

function RecentOrders({ recentOrders }: { recentOrders: RecentOrder[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-3 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Orders
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        10 order terbaru
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        Filter
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-lg border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <Link href="/admin/orders">See all</Link>
                    </Button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-y border-gray-100 dark:border-gray-800">
                        <tr className="text-left">
                            {[
                                'Order',
                                'Customer',
                                'Total',
                                'Payment',
                                'Order',
                                'Shipping',
                                'Action',
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="py-3 pr-4 text-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white/90">
                                    {order.order_number}
                                </td>
                                <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                                    {order.customer_name}
                                </td>
                                <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">
                                    {formatPrice(order.grand_total)}
                                </td>
                                <td className="py-3 pr-4">
                                    <StatusBadge status={order.payment_status} />
                                </td>
                                <td className="py-3 pr-4">
                                    <StatusBadge status={order.order_status} />
                                </td>
                                <td className="py-3 pr-4">
                                    <StatusBadge status={order.shipping_status} />
                                </td>
                                <td className="py-3 text-right">
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="rounded-lg border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    >
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Eye className="size-4" /> View
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusList({
    title,
    data,
}: {
    title: string;
    data: DistributionPoint[];
}) {
    const total = sumValues(data);

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {title}
            </h4>
            {data.map((item) => {
                const percent =
                    total === 0 ? 0 : Math.round((item.value / total) * 100);

                return (
                    <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                    {item.label}
                                </p>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.value} records
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {percent}%
                            </p>
                        </div>
                        <div className="h-2 rounded-sm bg-gray-200 dark:bg-gray-800">
                            <div
                                className="h-2 rounded-sm bg-[#465FFF]"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TargetMetric({
    label,
    value,
    trend,
}: {
    label: string;
    value: string;
    trend: 'up' | 'down';
}) {
    return (
        <div>
            <p className="mb-1 text-center text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                {label}
            </p>
            <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
                {value}
                {trend === 'up' ? (
                    <ArrowUp className="size-4 text-emerald-600" />
                ) : (
                    <ArrowDown className="size-4 text-red-600" />
                )}
            </p>
        </div>
    );
}

function Divider() {
    return <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />;
}

function MoreButton() {
    return (
        <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-300"
            aria-label="More options"
        >
            <span className="text-xl leading-none">...</span>
        </button>
    );
}

function BadgeTone({
    tone,
    children,
}: {
    tone: 'success' | 'error';
    children: ReactNode;
}) {
    const className =
        tone === 'success'
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
        >
            {children}
        </span>
    );
}

function SimpleTable({
    title,
    description,
    columns,
    rows,
}: {
    title: string;
    description: string;
    columns: string[];
    rows: Record<string, unknown>[];
}) {
    return (
        <TableShell title={title} description={description}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-muted-foreground">
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    className="pr-4 pb-3 font-medium"
                                >
                                    {column.replaceAll('_', ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map((row, index) => (
                            <tr key={String(row.id ?? index)}>
                                {columns.map((column) => (
                                    <td key={column} className="py-3 pr-4">
                                        {String(row[column] ?? '-')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </TableShell>
    );
}
