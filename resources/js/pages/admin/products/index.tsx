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

interface Product {
    id: number;
    name: string;
    sku: string | null;
    category: string | null;
    collection: string | null;
    thumbnail: string | null;
    base_price: number;
    sale_price: number | null;
    total_stock: number;
    variants_count: number;
    status: string;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    created_at: string | null;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Option {
    id: number;
    name: string;
}

interface Filters {
    search: string;
    category_id: string;
    collection_id: string;
    status: string;
    stock_status: string;
    is_featured: string;
    is_new_arrival: string;
    is_best_seller: string;
}

interface Props {
    products: PaginatedProducts;
    filters: Filters;
    options: {
        categories: Option[];
        collections: Option[];
        statuses: string[];
    };
}

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(v)
        .replace('Rp', 'Rp ');

const visibilityFor = (p: Product) => {
    if (p.is_featured) {
        return {
            label: 'Featured',
            cls: 'text-amber-700 border-amber-200 bg-amber-50',
        };
    }

    if (p.is_new_arrival) {
        return {
            label: 'New Arrival',
            cls: 'text-blue-700 border-blue-200 bg-blue-50',
        };
    }

    if (p.is_best_seller) {
        return {
            label: 'Best Seller',
            cls: 'text-purple-700 border-purple-200 bg-purple-50',
        };
    }

    return {
        label: 'Standard',
        cls: 'text-zinc-500 border-zinc-200 bg-zinc-50',
    };
};

const statusConfig: Record<
    string,
    { label: string; dot: string; text: string; bg: string }
> = {
    published: {
        label: 'Published',
        dot: 'bg-emerald-400',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-100',
    },
    draft: {
        label: 'Draft',
        dot: 'bg-zinc-400',
        text: 'text-zinc-600',
        bg: 'bg-zinc-50 border-zinc-200',
    },
    archived: {
        label: 'Archived',
        dot: 'bg-zinc-300',
        text: 'text-zinc-500',
        bg: 'bg-zinc-50 border-zinc-200',
    },
};

export default function ProductsIndex({ products, filters, options }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const allSelected =
        products.data.length > 0 && selected.length === products.data.length;

    const toggleAll = () =>
        setSelected(allSelected ? [] : products.data.map((p) => p.id));

    const toggleOne = (id: number) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/products',
            { ...filters, [key]: value, page: 1 },
            { preserveState: true, replace: true },
        );

    const resetFilters = () =>
        router.get('/admin/products', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const publishedCount = products.data.filter(
        (p) => p.status === 'published',
    ).length;
    const draftCount = products.data.filter((p) => p.status === 'draft').length;
    const archivedCount = products.data.filter(
        (p) => p.status === 'archived',
    ).length;
    const lowStockCount = products.data.filter(
        (p) => p.total_stock > 0 && p.total_stock <= 5,
    ).length;
    const outOfStockCount = products.data.filter(
        (p) => p.total_stock === 0,
    ).length;

    const stats = [
        {
            title: 'Total Products',
            val: products.total,
            sub: 'in catalog',
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
            title: 'Published',
            val: publishedCount,
            sub: 'live on store',
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
            title: 'Draft',
            val: draftCount,
            sub: 'unpublished',
            icon: FileText,
            iconBg: 'bg-zinc-100',
            iconColor: 'text-zinc-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-zinc-800',
            titleColor: 'text-zinc-700',
            accent: '',
            featured: false,
        },
        {
            title: 'Archived',
            val: archivedCount,
            sub: 'hidden from store',
            icon: Archive,
            iconBg: 'bg-zinc-100',
            iconColor: 'text-zinc-400',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-zinc-500',
            titleColor: 'text-zinc-600',
            accent: '',
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
            title: 'Out of Stock',
            val: outOfStockCount,
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
            <Head title="Products" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-1 text-[11px] font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            Catalog Management
                        </p>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900">
                            Products
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Manage your modest fashion catalog, inventory,
                            pricing &amp; visibility.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        >
                            <Download className="h-3.5 w-3.5" /> Import
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                        >
                            <Upload className="h-3.5 w-3.5" /> Export
                        </Button>
                        <Link href="/admin/products/create">
                            <Button
                                size="sm"
                                className="h-9 gap-1.5 bg-[#7F2020] text-white shadow-sm hover:bg-[#5F1717]"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Product
                            </Button>
                        </Link>
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
                                placeholder="Search name, SKU..."
                                className="h-9 rounded-lg border-zinc-200 bg-white pl-9 text-sm shadow-sm"
                            />
                        </div>

                        <FilterSelect
                            label="Category"
                            value={filters.category_id || 'all'}
                            onChange={(v) =>
                                applyFilter('category_id', v === 'all' ? '' : v)
                            }
                        >
                            <SelectItem value="all">All Categories</SelectItem>
                            {options.categories.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Collection"
                            value={filters.collection_id || 'all'}
                            onChange={(v) =>
                                applyFilter(
                                    'collection_id',
                                    v === 'all' ? '' : v,
                                )
                            }
                        >
                            <SelectItem value="all">All Collections</SelectItem>
                            {options.collections.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Status"
                            value={filters.status || 'all'}
                            onChange={(v) =>
                                applyFilter('status', v === 'all' ? '' : v)
                            }
                        >
                            <SelectItem value="all">All Status</SelectItem>
                            {options.statuses.map((s) => (
                                <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                >
                                    {s}
                                </SelectItem>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Stock"
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
                            <SelectItem value="out_of_stock">
                                Out of Stock
                            </SelectItem>
                        </FilterSelect>

                        <FilterSelect
                            label="Tag"
                            value={
                                filters.is_featured === '1'
                                    ? 'featured'
                                    : filters.is_new_arrival === '1'
                                      ? 'new_arrival'
                                      : filters.is_best_seller === '1'
                                        ? 'best_seller'
                                        : 'all'
                            }
                            onChange={(v) => {
                                const map: Record<
                                    string,
                                    Record<string, string>
                                > = {
                                    featured: {
                                        is_featured: '1',
                                        is_new_arrival: '',
                                        is_best_seller: '',
                                    },
                                    new_arrival: {
                                        is_featured: '',
                                        is_new_arrival: '1',
                                        is_best_seller: '',
                                    },
                                    best_seller: {
                                        is_featured: '',
                                        is_new_arrival: '',
                                        is_best_seller: '1',
                                    },
                                    all: {
                                        is_featured: '',
                                        is_new_arrival: '',
                                        is_best_seller: '',
                                    },
                                };
                                router.get(
                                    '/admin/products',
                                    {
                                        ...filters,
                                        ...(map[v] ?? map.all),
                                        page: 1,
                                    },
                                    { preserveState: true, replace: true },
                                );
                            }}
                        >
                            <SelectItem value="all">All Tags</SelectItem>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="new_arrival">
                                New Arrival
                            </SelectItem>
                            <SelectItem value="best_seller">
                                Best Seller
                            </SelectItem>
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
                                    className="h-7 gap-1 border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-100"
                                    onClick={() =>
                                        doAction('/admin/products/bulk-publish')
                                    }
                                >
                                    <Eye className="h-3 w-3" /> Publish
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-100"
                                    onClick={() =>
                                        doAction('/admin/products/bulk-archive')
                                    }
                                >
                                    <Archive className="h-3 w-3" /> Archive
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 border-red-100 text-xs text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Delete ' +
                                                    selected.length +
                                                    ' products?',
                                            )
                                        ) {
                                            doAction(
                                                '/admin/products/bulk-delete',
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
                                        Product
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        SKU
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Collection
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-center text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Variants
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Tag
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                                        Created
                                    </th>
                                    <th className="w-10 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan={12}>
                                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                                                    <ShoppingBag className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <p className="text-sm text-zinc-400">
                                                    No products found. Try
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
                                {products.data.map((p) => {
                                    const isSelected = selected.includes(p.id);
                                    const vis = visibilityFor(p);
                                    const isLowStock =
                                        p.total_stock > 0 && p.total_stock <= 5;
                                    const isOutOfStock = p.total_stock === 0;
                                    const discount =
                                        p.sale_price && p.base_price > 0
                                            ? Math.round(
                                                  (1 -
                                                      p.sale_price /
                                                          p.base_price) *
                                                      100,
                                              )
                                            : null;
                                    const sc =
                                        statusConfig[p.status] ??
                                        statusConfig.draft;

                                    return (
                                        <tr
                                            key={p.id}
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
                                                        toggleOne(p.id)
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
                                                        {p.thumbnail ? (
                                                            <img
                                                                src={
                                                                    p.thumbnail
                                                                }
                                                                alt={p.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <ShoppingBag className="h-4 w-4 text-zinc-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-[160px]">
                                                        <Link
                                                            href={
                                                                '/admin/products/' +
                                                                p.id
                                                            }
                                                            className="line-clamp-1 font-semibold text-zinc-900 transition-colors hover:text-[#7F2020]"
                                                        >
                                                            {p.name}
                                                        </Link>
                                                        {p.is_featured && (
                                                            <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
                                                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />{' '}
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="rounded-md bg-zinc-100 font-mono text-xs text-zinc-500">
                                                    {p.sku ?? '-'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-sm text-zinc-600">
                                                {p.category ?? (
                                                    <span className="text-zinc-300">
                                                        -
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-sm text-zinc-600">
                                                {p.collection ?? (
                                                    <span className="text-zinc-300">
                                                        -
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5">
                                                {p.sale_price ? (
                                                    <div className="flex flex-col gap-0">
                                                        <span className="text-sm font-semibold text-zinc-900">
                                                            {fmt(p.sale_price)}
                                                        </span>
                                                        <span className="text-xs text-zinc-400 line-through">
                                                            {fmt(p.base_price)}
                                                        </span>
                                                        {discount && (
                                                            <span className="text-[10px] font-semibold text-red-500">
                                                                -{discount}%
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-semibold text-zinc-900">
                                                        {fmt(p.base_price)}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-700">
                                                    {p.variants_count}
                                                </span>
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
                                                        {p.total_stock}
                                                    </span>
                                                    {isOutOfStock && (
                                                        <span className="text-[10px] font-medium text-red-400">
                                                            OOS
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
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        'px-2 py-0.5 text-xs ' +
                                                        vis.cls
                                                    }
                                                >
                                                    {vis.label}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <span className="text-xs whitespace-nowrap text-zinc-400">
                                                    {p.created_at
                                                        ? new Date(
                                                              p.created_at,
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
                                                                    '/admin/products/' +
                                                                    p.id
                                                                }
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />{' '}
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    '/admin/products/' +
                                                                    p.id +
                                                                    '/edit'
                                                                }
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />{' '}
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    '/admin/products/' +
                                                                    p.id +
                                                                    '/variants'
                                                                }
                                                                className="flex w-full items-center gap-2"
                                                            >
                                                                <Package className="h-3.5 w-3.5" />{' '}
                                                                Manage Variants
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {p.status !==
                                                            'published' && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    doAction(
                                                                        '/admin/products/' +
                                                                            p.id +
                                                                            '/publish',
                                                                    )
                                                                }
                                                                className="gap-2 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />{' '}
                                                                Publish
                                                            </DropdownMenuItem>
                                                        )}
                                                        {p.status !==
                                                            'archived' && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    doAction(
                                                                        '/admin/products/' +
                                                                            p.id +
                                                                            '/archive',
                                                                    )
                                                                }
                                                                className="gap-2"
                                                            >
                                                                <Archive className="h-3.5 w-3.5" />{' '}
                                                                Archive
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                doAction(
                                                                    '/admin/products/' +
                                                                        p.id +
                                                                        '/duplicate',
                                                                )
                                                            }
                                                            className="gap-2"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />{' '}
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        'Delete ' +
                                                                            p.name +
                                                                            '?',
                                                                    )
                                                                ) {
                                                                    doAction(
                                                                        '/admin/products/' +
                                                                            p.id,
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
                            {products.from && products.to
                                ? 'Showing ' +
                                  products.from +
                                  '-' +
                                  products.to +
                                  ' of ' +
                                  products.total +
                                  ' products'
                                : 'No products'}
                        </span>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, i) => {
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
