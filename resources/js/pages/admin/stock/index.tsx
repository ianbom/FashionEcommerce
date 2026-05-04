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
    SlidersHorizontal,
    History,
    CheckCircle2,
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

interface VariantStock {
    id: number;
    product: string | null;
    sku: string;
    color_name: string | null;
    size: string | null;
    stock: number;
    reserved_stock: number;
    available_stock: number;
    is_active: boolean;
}

interface PaginatedVariants {
    data: VariantStock[];
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
    stock_status?: string;
}

interface Props {
    variants: PaginatedVariants;
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

export default function StockIndex({ variants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/stock',
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );

    const resetFilters = () =>
        router.get('/admin/stock', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const inStockCount = variants.data.filter(
        (v) => v.available_stock > 5,
    ).length;
    const lowStockCount = variants.data.filter(
        (v) => v.available_stock > 0 && v.available_stock <= 5,
    ).length;
    const soldOutCount = variants.data.filter(
        (v) => v.available_stock === 0,
    ).length;

    const stats = [
        {
            title: 'Total Variants',
            val: variants.total,
            sub: 'in inventory',
            icon: Package,
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
            title: 'In Stock',
            val: inStockCount,
            sub: 'healthy levels',
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
            title: 'Low Stock',
            val: lowStockCount,
            sub: 'need restocking',
            icon: TrendingDown,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-amber-600',
            titleColor: 'text-zinc-700',
            accent: 'from-amber-400 to-orange-400',
            featured: false,
        },
        {
            title: 'Sold Out',
            val: soldOutCount,
            sub: 'unavailable',
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
            <Head title="Stock Monitor" />
            <div className="mx-auto flex w-full flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            Catalog Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Stock Monitor
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Monitor variant stock, reserved items, and perform
                            manual adjustments.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Link href="/admin/stock/logs">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 gap-1.5 border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"
                            >
                                <History className="h-3.5 w-3.5" /> Stock Logs
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                                placeholder="Search SKU or product..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <FilterSelect
                            label="Stock Status"
                            value={filters.stock_status || 'all'}
                            onChange={(v) =>
                                applyFilter(
                                    'stock_status',
                                    v === 'all' ? '' : v,
                                )
                            }
                        >
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="sold_out">Sold Out</SelectItem>
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

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Variant / SKU
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Color / Size
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Reserved
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Available
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Status
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {variants.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <Package className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No variants found. Try
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
                                {variants.data.map((v) => {
                                    const sc =
                                        statusConfig[
                                            v.is_active ? 'active' : 'inactive'
                                        ];
                                    const isLowStock =
                                        v.available_stock > 0 &&
                                        v.available_stock <= 5;
                                    const isOutOfStock =
                                        v.available_stock === 0;

                                    return (
                                        <tr
                                            key={v.id}
                                            className="transition-colors hover:bg-zinc-50/70"
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900">
                                                        {v.sku}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">
                                                        {v.product ?? '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="text-sm text-zinc-600">
                                                    {v.color_name ?? '-'} /{' '}
                                                    {v.size ?? '-'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-zinc-600">
                                                {v.stock}
                                            </td>

                                            <td className="px-4 py-3.5 text-zinc-600">
                                                {v.reserved_stock}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={
                                                            'text-sm font-semibold ' +
                                                            (isOutOfStock
                                                                ? 'text-red-500'
                                                                : isLowStock
                                                                  ? 'text-amber-600'
                                                                  : 'text-zinc-800')
                                                        }
                                                    >
                                                        {v.available_stock}
                                                    </span>
                                                    {isOutOfStock && (
                                                        <span className="text-[10px] font-medium text-red-400">
                                                            Sold Out
                                                        </span>
                                                    )}
                                                    {isLowStock && (
                                                        <span className="text-[10px] font-medium text-amber-500">
                                                            Low
                                                        </span>
                                                    )}
                                                </div>
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
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-[#fdfaf8] hover:text-[#7F2020]"
                                                >
                                                    <Link
                                                        href={
                                                            '/admin/product-variants/' +
                                                            v.id +
                                                            '/stock-adjustment'
                                                        }
                                                        title="Adjust Stock"
                                                    >
                                                        <SlidersHorizontal className="h-4 w-4" />
                                                    </Link>
                                                </Button>
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
                            {variants.from && variants.to
                                ? 'Showing ' +
                                  variants.from +
                                  '-' +
                                  variants.to +
                                  ' of ' +
                                  variants.total +
                                  ' variants'
                                : 'No variants'}
                        </span>
                        <div className="flex items-center gap-1">
                            {variants.links.map((link, i) => {
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
