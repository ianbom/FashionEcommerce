import { Head, Link, router } from '@inertiajs/react';
import {
    Box, ChevronLeft, ChevronRight, Edit, LayoutGrid, MoreVertical, Package, Plus, Search,
    SlidersHorizontal, Trash2, XCircle, RotateCcw
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Variant {
    id: number;
    product_id: number;
    product: string | null;
    sku: string;
    color_name: string | null;
    color_hex: string | null;
    size: string | null;
    additional_price: string;
    stock: number;
    reserved_stock: number;
    available_stock: number;
    image_url: string | null;
    is_active: boolean;
    order_items_count: number;
}

interface PaginatedVariants {
    data: Variant[];
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
    variants: PaginatedVariants;
    product: { id: number; name: string } | null;
    filters: Filters;
}

const fmt = (v: number | string) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
        .format(Number(v)).replace('Rp', 'Rp ');

export default function ProductVariantsIndex({ variants, product, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const allSelected = variants.data.length > 0 && selected.length === variants.data.length;

    const toggleAll = () =>
        setSelected(allSelected ? [] : variants.data.map((v) => v.id));

    const toggleOne = (id: number) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const indexUrl = product ? `/admin/products/${product.id}/variants` : '/admin/product-variants';

    const applyFilter = (key: string, value: string) =>
        router.get(indexUrl, { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });

    const resetFilters = () =>
        router.get(indexUrl, {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const activeCount = variants.data.filter(v => v.is_active).length;
    const inactiveCount = variants.data.filter(v => !v.is_active).length;
    const lowStockCount = variants.data.filter(v => v.available_stock > 0 && v.available_stock <= 5).length;

    const stats = [
        {
            title: 'Total Variants',
            val: variants.total,
            sub: 'registered',
            icon: Package,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            cardBg: 'bg-gradient-to-br from-[#422d25] to-[#2a1c17] text-white',
            valColor: 'text-white',
            titleColor: 'text-white/90',
            subColor: 'text-white/60',
            featured: true,
        },
        {
            title: 'Active',
            val: activeCount,
            sub: 'variants active',
            icon: Box,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            cardBg: 'bg-white',
            valColor: 'text-zinc-900',
            titleColor: 'text-zinc-600',
            subColor: 'text-zinc-400',
            accent: 'from-emerald-400 to-emerald-500',
        },
        {
            title: 'Inactive',
            val: inactiveCount,
            sub: 'variants inactive',
            icon: XCircle,
            iconBg: 'bg-zinc-100',
            iconColor: 'text-zinc-600',
            cardBg: 'bg-white',
            valColor: 'text-zinc-900',
            titleColor: 'text-zinc-600',
            subColor: 'text-zinc-400',
            accent: 'from-zinc-400 to-zinc-500',
        },
        {
            title: 'Low Stock',
            val: lowStockCount,
            sub: '= 5 items available',
            icon: SlidersHorizontal,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
            cardBg: 'bg-white',
            valColor: 'text-zinc-900',
            titleColor: 'text-zinc-600',
            subColor: 'text-zinc-400',
            accent: 'from-rose-400 to-rose-500',
        },
    ];

    return (
        <>
            <Head title={product ? `${product.name} Variants` : 'Product Variants'} />

            <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                    <div>
                        <p className='text-[11px] font-bold uppercase tracking-widest text-[#422d25]/50 mb-1'>Catalog Management</p>
                        <h1 className='text-3xl font-serif text-zinc-900 leading-tight'>{product ? `${product.name} Variants` : 'Product Variants'}</h1>
                        <p className='text-sm text-zinc-400 mt-1'>Manage variant SKUs, colors, sizes, and stock availability.</p>
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                        <Link href={`/admin/product-variants/create${product ? `?product_id=${product.id}` : ''}`}>
                            <Button size='sm' className='h-9 bg-[#422d25] hover:bg-[#34231d] text-white gap-1.5 shadow-sm'>
                                <Plus className='w-3.5 h-3.5' /> Add Variant
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
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
                                placeholder='Search SKU, product...'
                                className='pl-9 h-9 border-zinc-200 bg-white rounded-lg text-sm shadow-sm'
                            />
                        </div>

                        <FilterSelect label='Status' value={filters.status || 'all'} onChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value='active'>Active</SelectItem>
                            <SelectItem value='inactive'>Inactive</SelectItem>
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

                    {/* Table */}
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-left'>
                            <thead className='text-xs text-zinc-500 bg-zinc-50/50 border-b border-zinc-100'>
                                <tr>
                                    <th className='px-5 py-3 font-medium'>
                                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} className='rounded border-zinc-300' />
                                    </th>
                                    <th className='px-5 py-3 font-medium'>Variant Info</th>
                                    <th className='px-5 py-3 font-medium'>Color / Size</th>
                                    <th className='px-5 py-3 font-medium'>Pricing Add.</th>
                                    <th className='px-5 py-3 font-medium'>Stock Summary</th>
                                    <th className='px-5 py-3 font-medium'>Status</th>
                                    <th className='px-5 py-3 font-medium text-right'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-zinc-100'>
                                {variants.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className='px-5 py-8 text-center text-zinc-500'>
                                            <div className='flex flex-col items-center justify-center gap-2'>
                                                <Package className='w-8 h-8 text-zinc-300' />
                                                <p>No variants found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {variants.data.map((v) => {
                                    return (
                                        <tr key={v.id} className='group hover:bg-zinc-50/50 transition-colors'>
                                            <td className='px-5 py-3'>
                                                <Checkbox
                                                    checked={selected.includes(v.id)}
                                                    onCheckedChange={() => toggleOne(v.id)}
                                                    className='rounded border-zinc-300 data-[state=checked]:bg-[#422d25]'
                                                />
                                            </td>
                                            <td className='px-5 py-3'>
                                                <div className='flex items-center gap-3'>
                                                    {v.image_url ? (
                                                        <img src={v.image_url} alt={v.sku} className='w-10 h-10 rounded-lg object-cover border border-zinc-200' />
                                                    ) : (
                                                        <div className='w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center border border-zinc-200'>
                                                            <LayoutGrid className='w-4 h-4 text-zinc-400' />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className='font-medium text-zinc-900'>{v.sku}</p>
                                                        <p className='text-xs text-zinc-500 max-w-[150px] truncate' title={v.product || ''}>{v.product || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-5 py-3'>
                                                <div className='flex flex-col gap-1'>
                                                    <div className='flex items-center gap-2'>
                                                        {v.color_hex && <span className='w-3 h-3 rounded-full border border-zinc-200' style={{ backgroundColor: v.color_hex }} />}
                                                        <span className='text-zinc-700'>{v.color_name || '-'}</span>
                                                    </div>
                                                    <span className='text-xs font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded w-fit'>
                                                        {v.size || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='px-5 py-3'>
                                                <span className='text-zinc-900 font-medium'>{fmt(v.additional_price)}</span>
                                            </td>
                                            <td className='px-5 py-3'>
                                                <div className='flex flex-col gap-1'>
                                                    <span className='text-zinc-900 font-medium'>{v.available_stock} <span className='text-xs text-zinc-500 font-normal'>available</span></span>
                                                    <span className='text-[10px] text-zinc-400'>{v.reserved_stock} reserved / {v.stock} total</span>
                                                </div>
                                            </td>
                                            <td className='px-5 py-3'>
                                                <Badge
                                                    variant='secondary'
                                                    className={v.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}
                                                >
                                                    {v.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className='px-5 py-3 text-right'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant='ghost' size='icon' className='h-8 w-8 text-zinc-400 hover:text-zinc-600'>
                                                            <MoreVertical className='w-4 h-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end' className='w-40'>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-variants/${v.id}/stock-adjustment`} className='w-full flex items-center gap-2'>
                                                                <SlidersHorizontal className='w-3.5 h-3.5' /> Adjust Stock
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/product-variants/${v.id}/edit`} className='w-full flex items-center gap-2'>
                                                                <Edit className='w-3.5 h-3.5' /> Edit Variant
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { if (confirm(`Delete variant ${v.sku}?`)) doAction(`/admin/product-variants/${v.id}`, 'delete'); }}
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
                            {variants.from && variants.to
                                ? `Showing ${variants.from}-${variants.to} of ${variants.total} variants`
                                : 'No variants'}
                        </span>
                        <div className='flex items-center gap-1'>
                            {variants.links.map((link, i) => {
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
                                            'h-8 min-w-8 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center',
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
