import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    Ban,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    MoreVertical,
    Package,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    ShoppingBag,
    Sparkles,
    Star,
    Trash2,
    TrendingDown,
    Upload,
    X,
    Layers,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Collection {
    id: number;
    name: string;
    slug: string;
    banner_desktop_url: string | null;
    is_featured: boolean;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
}

interface PaginatedCollections {
    data: Collection[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    status?: string;
}

interface Props {
    collections: PaginatedCollections;
    filters: Filters;
}

const statusConfig: Record<
    string,
    { label: string; dot: string; text: string; bg: string }
> = {
    active: {
        label: 'Active',
        dot: 'bg-emerald-400',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-100',
    },
    inactive: {
        label: 'Inactive',
        dot: 'bg-zinc-400',
        text: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
    },
};

export default function CollectionsIndex({ collections, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const allSelected =
        collections.data.length > 0 &&
        selected.length === collections.data.length;

    const toggleAll = () =>
        setSelected(allSelected ? [] : collections.data.map((c) => c.id));

    const toggleOne = (id: number) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/collections',
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );

    const resetFilters = () =>
        router.get('/admin/collections', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const activeCount = collections.data.filter((c) => c.is_active).length;
    const featuredCount = collections.data.filter((c) => c.is_featured).length;

    const stats = [
        {
            title: 'Total Collections',
            val: collections.total,
            sub: 'in catalog',
            icon: Layers,
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
            title: 'Active',
            val: activeCount,
            sub: 'visible collections',
            icon: Eye,
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
            title: 'Featured',
            val: featuredCount,
            sub: 'highlighted collections',
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
    ];

    return (
        <>
            <Head title="Collections" />
            <div className="mx-auto flex w-full flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            Catalog Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Collections
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Manage your campaign collections like Ramadan, Hajj
                            Series, etc.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Link href="/admin/collections/create">
                            <Button
                                size="sm"
                                className="h-9 gap-1.5 bg-[#7F2020] text-white shadow-sm hover:bg-[#5F1717]"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Collection
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                                        <m.icon
                                            className={'h-4 w-4 ' + m.iconColor}
                                        />
                                    </div>
                                    {m.featured && (
                                        <Sparkles className="h-3.5 w-3.5 text-white/30" />
                                    )}
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
                                placeholder="Search collections..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <FilterSelect
                            label="Status"
                            value={filters.status || 'all'}
                            onChange={(v) =>
                                applyFilter('status', v === 'all' ? '' : v)
                            }
                        >
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </FilterSelect>

                        <div className="ml-auto flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-9 gap-1.5 bg-[#7F2020] text-white hover:bg-[#5F1717]"
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

                    {/* Bulk Action Bar */}
                    {selected.length > 0 && (
                        <div className="flex items-center gap-3 border-b border-[#e8ddd8] bg-[#fdfaf8] px-5 py-2.5">
                            <span className="text-sm font-semibold text-[#7F2020]">
                                {selected.length} selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 border-red-100 text-xs text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Delete ' +
                                                    selected.length +
                                                    ' collections?',
                                            )
                                        ) {
                                            doAction(
                                                '/admin/collections/bulk-delete',
                                                'delete',
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" /> Delete
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-7 w-7 text-zinc-400 hover:text-zinc-600"
                                onClick={() => setSelected([])}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                                    <th className="w-10 px-4 py-3">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                            className="border-zinc-300 data-[state=checked]:bg-[#7F2020]"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Collection
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Products
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Featured
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Created
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {collections.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <Layers className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No collections found. Try
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
                                {collections.data.map((c) => {
                                    const isSelected = selected.includes(c.id);
                                    const sc =
                                        statusConfig[
                                            c.is_active ? 'active' : 'inactive'
                                        ];

                                    return (
                                        <tr
                                            key={c.id}
                                            className={
                                                'transition-colors hover:bg-zinc-50/70 ' +
                                                (isSelected
                                                    ? 'bg-[#fdfaf8]'
                                                    : '')
                                            }
                                        >
                                            <td className="px-4 py-3.5">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() =>
                                                        toggleOne(c.id)
                                                    }
                                                    className={
                                                        isSelected
                                                            ? 'border-[#7F2020] data-[state=checked]:bg-[#7F2020]'
                                                            : 'border-zinc-300'
                                                    }
                                                />
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                                        {c.banner_desktop_url ? (
                                                            <img
                                                                src={
                                                                    c.banner_desktop_url
                                                                }
                                                                alt={c.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Layers className="h-4 w-4 text-zinc-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-[160px]">
                                                        <Link
                                                            href={
                                                                '/admin/collections/' +
                                                                c.id +
                                                                '/edit'
                                                            }
                                                            className="line-clamp-1 font-semibold text-zinc-900 transition-colors hover:text-[#7F2020]"
                                                        >
                                                            {c.name}
                                                        </Link>
                                                        <span className="mt-0.5 block text-xs text-zinc-400">
                                                            {c.slug}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                                                    {c.products_count}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                {c.is_featured ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                                                    >
                                                        Featured
                                                    </Badge>
                                                ) : (
                                                    <span className="text-zinc-300">
                                                        -
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={
                                                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                                                        sc.text +
                                                        ' ' +
                                                        sc.bg
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            'h-1.5 w-1.5 rounded-full ' +
                                                            sc.dot
                                                        }
                                                    />
                                                    {sc.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="text-xs whitespace-nowrap text-zinc-400">
                                                    {c.created_at
                                                        ? new Date(
                                                              c.created_at,
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

                                            <td className="px-4 py-3.5">
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
                                                                    '/admin/collections/' +
                                                                    c.id +
                                                                    '/edit'
                                                                }
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />{' '}
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        'Delete ' +
                                                                            c.name +
                                                                            '?',
                                                                    )
                                                                ) {
                                                                    doAction(
                                                                        '/admin/collections/' +
                                                                            c.id,
                                                                        'delete',
                                                                    );
                                                                }
                                                            }}
                                                            className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />{' '}
                                                            Delete
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
                            {collections.from && collections.to
                                ? 'Showing ' +
                                  collections.from +
                                  '-' +
                                  collections.to +
                                  ' of ' +
                                  collections.total +
                                  ' collections'
                                : 'No collections'}
                        </span>
                        <div className="flex items-center gap-1">
                            {collections.links.map((link, i) => {
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
                                                ? 'bg-[#7F2020] text-white shadow-sm'
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
                <SelectTrigger className="h-9 w-[130px] rounded-lg border-zinc-200 bg-white text-xs shadow-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>{children}</SelectContent>
            </Select>
        </div>
    );
}
