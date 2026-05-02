import { Head, Link, useForm } from '@inertiajs/react';
import { BarChart3, Eye, Search } from 'lucide-react';
import type { FormEvent } from 'react';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Dashboard Overview"
                    title="Store health overview"
                    description={`Revenue, order status, stock risk, payment logs, and shipment status for ${range.label}.`}
                />

                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[180px_180px_180px_auto]"
                >
                    <select
                        value={data.range}
                        onChange={(event) =>
                            setData('range', event.target.value)
                        }
                        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                    />
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            setData('date_to', event.target.value)
                        }
                        disabled={data.range !== 'custom'}
                    />
                    <Button
                        type="submit"
                        disabled={processing}
                        variant="outline"
                    >
                        <Search /> Apply
                    </Button>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summary.map((item) => (
                        <Card key={item.label}>
                            <CardHeader className="pb-2">
                                <CardDescription>{item.label}</CardDescription>
                                <CardTitle className="text-2xl">
                                    {formatMetric(item)}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Chart</CardTitle>
                            <CardDescription>
                                Paid revenue by paid date. Revenue excludes
                                unpaid orders.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={salesChart}>
                                    <defs>
                                        <linearGradient
                                            id="revenue"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3C3428"
                                                stopOpacity={0.25}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3C3428"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-border"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `${Number(value) / 1000000}M`
                                        }
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            name === 'revenue'
                                                ? formatPrice(Number(value))
                                                : value,
                                            name === 'revenue'
                                                ? 'Revenue'
                                                : 'Orders',
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3C3428"
                                        fill="url(#revenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6">
                        <StatusChart
                            title="Order Status"
                            data={orderStatusChart}
                        />
                        <StatusChart
                            title="Payment Status"
                            data={paymentStatusChart}
                        />
                    </div>
                </div>

                <TableShell
                    title="Recent Orders"
                    description="10 order terbaru"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pr-4 pb-3 font-medium">
                                        Order
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Total
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Payment
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Order
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Shipping
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="py-3 pr-4 font-medium">
                                            {order.order_number}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {order.customer_name}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {formatPrice(order.grand_total)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge
                                                status={order.payment_status}
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge
                                                status={order.order_status}
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge
                                                status={order.shipping_status}
                                            />
                                        </td>
                                        <td className="py-3 text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                >
                                                    <Eye /> View
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TableShell>

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

function StatusChart({
    title,
    data,
}: {
    title: string;
    data: DistributionPoint[];
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="size-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-border"
                        />
                        <XAxis dataKey="label" hide />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar
                            dataKey="value"
                            fill="#3C3428"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
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
