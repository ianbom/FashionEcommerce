import { Head, Link, router } from '@inertiajs/react';
import {
    Ban,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    MoreVertical,
    Package,
    RotateCcw,
    Search,
    ShoppingBag,
    Truck,
    Upload,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    grand_total: string;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    courier: string | null;
    waybill_id: string | null;
    created_at: string | null;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search: string;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    courier: string;
    voucher_code: string;
    date_from: string;
    date_to: string;
}

interface Props {
    orders: PaginatedOrders;
    filters: Filters;
    options: {
        paymentStatuses: string[];
        orderStatuses: string[];
        shippingStatuses: string[];
    };
}

const fmt = (v: string | number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(Number(v))
        .replace('Rp', 'Rp ');

const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (
        [
            'paid',
            'completed',
            'settlement',
            'capture',
            'accept',
            'delivered',
        ].includes(s)
    ) {
        return {
            label: status.replace(/_/g, ' '),
            dot: 'bg-emerald-400',
            text: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-100',
        };
    }
    if (['pending', 'processing', 'ready_to_ship'].includes(s)) {
        return {
            label: status.replace(/_/g, ' '),
            dot: 'bg-amber-400',
            text: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-100',
        };
    }
    if (['shipped', 'shipping'].includes(s)) {
        return {
            label: status.replace(/_/g, ' '),
            dot: 'bg-blue-400',
            text: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-100',
        };
    }
    if (['cancelled', 'failed', 'expired', 'deny'].includes(s)) {
        return {
            label: status.replace(/_/g, ' '),
            dot: 'bg-rose-400',
            text: 'text-rose-700',
            bg: 'bg-rose-50 border-rose-100',
        };
    }
    return {
        label: status.replace(/_/g, ' '),
        dot: 'bg-zinc-400',
        text: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
    };
};

export default function OrdersIndex({ orders, filters, options }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/orders',
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );

    const resetFilters = () =>
        router.get('/admin/orders', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const newOrdersCount = orders.data.filter(
        (o) => o.order_status === 'pending',
    ).length;
    const processingCount = orders.data.filter(
        (o) => o.order_status === 'processing',
    ).length;
    const shippedCount = orders.data.filter(
        (o) => o.shipping_status === 'shipped',
    ).length;
    const completedCount = orders.data.filter(
        (o) => o.order_status === 'completed',
    ).length;
    const cancelledCount = orders.data.filter(
        (o) => o.order_status === 'cancelled',
    ).length;

    const stats = [
        {
            title: 'Total Orders',
            val: orders.total,
            sub: 'all time',
            icon: Package,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            cardBg: 'bg-gradient-to-br from-[#422d25] to-[#7a5c4e]',
            subColor: 'text-white/60',
            valColor: 'text-white',
            titleColor: 'text-white/80',
            accent: '',
            featured: true,
        },
        {
            title: 'New Orders',
            val: newOrdersCount,
            sub: 'needs attention',
            icon: Clock,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-amber-600',
            titleColor: 'text-zinc-700',
            accent: 'from-amber-400 to-amber-600',
            featured: false,
        },
        {
            title: 'Processing',
            val: processingCount,
            sub: 'being prepared',
            icon: Package,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-blue-500',
            titleColor: 'text-zinc-700',
            accent: '',
            featured: false,
        },
        {
            title: 'Shipped',
            val: shippedCount,
            sub: 'on the way',
            icon: Truck,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-purple-500',
            titleColor: 'text-zinc-700',
            accent: '',
            featured: false,
        },
        {
            title: 'Completed',
            val: completedCount,
            sub: 'delivered',
            icon: CheckCircle2,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-emerald-600',
            titleColor: 'text-zinc-700',
            accent: 'from-emerald-400 to-emerald-600',
            featured: false,
        },
        {
            title: 'Cancelled',
            val: cancelledCount,
            sub: 'failed/refunded',
            icon: Ban,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-red-500',
            titleColor: 'text-zinc-700',
            accent: 'from-red-400 to-rose-500',
            featured: false,
        },
    ];

    return (
        <>
            <Head title="Orders" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#422d25]/50 uppercase">
                            Sales Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Orders
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Pantau pesanan customer, status pembayaran, order
                            flow, pengiriman, dan voucher.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        >
                            <Download className="h-3.5 w-3.5" /> Export
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {stats.map((m, i) => (
                        <div
                            key={i}
                            className={[
                                'relative overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5',
                                m.featured
                                    ? 'border-transparent shadow-lg shadow-[#422d25]/20'
                                    : 'border-zinc-100 shadow-sm hover:shadow-md',
                                m.cardBg,
                            ].join(' ')}
                        >
                            {!m.featured && m.accent && (
                                <div
                                    className={
                                        'absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r ' +
                                        m.accent
                                    }
                                />
                            )}
                            {m.featured && (
                                <div className="absolute -top-5 -right-5 h-20 w-20 rounded-full bg-white/10" />
                            )}

                            <div className="flex flex-col gap-3 p-4">
                                <div className="flex items-center justify-between">
                                    <div
                                        className={
                                            'flex h-8 w-8 items-center justify-center rounded-xl ' +
                                            m.iconBg
                                        }
                                    >
                                        <m.icon
                                            className={'h-4 w-4 ' + m.iconColor}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className={
                                            'text-2xl leading-none font-bold tracking-tight ' +
                                            m.valColor
                                        }
                                    >
                                        {m.val}
                                    </div>
                                    <div
                                        className={
                                            'mt-1.5 text-[11px] font-semibold ' +
                                            m.titleColor
                                        }
                                    >
                                        {m.title}
                                    </div>
                                    <div
                                        className={
                                            'mt-0.5 text-[10px] ' + m.subColor
                                        }
                                    >
                                        {m.sub}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                    {/* Filter Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-wrap items-end gap-3 border-b border-zinc-100 bg-zinc-50/40 px-5 py-4"
                    >
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order/customer..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <FilterSelect
                            label="Payment"
                            value={filters.payment_status || 'all'}
                            onChange={(v) =>
                                applyFilter(
                                    'payment_status',
                                    v === 'all' ? '' : v,
                                )
                            }
                        >
                            <SelectItem value="all">
                                All Payment Status
                            </SelectItem>
                            {options.paymentStatuses.map((s) => (
                                <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Order"
                            value={filters.order_status || 'all'}
                            onChange={(v) =>
                                applyFilter(
                                    'order_status',
                                    v === 'all' ? '' : v,
                                )
                            }
                        >
                            <SelectItem value="all">
                                All Order Status
                            </SelectItem>
                            {options.orderStatuses.map((s) => (
                                <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Shipping"
                            value={filters.shipping_status || 'all'}
                            onChange={(v) =>
                                applyFilter(
                                    'shipping_status',
                                    v === 'all' ? '' : v,
                                )
                            }
                        >
                            <SelectItem value="all">
                                All Shipping Status
                            </SelectItem>
                            {options.shippingStatuses.map((s) => (
                                <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <div className="flex flex-col gap-1">
                            <span className="px-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Dates
                            </span>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) =>
                                        applyFilter('date_from', e.target.value)
                                    }
                                    className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) =>
                                        applyFilter('date_to', e.target.value)
                                    }
                                    className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="ml-auto flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 gap-1.5 bg-[#422d25] text-white hover:bg-[#34231d]"
                            >
                                <Search className="h-3.5 w-3.5" /> Search
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 gap-1.5 text-zinc-500 hover:text-zinc-700"
                                onClick={resetFilters}
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </Button>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Payment
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Order Status
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Shipping
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Date
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <ShoppingBag className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No orders found. Try
                                                    adjusting your filters.
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs"
                                                    onClick={resetFilters}
                                                >
                                                    <RotateCcw className="mr-1 h-3 w-3" />{' '}
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {orders.data.map((o) => {
                                    const payConfig = getStatusConfig(
                                        o.payment_status,
                                    );
                                    const ordConfig = getStatusConfig(
                                        o.order_status,
                                    );
                                    const shipConfig = getStatusConfig(
                                        o.shipping_status,
                                    );

                                    return (
                                        <tr
                                            key={o.id}
                                            className="transition-colors hover:bg-zinc-50/70"
                                        >
                                            <td className="px-4 py-3.5">
                                                <Link
                                                    href={
                                                        '/admin/orders/' + o.id
                                                    }
                                                    className="font-medium text-zinc-900 transition-colors hover:text-[#422d25]"
                                                >
                                                    {o.order_number}
                                                </Link>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-900">
                                                        {o.customer_name}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {o.customer_email}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 font-semibold text-zinc-900">
                                                {fmt(o.grand_total)}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={
                                                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ' +
                                                        payConfig.text +
                                                        ' ' +
                                                        payConfig.bg
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'h-1.5 w-1.5 rounded-full ' +
                                                            payConfig.dot
                                                        }
                                                    />
                                                    {payConfig.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={
                                                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ' +
                                                        ordConfig.text +
                                                        ' ' +
                                                        ordConfig.bg
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'h-1.5 w-1.5 rounded-full ' +
                                                            ordConfig.dot
                                                        }
                                                    />
                                                    {ordConfig.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={
                                                            'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ' +
                                                            shipConfig.text +
                                                            ' ' +
                                                            shipConfig.bg
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                'h-1.5 w-1.5 rounded-full ' +
                                                                shipConfig.dot
                                                            }
                                                        />
                                                        {shipConfig.label}
                                                    </span>
                                                    {(o.waybill_id ||
                                                        o.courier) && (
                                                        <span className="text-xs text-zinc-500">
                                                            {o.courier
                                                                ? o.courier.toUpperCase()
                                                                : ''}{' '}
                                                            {o.waybill_id}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="text-xs whitespace-nowrap text-zinc-500">
                                                    {o.created_at
                                                        ? new Date(
                                                              o.created_at,
                                                          ).toLocaleDateString(
                                                              'id-ID',
                                                              {
                                                                  day: '2-digit',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              },
                                                          )
                                                        : '-'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    '/admin/orders/' +
                                                                    o.id
                                                                }
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />{' '}
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/40 px-5 py-3.5">
                        <span className="text-xs text-zinc-400">
                            {orders.from && orders.to
                                ? 'Showing ' +
                                  orders.from +
                                  '-' +
                                  orders.to +
                                  ' of ' +
                                  orders.total +
                                  ' orders'
                                : 'No orders'}
                        </span>
                        <div className="flex items-center gap-1">
                            {orders.links.map((link, i) => {
                                const isChevronLeft =
                                    link.label.includes('Previous') ||
                                    link.label.includes('&laquo;');
                                const isChevronRight =
                                    link.label.includes('Next') ||
                                    link.label.includes('&raquo;');
                                const label = isChevronLeft ? (
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                ) : isChevronRight ? (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );

                                return (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        className={[
                                            'h-8 min-w-8 rounded-lg px-2.5 text-xs font-medium transition-colors',
                                            link.active
                                                ? 'bg-[#422d25] text-white shadow-sm'
                                                : !link.url
                                                  ? 'cursor-not-allowed text-zinc-300'
                                                  : 'text-zinc-500 hover:bg-zinc-100',
                                        ].join(' ')}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span className="px-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                {label}
            </span>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-9 w-[150px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>{children}</SelectContent>
            </Select>
        </div>
    );
}
