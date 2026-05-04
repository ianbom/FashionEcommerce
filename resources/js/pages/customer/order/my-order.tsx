import { Link, router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Package,
    Search,
    Truck,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
    index as orderIndex,
    show as orderShow,
} from '@/actions/App/Http/Controllers/Customer/OrderController';
import ProfileLayout from '@/layouts/profile-layout';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};

type OrderItem = {
    id: number;
    title: string;
    color: string | null;
    size: string | null;
    qty: number;
    image: string | null;
};

type Order = {
    id: number;
    order_number: string;
    created_date: string | null;
    created_time: string | null;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    grand_total: number;
    items: OrderItem[];
    items_count: number;
    extra_items: number;
    shipment: {
        waybill_id: string | null;
        courier: string | null;
        service: string | null;
    };
    payment: {
        midtrans_redirect_url: string | null;
    };
};

type Filters = {
    search: string;
    order_status: string;
    payment_status: string;
    sort: string;
    direction: string;
    per_page: number;
};

type Props = {
    orders: Paginated<Order>;
    filters: Filters;
    options: {
        orderStatuses: string[];
        paymentStatuses: string[];
        sorts: string[];
        directions: string[];
        perPages: number[];
    };
};

const FALLBACK_IMAGE = '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(price)
        .replace('Rp', 'Rp ');
};

const labelStatus = (status: string) => {
    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getBadgeStyle = (status: string) => {
    switch (status) {
        case 'pending':
        case 'pending_payment':
            return 'bg-orange-100 text-orange-700';
        case 'paid':
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'processing':
        case 'ready_to_ship':
            return 'bg-blue-100 text-blue-700';
        case 'shipped':
            return 'bg-purple-100 text-purple-700';
        case 'delivered':
            return 'bg-emerald-100 text-emerald-700';
        case 'cancelled':
        case 'expired':
        case 'failed':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const cleanQuery = (filters: Filters) => {
    return Object.fromEntries(
        Object.entries(filters).filter(
            ([, value]) => value !== '' && value !== null,
        ),
    );
};

const cleanPageLabel = (label: string) => {
    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
};

const canBuyAgain = (status: string) => {
    return status === 'delivered' || status === 'completed';
};

export default function ListOrder({ orders, filters, options }: Props) {
    const [form, setForm] = useState<Filters>({
        search: filters.search ?? '',
        order_status: filters.order_status ?? '',
        payment_status: filters.payment_status ?? '',
        sort: filters.sort ?? 'created_at',
        direction: filters.direction ?? 'desc',
        per_page: Number(filters.per_page ?? 10),
    });

    const tabs = useMemo(
        () => [
            { id: '', label: 'All Orders' },
            ...options.orderStatuses.map((status) => ({
                id: status,
                label: labelStatus(status),
            })),
        ],
        [options.orderStatuses],
    );

    const visit = (next: Filters) => {
        router.get(orderIndex.url(), cleanQuery(next), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        visit(form);
    };

    const updateFilter = (next: Partial<Filters>) => {
        const nextForm = { ...form, ...next };
        setForm(nextForm);
        visit(nextForm);
    };

    return (
        <ProfileLayout
            title="My Orders"
            pageTitle="My Orders"
            subtitle="Track and manage your recent purchases."
            activePath="list-order"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'My Orders' },
            ]}
        >
            <form
                onSubmit={submit}
                className="mb-6 grid gap-3 lg:grid-cols-[1fr_190px_170px_150px_110px_auto]"
            >
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-[#C99A8F]"
                    />
                    <input
                        type="search"
                        value={form.search}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                search: event.target.value,
                            }))
                        }
                        placeholder="Search by order number or product name"
                        className="w-full rounded-xl border border-[#EADBD8] bg-white py-3 pr-4 pl-11 text-[13px] text-[#333] shadow-sm transition-all focus:border-[#B6574B] focus:ring-1 focus:ring-[#B6574B] focus:outline-none"
                    />
                </div>
                <Select
                    value={form.payment_status}
                    onChange={(value) =>
                        updateFilter({ payment_status: value })
                    }
                >
                    <option value="">All payments</option>
                    {options.paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                            {labelStatus(status)}
                        </option>
                    ))}
                </Select>
                <Select
                    value={form.sort}
                    onChange={(value) => updateFilter({ sort: value })}
                >
                    {options.sorts.map((sort) => (
                        <option key={sort} value={sort}>
                            Sort: {labelStatus(sort)}
                        </option>
                    ))}
                </Select>
                <Select
                    value={form.direction}
                    onChange={(value) => updateFilter({ direction: value })}
                >
                    {options.directions.map((direction) => (
                        <option key={direction} value={direction}>
                            {direction === 'desc'
                                ? 'Newest / High'
                                : 'Oldest / Low'}
                        </option>
                    ))}
                </Select>
                <Select
                    value={String(form.per_page)}
                    onChange={(value) =>
                        updateFilter({ per_page: Number(value) })
                    }
                >
                    {options.perPages.map((perPage) => (
                        <option key={perPage} value={perPage}>
                            {perPage}/page
                        </option>
                    ))}
                </Select>
                <button
                    type="submit"
                    className="rounded-xl bg-[#4A2525] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#5F1717]"
                >
                    Search
                </button>
            </form>

            <div className="hide-scrollbar mb-6 flex overflow-x-auto border-b border-[#EADBD8]">
                <div className="flex space-x-6 px-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id || 'all'}
                            type="button"
                            onClick={() =>
                                updateFilter({ order_status: tab.id })
                            }
                            className={`relative pb-3 text-[13px] font-medium whitespace-nowrap transition-all ${form.order_status === tab.id ? 'text-[#4A2525]' : 'text-[#8A6B62] hover:text-[#4A4A4A]'}`}
                        >
                            {form.order_status === tab.id && (
                                <div className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-[#B6574B]" />
                            )}
                            <span
                                className={
                                    form.order_status === tab.id
                                        ? 'rounded-full bg-[#B6574B] px-3 py-1.5 text-xs text-white shadow-sm'
                                        : 'px-1'
                                }
                            >
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {orders.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-[#EADBD8] bg-white px-6 py-20 text-center">
                    <div className="relative mb-6 h-48 w-48">
                        <div className="absolute inset-0 rounded-full bg-[#F8EDED] opacity-50 blur-2xl" />
                        <img
                            src={FALLBACK_IMAGE}
                            alt="Empty orders"
                            className="relative z-10 h-full w-full rounded-xl object-cover shadow-lg"
                        />
                    </div>
                    <h2 className="mb-2 font-serif text-2xl text-[#4A2525]">
                        No orders found
                    </h2>
                    <p className="mb-8 max-w-[280px] text-[13px] text-[#8A6B62]">
                        Try a different filter or start exploring our
                        collection.
                    </p>
                    <Link
                        href="/list"
                        className="rounded-lg bg-[#4A2525] px-8 py-3 text-[12px] font-bold tracking-wider text-white transition-all hover:bg-[#5F1717]"
                    >
                        Shop Now
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.data.map((order, idx) => (
                        <div
                            key={order.id}
                            className="overflow-hidden rounded-2xl border border-[#EADBD8] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="grid grid-cols-2 gap-4 border-b border-[#EADBD8]/60 bg-[#FAF9F6]/50 p-5 md:grid-cols-4 md:p-6">
                                <div className="col-span-2 md:col-span-1">
                                    <p className="mb-1 font-serif text-[13px] text-[#333333]">
                                        Order #{order.order_number}
                                    </p>
                                    <p className="text-[11px] text-[#8A6B62]">
                                        {order.created_date ?? '-'} •{' '}
                                        {order.created_time ?? '-'}
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="mb-1 text-[10px] text-[#8A6B62]">
                                        Payment
                                    </p>
                                    <span
                                        className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold ${getBadgeStyle(order.payment_status)}`}
                                    >
                                        {labelStatus(order.payment_status)}
                                    </span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="mb-1 text-[10px] text-[#8A6B62]">
                                        Total
                                    </p>
                                    <p className="font-serif text-[14px] text-[#333333]">
                                        {formatPrice(order.grand_total)}
                                    </p>
                                </div>
                                <div className="col-span-2 flex flex-col items-start justify-center text-left md:col-span-1 md:items-end md:text-right">
                                    <p className="mb-1 hidden text-[10px] text-[#8A6B62] md:block">
                                        Order Status
                                    </p>
                                    <span
                                        className={`inline-block rounded-md px-3 py-1.5 text-[11px] font-bold ${getBadgeStyle(order.order_status)}`}
                                    >
                                        {labelStatus(order.order_status)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-start justify-between gap-6 p-5 md:p-6 lg:flex-row lg:items-center">
                                <div className="hide-scrollbar flex w-full flex-1 gap-4 overflow-x-auto pb-2 lg:pb-0">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex min-w-[200px] gap-4 md:min-w-0"
                                        >
                                            <div className="h-[100px] w-[80px] shrink-0 overflow-hidden rounded-lg bg-[#F8EDED]">
                                                <img
                                                    src={
                                                        item.image ??
                                                        FALLBACK_IMAGE
                                                    }
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="hidden py-1 pr-4 md:block">
                                                <h4 className="mb-1 max-w-[150px] truncate text-[13px] font-semibold text-[#333333]">
                                                    {item.title}
                                                </h4>
                                                <p className="mb-1 text-[11px] text-[#8A6B62]">
                                                    {item.color ?? '-'} •{' '}
                                                    {item.size ?? '-'}
                                                </p>
                                                <p className="text-[11px] text-[#8A6B62]">
                                                    Qty: {item.qty}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.extra_items > 0 && (
                                        <div className="flex h-[100px] w-[80px] shrink-0 flex-col items-center justify-center rounded-lg border border-[#EADBD8] bg-[#FAF9F6] text-[#8A6B62]">
                                            <span className="font-serif text-lg text-[#4A2525] italic">
                                                +{order.extra_items}
                                            </span>
                                            <span className="text-[10px]">
                                                more
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex w-full shrink-0 flex-row gap-3 lg:mt-0 lg:w-[200px] lg:flex-col">
                                    {order.order_status ===
                                        'pending_payment' && (
                                        <a
                                            href={
                                                order.payment
                                                    .midtrans_redirect_url ??
                                                '/checkout'
                                            }
                                            target={
                                                order.payment
                                                    .midtrans_redirect_url
                                                    ? '_blank'
                                                    : undefined
                                            }
                                            rel={
                                                order.payment
                                                    .midtrans_redirect_url
                                                    ? 'noreferrer'
                                                    : undefined
                                            }
                                            className="flex-1 rounded-lg bg-[#4A2525] py-2.5 text-center text-[12px] font-bold text-white shadow-md shadow-[#4A2525]/20 transition-colors hover:bg-[#5F1717] lg:w-full"
                                        >
                                            Pay Now
                                        </a>
                                    )}
                                    {order.order_status === 'shipped' && (
                                        <Link
                                            href={orderShow.url(order.id)}
                                            className="flex-1 rounded-lg bg-[#4A2525] py-2.5 text-center text-[12px] font-bold text-white shadow-md shadow-[#4A2525]/20 transition-colors hover:bg-[#5F1717] lg:w-full"
                                        >
                                            Track Order
                                        </Link>
                                    )}
                                    <Link
                                        href={orderShow.url(order.id)}
                                        className="flex-1 rounded-lg border border-[#EADBD8] bg-white py-2.5 text-center text-[12px] font-bold text-[#4A2525] transition-colors hover:border-[#C4BDB1] hover:bg-[#FAF9F6] lg:w-full"
                                    >
                                        View Details
                                    </Link>
                                    {canBuyAgain(order.order_status) && (
                                        <Link
                                            href="/list"
                                            className="flex-1 rounded-lg bg-[#4A2525] py-2.5 text-center text-[12px] font-bold text-white shadow-md shadow-[#4A2525]/20 transition-colors hover:bg-[#5F1717] lg:w-full"
                                        >
                                            Buy Again
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {order.order_status === 'shipped' && (
                                <div className="hidden border-t border-[#EADBD8]/60 bg-[#FAF9F6] px-5 py-4 md:block md:px-8">
                                    <div className="relative z-10 mx-auto flex max-w-[600px] items-center justify-between">
                                        <div className="absolute top-4 right-[5%] left-[5%] -z-10 h-[2px] bg-[#EADBD8]" />
                                        <div className="absolute top-4 left-[5%] -z-10 h-[2px] w-[60%] bg-[#B6574B]" />
                                        {[
                                            {
                                                label: 'Order Confirmed',
                                                icon: Check,
                                                active: true,
                                            },
                                            {
                                                label: 'Packed',
                                                icon: Package,
                                                active: true,
                                            },
                                            {
                                                label: 'Shipped',
                                                icon: Truck,
                                                active: true,
                                            },
                                            {
                                                label: 'Delivered',
                                                icon: Check,
                                                active: false,
                                            },
                                        ].map((step) => {
                                            const Icon = step.icon;

                                            return (
                                                <div
                                                    key={step.label}
                                                    className="flex flex-col items-center"
                                                >
                                                    <div
                                                        className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${step.active ? 'border-[#B6574B] bg-[#B6574B] text-white shadow-md' : 'border-[#EADBD8] bg-white text-[#C99A8F]'}`}
                                                    >
                                                        <Icon
                                                            size={14}
                                                            strokeWidth={3}
                                                        />
                                                    </div>
                                                    <p
                                                        className={`mb-0.5 text-[10px] font-bold ${step.active ? 'text-[#4A2525]' : 'text-[#C99A8F]'}`}
                                                    >
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex flex-col items-center justify-between gap-4 pt-8 pb-4 text-[12px] text-[#8A6B62] md:flex-row">
                        <span>
                            Showing {orders.from ?? 0}-{orders.to ?? 0} of{' '}
                            {orders.total} orders
                        </span>
                        <div className="flex flex-wrap justify-center gap-1">
                            {orders.links.map((link) => (
                                <PaginationButton
                                    key={`${link.label}-${link.url ?? 'disabled'}`}
                                    link={link}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}

function Select({
    value,
    onChange,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#EADBD8] bg-white px-4 py-3 pr-9 text-[13px] text-[#333] shadow-sm focus:border-[#B6574B] focus:outline-none"
            >
                {children}
            </select>
            <ChevronDown
                size={16}
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#C99A8F]"
            />
        </div>
    );
}

function PaginationButton({ link }: { link: PaginationLink }) {
    const label = cleanPageLabel(link.label);
    const content =
        label === 'Previous' ? (
            <ChevronLeft size={16} />
        ) : label === 'Next' ? (
            <ChevronRight size={16} />
        ) : (
            label
        );
    const className = `flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-medium transition-colors ${link.active ? 'bg-[#4A2525] text-white shadow-md' : 'text-[#8A6B62] hover:bg-white hover:text-[#4A2525]'}`;

    if (!link.url) {
        return <span className={`${className} opacity-40`}>{content}</span>;
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            preserveState
            className={className}
        >
            {content}
        </Link>
    );
}
