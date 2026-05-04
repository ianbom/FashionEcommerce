import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Home,
    MapPin,
    MoreVertical,
    RotateCcw,
    Search,
    Star,
    Trash2,
    Users,
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
import type { Paginated } from '@/pages/admin/marketing/shared';
import { PerPageSelect } from '../pagination';

type Address = {
    id: number;
    customer: string | null;
    customer_email: string | null;
    recipient_name: string;
    recipient_phone: string;
    label: string | null;
    province: string;
    city: string;
    postal_code: string;
    full_address: string;
    is_default: boolean;
    orders_count: number;
};

type Props = {
    addresses: Paginated<Address>;
    filters: Record<string, string>;
};

export default function CustomerAddressesIndex({ addresses, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        province: filters.province ?? '',
        city: filters.city ?? '',
        is_default: filters.is_default ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/customer-addresses', {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        router.get('/admin/customer-addresses', {}, { preserveState: false });
    };

    const defaultCount = addresses.data.filter(
        (address) => address.is_default,
    ).length;
    const linkedOrders = addresses.data.reduce(
        (total, address) => total + address.orders_count,
        0,
    );
    const uniqueCities = new Set(
        addresses.data.map((address) => address.city).filter(Boolean),
    ).size;
    const deletableCount = addresses.data.filter(
        (address) => address.orders_count === 0,
    ).length;

    const stats = [
        {
            title: 'Total Addresses',
            val: addresses.total,
            sub: 'saved addresses',
            icon: MapPin,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            cardBg: 'bg-gradient-to-br from-[#7F2020] to-[#B6574B]',
            subColor: 'text-white/60',
            valColor: 'text-white',
            titleColor: 'text-white/80',
            accent: '',
            featured: true,
        },
        {
            title: 'Default',
            val: defaultCount,
            sub: 'shown page',
            icon: Star,
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
            title: 'Cities',
            val: uniqueCities,
            sub: 'shown page',
            icon: Home,
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
            title: 'Linked Orders',
            val: linkedOrders,
            sub: 'shown page',
            icon: Users,
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
            title: 'Deletable',
            val: deletableCount,
            sub: 'no orders',
            icon: Trash2,
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
            <Head title="Customer Addresses" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            Customer Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Customer Addresses
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Cari alamat customer untuk kebutuhan customer
                            service tanpa mengubah snapshot order lama.
                        </p>
                    </div>
                </div>

                <StatsGrid stats={stats} />

                <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                    <form
                        onSubmit={submit}
                        className="flex flex-wrap items-end gap-3 border-b border-zinc-100 bg-zinc-50/40 px-5 py-4"
                    >
                        <FilterSelect
                            label="Default"
                            value={data.is_default || 'all'}
                            onChange={(value) =>
                                setData(
                                    'is_default',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectItem value="all">All Addresses</SelectItem>
                            <SelectItem value="yes">Default</SelectItem>
                            <SelectItem value="no">Non-default</SelectItem>
                        </FilterSelect>

                        <div className="relative min-w-[220px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Search customer, recipient, city..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="px-0.5 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Area
                            </span>
                            <div className="flex gap-2">
                                <Input
                                    value={data.province}
                                    onChange={(event) =>
                                        setData('province', event.target.value)
                                    }
                                    placeholder="Province"
                                    className="h-9 w-[140px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                                <Input
                                    value={data.city}
                                    onChange={(event) =>
                                        setData('city', event.target.value)
                                    }
                                    placeholder="City"
                                    className="h-9 w-[140px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="ml-auto flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 gap-1.5 bg-[#7F2020] text-white hover:bg-[#5F1717]"
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
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Recipient
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Area
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Default
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Orders
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {addresses.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <MapPin className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No addresses found. Try
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

                                {addresses.data.map((address) => (
                                    <tr
                                        key={address.id}
                                        className="transition-colors hover:bg-zinc-50/70"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <Link
                                                    href={`/admin/customer-addresses/${address.id}`}
                                                    className="font-medium text-zinc-900 transition-colors hover:text-[#7F2020]"
                                                >
                                                    {address.customer ?? '-'}
                                                </Link>
                                                <span className="text-xs text-zinc-500">
                                                    {address.customer_email ??
                                                        '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-zinc-900">
                                                    {address.recipient_name}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                    {address.recipient_phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-zinc-700">
                                                    {address.city},{' '}
                                                    {address.province}
                                                </span>
                                                <span
                                                    className="max-w-[260px] truncate text-xs text-zinc-500"
                                                    title={address.full_address}
                                                >
                                                    {address.label
                                                        ? address.label + ' · '
                                                        : ''}
                                                    {address.postal_code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {address.is_default ? (
                                                <StatusPill
                                                    label="Default"
                                                    tone="amber"
                                                />
                                            ) : (
                                                <span className="text-xs text-zinc-300">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-zinc-900">
                                            {address.orders_count}
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
                                                            href={`/admin/customer-addresses/${address.id}`}
                                                            className="flex w-full items-center gap-2"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />{' '}
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/admin/customer-addresses/${address.id}/edit`}
                                                            className="flex w-full items-center gap-2"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />{' '}
                                                            Edit Address
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {address.orders_count ===
                                                    0 ? (
                                                        <DropdownMenuItem
                                                            asChild
                                                            className="text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                                                        >
                                                            <Link
                                                                href={`/admin/customer-addresses/${address.id}`}
                                                                method="delete"
                                                                as="button"
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />{' '}
                                                                Delete Address
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <PaginationFooter paginator={addresses} label="addresses" />
                </div>
            </div>
        </>
    );
}

function StatsGrid({ stats }: { stats: Array<Record<string, any>> }) {
    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {stats.map((m, i) => (
                <div
                    key={i}
                    className={[
                        'relative overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5',
                        m.featured
                            ? 'border-transparent shadow-lg shadow-[#7F2020]/20'
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
                                <m.icon className={'h-4 w-4 ' + m.iconColor} />
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
                            <div className={'mt-0.5 text-[10px] ' + m.subColor}>
                                {m.sub}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusPill({ label, tone }: { label: string; tone: 'amber' }) {
    return (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {label}
        </span>
    );
}

function PaginationFooter<T>({
    paginator,
    label,
}: {
    paginator: Paginated<T>;
    label: string;
}) {
    return (
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/40 px-5 py-3.5">
            <span className="text-xs text-zinc-400">
                {paginator.from && paginator.to
                    ? 'Showing ' +
                      paginator.from +
                      '-' +
                      paginator.to +
                      ' of ' +
                      paginator.total +
                      ' ' +
                      label
                    : 'No ' + label}
            </span>
            <div className="flex items-center gap-1">
                {paginator.links.map((link, i) => {
                    const isChevronLeft =
                        link.label.includes('Previous') ||
                        link.label.includes('&laquo;');
                    const isChevronRight =
                        link.label.includes('Next') ||
                        link.label.includes('&raquo;');
                    const content = isChevronLeft ? (
                        <ChevronLeft className="h-3.5 w-3.5" />
                    ) : isChevronRight ? (
                        <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );

                    return (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={[
                                'h-8 min-w-8 rounded-lg px-2.5 text-xs font-medium transition-colors',
                                link.active
                                    ? 'bg-[#7F2020] text-white shadow-sm'
                                    : !link.url
                                      ? 'cursor-not-allowed text-zinc-300'
                                      : 'text-zinc-500 hover:bg-zinc-100',
                            ].join(' ')}
                        >
                            {content}
                        </button>
                    );
                })}
                <PerPageSelect paginator={paginator} />
            </div>
        </div>
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
