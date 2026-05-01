import { Head, Link, router } from '@inertiajs/react';
import {
    Archive, Ban, ChevronLeft, ChevronRight,
    Download, Eye, FileText, MoreVertical, Package, Pencil, Plus, RotateCcw,
    Search, ShoppingBag, Sparkles, Star, Trash2, TrendingDown, Upload, X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface Option { id: number; name: string }

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
    options: { categories: Option[]; collections: Option[]; statuses: string[] };
}

const fmt = (v: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        .format(v).replace('Rp', 'Rp ');

const visibilityFor = (p: Product) => {
    if (p.is_featured) return { label: 'Featured', cls: 'text-amber-700 border-amber-200 bg-amber-50' };
    if (p.is_new_arrival) return { label: 'New Arrival', cls: 'text-blue-700 border-blue-200 bg-blue-50' };
    if (p.is_best_seller) return { label: 'Best Seller', cls: 'text-purple-700 border-purple-200 bg-purple-50' };
    return { label: 'Standard', cls: 'text-zinc-500 border-zinc-200 bg-zinc-50' };
};

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    published: { label: 'Published', dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    draft:     { label: 'Draft',     dot: 'bg-zinc-400',   text: 'text-zinc-600',   bg: 'bg-zinc-50 border-zinc-200'     },
    archived:  { label: 'Archived',  dot: 'bg-zinc-300',   text: 'text-zinc-500',   bg: 'bg-zinc-50 border-zinc-200'     },
};

export default function ProductsIndex({ products, filters, options }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const allSelected = products.data.length > 0 && selected.length === products.data.length;

    const toggleAll = () =>
        setSelected(allSelected ? [] : products.data.map((p) => p.id));

    const toggleOne = (id: number) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const applyFilter = (key: string, value: string) =>
        router.get('/admin/products', { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });

    const resetFilters = () =>
        router.get('/admin/products', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const publishedCount  = products.data.filter(p => p.status === 'published').length;
    const draftCount      = products.data.filter(p => p.status === 'draft').length;
    const archivedCount   = products.data.filter(p => p.status === 'archived').length;
    const lowStockCount   = products.data.filter(p => p.total_stock > 0 && p.total_stock <= 5).length;
    const outOfStockCount = products.data.filter(p => p.total_stock === 0).length;

    const stats = [
        {
            title: 'Total Products',
            val: products.total,
            sub: 'in catalog',
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
            <Head title='Products' />
            <div className='flex flex-col gap-6 p-6 mx-auto max-w-7xl'>

                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={'/admin/dashboard'}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className='text-zinc-500'>Products</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                    <div>
                        <p className='text-[11px] font-bold uppercase tracking-widest text-[#422d25]/50 mb-1'>Catalog Management</p>
                        <h1 className='text-3xl font-serif text-zinc-900 leading-tight'>Products</h1>
                        <p className='text-sm text-zinc-400 mt-1'>Manage your modest fashion catalog, inventory, pricing &amp; visibility.</p>
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                        <Button variant='outline' size='sm' className='h-9 text-zinc-600 border-zinc-200 bg-white hover:bg-zinc-50 gap-1.5'>
                            <Download className='w-3.5 h-3.5' /> Import
                        </Button>
                        <Button variant='outline' size='sm' className='h-9 text-zinc-600 border-zinc-200 bg-white hover:bg-zinc-50 gap-1.5'>
                            <Upload className='w-3.5 h-3.5' /> Export
                        </Button>
                        <Link href='/admin/products/create'>
                            <Button size='sm' className='h-9 bg-[#422d25] hover:bg-[#34231d] text-white gap-1.5 shadow-sm'>
                                <Plus className='w-3.5 h-3.5' /> Add Product
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
                    {stats.map((m, i) => (
                        <div
                            key={i}
                            className={[
                                'relative rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-0.5',
                                m.featured
                                    ? 'border-transparent shadow-lg shadow-[#422d25]/20'
                                    : 'border-zinc-100 shadow-sm hover:shadow-md',
                                m.cardBg,
                            ].join(' ')}
                        >
                            {!m.featured && m.accent && (
                                <div className={'absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ' + m.accent} />
                            )}
                            {m.featured && (
                                <div className='absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/10' />
                            )}

                            <div className='p-4 flex flex-col gap-3'>
                                <div className='flex items-center justify-between'>
                                    <div className={'w-8 h-8 rounded-xl flex items-center justify-center ' + m.iconBg}>
                                        <m.icon className={'w-4 h-4 ' + m.iconColor} />
                                    </div>
                                    {m.featured && <Sparkles className='w-3.5 h-3.5 text-white/30' />}
                                </div>
                                <div>
                                    <div className={'text-2xl font-bold tracking-tight leading-none ' + m.valColor}>
                                        {m.val}
                                    </div>
                                    <div className={'text-[11px] font-semibold mt-1.5 ' + m.titleColor}>
                                        {m.title}
                                    </div>
                                    <div className={'text-[10px] mt-0.5 ' + m.subColor}>
                                        {m.sub}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className='bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden'>

                    {/* Filter Bar */}
                    <form onSubmit={handleSearch} className='px-5 py-4 border-b border-zinc-100 bg-zinc-50/40 flex flex-wrap items-end gap-3'>
                        <div className='relative flex-1 min-w-[200px]'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5' />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder='Search name, SKU...'
                                className='pl-9 h-9 border-zinc-200 bg-white rounded-lg text-sm shadow-sm'
                            />
                        </div>

                        <FilterSelect label='Category' value={filters.category_id || 'all'} onChange={(v) => applyFilter('category_id', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Categories</SelectItem>
                            {options.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </FilterSelect>

                        <FilterSelect label='Collection' value={filters.collection_id || 'all'} onChange={(v) => applyFilter('collection_id', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Collections</SelectItem>
                            {options.collections.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </FilterSelect>

                        <FilterSelect label='Status' value={filters.status || 'all'} onChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Status</SelectItem>
                            {options.statuses.map((s) => <SelectItem key={s} value={s} className='capitalize'>{s}</SelectItem>)}
                        </FilterSelect>

                        <FilterSelect label='Stock' value={filters.stock_status || 'all'} onChange={(v) => applyFilter('stock_status', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Stock</SelectItem>
                            <SelectItem value='in_stock'>In Stock</SelectItem>
                            <SelectItem value='low_stock'>Low Stock</SelectItem>
                            <SelectItem value='out_of_stock'>Out of Stock</SelectItem>
                        </FilterSelect>

                        <FilterSelect
                            label='Tag'
                            value={
                                filters.is_featured === '1' ? 'featured' :
                                filters.is_new_arrival === '1' ? 'new_arrival' :
                                filters.is_best_seller === '1' ? 'best_seller' : 'all'
                            }
                            onChange={(v) => {
                                const map: Record<string, Record<string, string>> = {
                                    featured:    { is_featured: '1', is_new_arrival: '', is_best_seller: '' },
                                    new_arrival: { is_featured: '', is_new_arrival: '1', is_best_seller: '' },
                                    best_seller: { is_featured: '', is_new_arrival: '', is_best_seller: '1' },
                                    all:         { is_featured: '', is_new_arrival: '', is_best_seller: '' },
                                };
                                router.get('/admin/products', { ...filters, ...(map[v] ?? map.all), page: 1 }, { preserveState: true, replace: true });
                            }}
                        >
                            <SelectItem value='all'>All Tags</SelectItem>
                            <SelectItem value='featured'>Featured</SelectItem>
                            <SelectItem value='new_arrival'>New Arrival</SelectItem>
                            <SelectItem value='best_seller'>Best Seller</SelectItem>
                        </FilterSelect>

                        <div className='flex gap-2 ml-auto'>
                            <Button type='submit' size='sm' className='h-9 bg-[#422d25] hover:bg-[#34231d] text-white gap-1.5'>
                                <Search className='w-3.5 h-3.5' /> Search
                            </Button>
                            <Button type='button' variant='ghost' size='sm' className='h-9 text-zinc-500 hover:text-zinc-700 gap-1.5' onClick={resetFilters}>
                                <RotateCcw className='w-3.5 h-3.5' /> Reset
                            </Button>
                        </div>
                    </form>

                    {/* Bulk Action Bar */}
                    {selected.length > 0 && (
                        <div className='px-5 py-2.5 bg-[#fdfaf8] border-b border-[#e8ddd8] flex items-center gap-3'>
                            <span className='text-sm font-semibold text-[#422d25]'>{selected.length} selected</span>
                            <div className='flex gap-2'>
                                <Button size='sm' variant='outline' className='h-7 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-100 gap-1' onClick={() => doAction('/admin/products/bulk-publish')}>
                                    <Eye className='w-3 h-3' /> Publish
                                </Button>
                                <Button size='sm' variant='outline' className='h-7 text-xs border-zinc-200 text-zinc-600 hover:bg-zinc-100 gap-1' onClick={() => doAction('/admin/products/bulk-archive')}>
                                    <Archive className='w-3 h-3' /> Archive
                                </Button>
                                <Button size='sm' variant='outline' className='h-7 text-xs border-red-100 text-red-600 hover:bg-red-50 gap-1' onClick={() => { if (confirm('Delete ' + selected.length + ' products?')) doAction('/admin/products/bulk-delete', 'delete'); }}>
                                    <Trash2 className='w-3 h-3' /> Delete
                                </Button>
                            </div>
                            <Button variant='ghost' size='icon' className='h-7 w-7 ml-auto text-zinc-400 hover:text-zinc-600' onClick={() => setSelected([])}>
                                <X className='w-3.5 h-3.5' />
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left'>
                            <thead>
                                <tr className='border-b border-zinc-100 bg-zinc-50/60'>
                                    <th className='px-4 py-3 w-10'>
                                        <Checkbox checked={allSelected} onCheckedChange={toggleAll}
                                            className='data-[state=checked]:bg-[#422d25] border-zinc-300' />
                                    </th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Product</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>SKU</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Category</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Collection</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Price</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center'>Variants</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Stock</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Status</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Tag</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Created</th>
                                    <th className='px-4 py-3 w-10'></th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-zinc-50'>
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan={12}>
                                            <div className='flex flex-col items-center justify-center py-20 gap-3'>
                                                <div className='w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center'>
                                                    <ShoppingBag className='w-5 h-5 text-zinc-400' />
                                                </div>
                                                <p className='text-sm text-zinc-400'>No products found. Try adjusting your filters.</p>
                                                <Button size='sm' variant='outline' className='text-xs h-8' onClick={resetFilters}>
                                                    <RotateCcw className='w-3 h-3 mr-1' /> Clear Filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {products.data.map((p) => {
                                    const isSelected = selected.includes(p.id);
                                    const vis = visibilityFor(p);
                                    const isLowStock = p.total_stock > 0 && p.total_stock <= 5;
                                    const isOutOfStock = p.total_stock === 0;
                                    const discount = p.sale_price && p.base_price > 0
                                        ? Math.round((1 - p.sale_price / p.base_price) * 100)
                                        : null;
                                    const sc = statusConfig[p.status] ?? statusConfig.draft;

                                    return (
                                        <tr
                                            key={p.id}
                                            className={'transition-colors hover:bg-zinc-50/70 ' + (isSelected ? 'bg-[#fdfaf8]' : '')}
                                        >
                                            <td className='px-4 py-3.5'>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleOne(p.id)}
                                                    className={isSelected ? 'data-[state=checked]:bg-[#422d25] border-[#422d25]' : 'border-zinc-300'}
                                                />
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0'>
                                                        {p.thumbnail
                                                            ? <img src={p.thumbnail} alt={p.name} className='w-full h-full object-cover' />
                                                            : <div className='w-full h-full flex items-center justify-center'><ShoppingBag className='w-4 h-4 text-zinc-300' /></div>
                                                        }
                                                    </div>
                                                    <div className='min-w-[160px]'>
                                                        <Link href={'/admin/products/' + p.id} className='font-semibold text-zinc-900 hover:text-[#422d25] transition-colors line-clamp-1'>
                                                            {p.name}
                                                        </Link>
                                                        {p.is_featured && (
                                                            <span className='inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium mt-0.5'>
                                                                <Star className='w-2.5 h-2.5 fill-amber-400 text-amber-400' /> Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className='font-mono text-xs text-zinc-500 bg-zinc-100  rounded-md'>
                                                    {p.sku ?? '-'}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5 text-sm text-zinc-600'>
                                                {p.category ?? <span className='text-zinc-300'>-</span>}
                                            </td>

                                            <td className='px-4 py-3.5 text-sm text-zinc-600'>
                                                {p.collection ?? <span className='text-zinc-300'>-</span>}
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                {p.sale_price ? (
                                                    <div className='flex flex-col gap-0'>
                                                        <span className='font-semibold text-zinc-900 text-sm'>{fmt(p.sale_price)}</span>
                                                        <span className='text-xs text-zinc-400 line-through'>{fmt(p.base_price)}</span>
                                                        {discount && <span className='text-[10px] text-red-500 font-semibold'>-{discount}%</span>}
                                                    </div>
                                                ) : (
                                                    <span className='font-semibold text-zinc-900 text-sm'>{fmt(p.base_price)}</span>
                                                )}
                                            </td>

                                            <td className='px-4 py-3.5 text-center'>
                                                <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-semibold'>
                                                    {p.variants_count}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <div className='flex items-center gap-1.5'>
                                                    <span className={'text-sm font-semibold ' + (isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-600' : 'text-zinc-800')}>
                                                        {p.total_stock}
                                                    </span>
                                                    {isOutOfStock && <span className='text-[10px] text-red-400 font-medium'>OOS</span>}
                                                    {isLowStock   && <span className='text-[10px] text-amber-500 font-medium'>Low</span>}
                                                </div>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ' + sc.text + ' ' + sc.bg}>
                                                    <span className={'w-1.5 h-1.5 rounded-full ' + sc.dot} />
                                                    {sc.label}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <Badge variant='outline' className={'text-xs px-2 py-0.5 ' + vis.cls}>
                                                    {vis.label}
                                                </Badge>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className='text-xs text-zinc-400 whitespace-nowrap'>
                                                    {p.created_at
                                                        ? new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : '-'}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' size='icon' className='h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg'>
                                                            <MoreVertical className='w-4 h-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end' className='w-48'>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={'/admin/products/' + p.id} className='w-full flex items-center gap-2'>
                                                                <Eye className='w-3.5 h-3.5' /> View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={'/admin/products/' + p.id + '/edit'} className='w-full flex items-center gap-2'>
                                                                <Pencil className='w-3.5 h-3.5' /> Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={'/admin/products/' + p.id + '/variants'} className='w-full flex items-center gap-2'>
                                                                <Package className='w-3.5 h-3.5' /> Manage Variants
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {p.status !== 'published' && (
                                                            <DropdownMenuItem onClick={() => doAction('/admin/products/' + p.id + '/publish')} className='text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 gap-2'>
                                                                <Eye className='w-3.5 h-3.5' /> Publish
                                                            </DropdownMenuItem>
                                                        )}
                                                        {p.status !== 'archived' && (
                                                            <DropdownMenuItem onClick={() => doAction('/admin/products/' + p.id + '/archive')} className='gap-2'>
                                                                <Archive className='w-3.5 h-3.5' /> Archive
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => doAction('/admin/products/' + p.id + '/duplicate')} className='gap-2'>
                                                            <Download className='w-3.5 h-3.5' /> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { if (confirm('Delete ' + p.name + '?')) doAction('/admin/products/' + p.id, 'delete'); }}
                                                            className='text-red-600 focus:text-red-600 focus:bg-red-50 gap-2'
                                                        >
                                                            <Trash2 className='w-3.5 h-3.5' /> Delete
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
                    <div className='px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/40'>
                        <span className='text-xs text-zinc-400'>
                            {products.from && products.to
                                ? 'Showing ' + products.from + '-' + products.to + ' of ' + products.total + ' products'
                                : 'No products'}
                        </span>
                        <div className='flex items-center gap-1'>
                            {products.links.map((link, i) => {
                                const isChevronLeft  = link.label.includes('Previous') || link.label.includes('&laquo;');
                                const isChevronRight = link.label.includes('Next')     || link.label.includes('&raquo;');
                                const label = isChevronLeft  ? <ChevronLeft  className='w-3.5 h-3.5' />
                                            : isChevronRight ? <ChevronRight className='w-3.5 h-3.5' />
                                            : <span dangerouslySetInnerHTML={{ __html: link.label }} />;

                                return (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={[
                                            'h-8 min-w-8 px-2.5 rounded-lg text-xs font-medium transition-colors',
                                            link.active  ? 'bg-[#422d25] text-white shadow-sm'
                                            : !link.url  ? 'text-zinc-300 cursor-not-allowed'
                                            :              'text-zinc-500 hover:bg-zinc-100',
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
    label, value, onChange, children,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
}) {
    return (
        <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-0.5'>{label}</span>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className='h-9 w-[130px] border-zinc-200 bg-white shadow-sm text-xs rounded-lg'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>{children}</SelectContent>
            </Select>
        </div>
    );
}
