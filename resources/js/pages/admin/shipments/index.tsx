import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    MoreVertical,
    PackageCheck,
    RefreshCw,
    RotateCcw,
    Search,
    Truck,
    XCircle,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Paginated } from '@/pages/admin/sales/shared';
import { formatPrice } from '@/pages/admin/sales/shared';

type Shipment = {
    id: number;
    order_number: string | null;
    customer: string | null;
    waybill_id: string | null;
    courier_company: string;
    courier_type: string;
    courier_service_name: string | null;
    shipping_cost: string;
    shipping_status: string;
    estimated_delivery: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
};

type Props = {
    shipments: Paginated<Shipment>;
    filters: Record<string, string>;
    shippingStatuses: string[];
};

const getStatusConfig = (status: string | null) => {
    const safeStatus = status ?? 'unknown';
    const s = safeStatus.toLowerCase();

    if (['delivered', 'completed'].includes(s)) {
        return {
            label: safeStatus.replace(/_/g, ' '),
            dot: 'bg-emerald-400',
            text: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-100',
        };
    }

    if (['pending', 'ready_to_ship', 'confirmed'].includes(s)) {
        return {
            label: safeStatus.replace(/_/g, ' '),
            dot: 'bg-amber-400',
            text: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-100',
        };
    }

    if (['shipped', 'in_transit', 'on_hold'].includes(s)) {
        return {
            label: safeStatus.replace(/_/g, ' '),
            dot: 'bg-blue-400',
            text: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-100',
        };
    }

    if (['failed', 'cancelled', 'returned', 'lost'].includes(s)) {
        return {
            label: safeStatus.replace(/_/g, ' '),
            dot: 'bg-rose-400',
            text: 'text-rose-700',
            bg: 'bg-rose-50 border-rose-100',
        };
    }

    return {
        label: safeStatus.replace(/_/g, ' '),
        dot: 'bg-zinc-400',
        text: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
    };
};

const formatDate = (value: string | null) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export default function ShipmentsIndex({
    shipments,
    filters,
    shippingStatuses,
}: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        courier_company: filters.courier_company ?? '',
        courier_type: filters.courier_type ?? '',
        shipping_status: filters.shipping_status ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/shipments', { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        router.get('/admin/shipments', {}, { preserveState: false });
    };

    const deliveredCount = shipments.data.filter((shipment) =>
        ['delivered', 'completed'].includes(
            shipment.shipping_status.toLowerCase(),
        ),
    ).length;
    const pendingCount = shipments.data.filter((shipment) =>
        ['pending', 'ready_to_ship', 'confirmed'].includes(
            shipment.shipping_status.toLowerCase(),
        ),
    ).length;
    const transitCount = shipments.data.filter((shipment) =>
        ['shipped', 'in_transit', 'on_hold'].includes(
            shipment.shipping_status.toLowerCase(),
        ),
    ).length;
    const failedCount = shipments.data.filter((shipment) =>
        ['failed', 'cancelled', 'returned', 'lost'].includes(
            shipment.shipping_status.toLowerCase(),
        ),
    ).length;
    const trackedCount = shipments.data.filter(
        (shipment) => shipment.waybill_id,
    ).length;

    const stats = [
        {
            title: 'Total Shipments',
            val: shipments.total,
            sub: 'all deliveries',
            icon: Truck,
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
            title: 'Delivered',
            val: deliveredCount,
            sub: 'received by customer',
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
            title: 'Pending',
            val: pendingCount,
            sub: 'awaiting dispatch',
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
            title: 'In Transit',
            val: transitCount,
            sub: 'on delivery route',
            icon: Truck,
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
            title: 'Tracked',
            val: trackedCount,
            sub: 'has waybill',
            icon: PackageCheck,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-purple-500',
            titleColor: 'text-zinc-700',
            accent: 'from-purple-400 to-purple-600',
            featured: false,
        },
        {
            title: 'Failed',
            val: failedCount,
            sub: 'returned/lost',
            icon: XCircle,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-rose-500',
            titleColor: 'text-zinc-700',
            accent: 'from-rose-400 to-red-500',
            featured: false,
        },
    ];

    return (
        <>
            <Head title="Shipments" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#422d25]/50 uppercase">
                            Sales Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Shipments
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Pantau pengiriman Biteship, waybill, biaya,
                            estimasi, dan tracking status.
                        </p>
                    </div>
                </div>

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

                <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                    <form
                        onSubmit={submit}
                        className="flex flex-wrap items-end gap-3 border-b border-zinc-100 bg-zinc-50/40 px-5 py-4"
                    >
                        <FilterSelect
                            label="Status"
                            value={data.shipping_status || 'all'}
                            onChange={(value) =>
                                setData(
                                    'shipping_status',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectItem value="all">All Status</SelectItem>
                            {shippingStatuses.map((status) => (
                                <SelectItem
                                    key={status}
                                    value={status}
                                    className="capitalize"
                                >
                                    {status.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <div className="relative min-w-[220px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Search order/waybill..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="px-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Courier
                            </span>
                            <div className="flex gap-2">
                                <Input
                                    value={data.courier_company}
                                    onChange={(event) =>
                                        setData(
                                            'courier_company',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Company"
                                    className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                                <Input
                                    value={data.courier_type}
                                    onChange={(event) =>
                                        setData(
                                            'courier_type',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Type"
                                    className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="px-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Dates
                            </span>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={data.date_from}
                                    onChange={(event) =>
                                        setData('date_from', event.target.value)
                                    }
                                    className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                                <Input
                                    type="date"
                                    value={data.date_to}
                                    onChange={(event) =>
                                        setData('date_to', event.target.value)
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
                                disabled={processing}
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Waybill
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Courier
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Cost
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Dates
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {shipments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <Truck className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No shipments found. Try
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

                                {shipments.data.map((shipment) => {
                                    const statusConfig = getStatusConfig(
                                        shipment.shipping_status,
                                    );

                                    return (
                                        <tr
                                            key={shipment.id}
                                            className="transition-colors hover:bg-zinc-50/70"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        href={`/admin/shipments/${shipment.id}`}
                                                        className="font-medium text-zinc-900 transition-colors hover:text-[#422d25]"
                                                    >
                                                        {shipment.order_number ?? '-'}
                                                    </Link>
                                                    <span className="text-xs text-zinc-500">
                                                        {shipment.customer ?? '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-zinc-900">
                                                        {shipment.waybill_id ?? '-'}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        ETA:{' '}
                                                        {shipment.estimated_delivery ??
                                                            '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium capitalize text-zinc-700">
                                                        {shipment.courier_company}{' '}
                                                        {shipment.courier_type}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {shipment.courier_service_name ??
                                                            '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 font-semibold text-zinc-900">
                                                {formatPrice(
                                                    shipment.shipping_cost,
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={
                                                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ' +
                                                        statusConfig.text +
                                                        ' ' +
                                                        statusConfig.bg
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'h-1.5 w-1.5 rounded-full ' +
                                                            statusConfig.dot
                                                        }
                                                    />
                                                    {statusConfig.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs whitespace-nowrap text-zinc-500">
                                                        Shipped:{' '}
                                                        {formatDate(
                                                            shipment.shipped_at,
                                                        )}
                                                    </span>
                                                    <span className="text-xs whitespace-nowrap text-zinc-500">
                                                        Delivered:{' '}
                                                        {formatDate(
                                                            shipment.delivered_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
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
                                                        className="w-44"
                                                    >
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/admin/shipments/${shipment.id}`}
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/admin/shipments/${shipment.id}/refresh-tracking`}
                                                                method="post"
                                                                as="button"
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <RefreshCw className="h-3.5 w-3.5" />
                                                                Track Shipment
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

                    <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/40 px-5 py-3.5">
                        <span className="text-xs text-zinc-400">
                            {shipments.from && shipments.to
                                ? 'Showing ' +
                                  shipments.from +
                                  '-' +
                                  shipments.to +
                                  ' of ' +
                                  shipments.total +
                                  ' shipments'
                                : 'No shipments'}
                        </span>
                        <div className="flex items-center gap-1">
                            {shipments.links.map((link, i) => {
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
    children: ReactNode;
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
