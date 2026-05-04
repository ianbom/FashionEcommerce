import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Bell,
    BellRing,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
    RotateCcw,
    Search,
    Send,
    Tag,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
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

type Notification = {
    id: number;
    customer: string | null;
    customer_email: string | null;
    title: string;
    message: string;
    type: string;
    reference_type: string | null;
    reference_id: number | null;
    is_read: boolean;
    created_at: string | null;
};

type Props = {
    notifications: Paginated<Notification>;
    filters: Record<string, string>;
    types: string[];
};

const getTypeConfig = (type: string) => {
    const safeType = type || 'notification';

    if (safeType.includes('order')) {
        return {
            dot: 'bg-blue-400',
            text: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-100',
        };
    }

    if (safeType.includes('payment')) {
        return {
            dot: 'bg-emerald-400',
            text: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-100',
        };
    }

    if (safeType.includes('promo') || safeType.includes('voucher')) {
        return {
            dot: 'bg-purple-400',
            text: 'text-purple-700',
            bg: 'bg-purple-50 border-purple-100',
        };
    }

    return {
        dot: 'bg-zinc-400',
        text: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
    };
};

export default function NotificationsIndex({
    notifications,
    filters,
    types,
}: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        read: filters.read ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/notifications', { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        router.get('/admin/notifications', {}, { preserveState: false });
    };

    const readCount = notifications.data.filter(
        (notification) => notification.is_read,
    ).length;
    const unreadCount = notifications.data.length - readCount;
    const uniqueTypes = new Set(
        notifications.data
            .map((notification) => notification.type)
            .filter(Boolean),
    ).size;
    const referencedCount = notifications.data.filter(
        (notification) =>
            notification.reference_type || notification.reference_id,
    ).length;

    const stats = [
        {
            title: 'Total Notifications',
            val: notifications.total,
            sub: 'stored messages',
            icon: Bell,
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
            title: 'Unread',
            val: unreadCount,
            sub: 'shown page',
            icon: BellRing,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-blue-500',
            titleColor: 'text-zinc-700',
            accent: 'from-blue-400 to-blue-600',
            featured: false,
        },
        {
            title: 'Read',
            val: readCount,
            sub: 'shown page',
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
            title: 'Types',
            val: uniqueTypes,
            sub: 'shown page',
            icon: Tag,
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
            title: 'Referenced',
            val: referencedCount,
            sub: 'has source',
            icon: Send,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-amber-600',
            titleColor: 'text-zinc-700',
            accent: 'from-amber-400 to-amber-600',
            featured: false,
        },
    ];

    return (
        <>
            <Head title="Notifications" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            Customer Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Pantau dan kirim notifikasi manual untuk customer
                            atau segment customer aktif.
                        </p>
                    </div>
                    <Button
                        asChild
                        className="bg-[#7F2020] text-white hover:bg-[#5F1717]"
                    >
                        <Link href="/admin/notifications/create">
                            <Plus className="h-4 w-4" /> Send Notification
                        </Link>
                    </Button>
                </div>

                <StatsGrid stats={stats} />

                <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                    <form
                        onSubmit={submit}
                        className="flex flex-wrap items-end gap-3 border-b border-zinc-100 bg-zinc-50/40 px-5 py-4"
                    >
                        <FilterSelect
                            label="Type"
                            value={data.type || 'all'}
                            onChange={(value) =>
                                setData('type', value === 'all' ? '' : value)
                            }
                        >
                            <SelectItem value="all">All Types</SelectItem>
                            {types.map((type) => (
                                <SelectItem
                                    key={type}
                                    value={type}
                                    className="capitalize"
                                >
                                    {type.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Read"
                            value={data.read || 'all'}
                            onChange={(value) =>
                                setData('read', value === 'all' ? '' : value)
                            }
                        >
                            <SelectItem value="all">Read Status</SelectItem>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="unread">Unread</SelectItem>
                        </FilterSelect>

                        <div className="relative min-w-[260px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Search title, message, customer..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
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
                                        Notification
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Read
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Reference
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {notifications.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <Bell className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No notifications found. Try
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

                                {notifications.data.map((notification) => {
                                    const typeConfig = getTypeConfig(
                                        notification.type,
                                    );

                                    return (
                                        <tr
                                            key={notification.id}
                                            className="transition-colors hover:bg-zinc-50/70"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex max-w-lg flex-col gap-1">
                                                    <span className="font-medium text-zinc-900">
                                                        {notification.title}
                                                    </span>
                                                    <span className="truncate text-xs text-zinc-500">
                                                        {notification.message}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-zinc-700">
                                                        {notification.customer ??
                                                            '-'}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {notification.customer_email ??
                                                            '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={
                                                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ' +
                                                        typeConfig.text +
                                                        ' ' +
                                                        typeConfig.bg
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'h-1.5 w-1.5 rounded-full ' +
                                                            typeConfig.dot
                                                        }
                                                    />
                                                    {notification.type.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <ReadPill
                                                    read={notification.is_read}
                                                />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1 text-xs text-zinc-500">
                                                    <span>
                                                        {notification.reference_type ??
                                                            '-'}
                                                    </span>
                                                    <span>
                                                        {notification.reference_id
                                                            ? '#' +
                                                              notification.reference_id
                                                            : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs whitespace-nowrap text-zinc-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-zinc-300" />
                                                    {notification.created_at ??
                                                        '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <PaginationFooter
                        paginator={notifications}
                        label="notifications"
                    />
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

function ReadPill({ read }: { read: boolean }) {
    return (
        <span
            className={
                'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ' +
                (read
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border-blue-100 bg-blue-50 text-blue-700')
            }
        >
            <span
                className={
                    'h-1.5 w-1.5 rounded-full ' +
                    (read ? 'bg-emerald-400' : 'bg-blue-400')
                }
            />
            {read ? 'Read' : 'Unread'}
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
