import { Head, Link, router } from '@inertiajs/react';
import {
    Archive, Ban, ChevronLeft, ChevronRight,
    Download, Eye, FileText, MoreVertical, Package, Pencil, Plus, RotateCcw,
    Search, ShoppingBag, Sparkles, Star, Trash2, TrendingDown, Upload, X, Tags
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

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
}

interface PaginatedCategories {
    data: Category[];
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
    categories: PaginatedCategories;
    filters: Filters;
}

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    active:   { label: 'Active',   dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    inactive: { label: 'Inactive', dot: 'bg-zinc-400',    text: 'text-zinc-600',    bg: 'bg-zinc-50 border-zinc-200'     },
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<number[]>([]);

    const allSelected = categories.data.length > 0 && selected.length === categories.data.length;

    const toggleAll = () =>
        setSelected(allSelected ? [] : categories.data.map((c) => c.id));

    const toggleOne = (id: number) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

    const applyFilter = (key: string, value: string) =>
        router.get('/admin/categories', { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });

    const resetFilters = () =>
        router.get('/admin/categories', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    const doAction = (url: string, method: 'post' | 'delete' = 'post') =>
        router[method](url, {}, { preserveScroll: true });

    const activeCount   = categories.data.filter(c => c.is_active).length;
    const inactiveCount = categories.data.filter(c => !c.is_active).length;

    const stats = [
        {
            title: 'Total Categories',
            val: categories.total,
            sub: 'in catalog',
            icon: Tags,
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
            title: 'Active',
            val: activeCount,
            sub: 'visible categories',
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
            title: 'Inactive',
            val: inactiveCount,
            sub: 'hidden categories',
            icon: Archive,
            iconBg: 'bg-zinc-100',
            iconColor: 'text-zinc-500',
            cardBg: 'bg-white',
            subColor: 'text-zinc-400',
            valColor: 'text-zinc-800',
            titleColor: 'text-zinc-700',
            accent: '',
            featured: false,
        },
    ];

    return (
        <>
            <Head title='Categories' />
            <div className='flex flex-col gap-6 p-6 mx-auto w-full'>
                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                    <div>
                        <p className='text-[11px] font-bold uppercase tracking-widest text-[#422d25]/50 mb-1'>Catalog Management</p>
                        <h1 className='text-3xl font-serif text-zinc-900 leading-tight'>Categories</h1>
                        <p className='text-sm text-zinc-400 mt-1'>Manage your product categories and visibility.</p>
                    </div>
                    <div className='flex items-center gap-2 shrink-0'>
                        <Link href='/admin/categories/create'>
                            <Button size='sm' className='h-9 bg-[#422d25] hover:bg-[#34231d] text-white gap-1.5 shadow-sm'>
                                <Plus className='w-3.5 h-3.5' /> Add Category
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
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
                                placeholder='Search categories...'
                                className='pl-9 h-9 border-zinc-200 bg-white rounded-lg text-sm shadow-sm'
                            />
                        </div>

                        <FilterSelect label='Status' value={filters.status || 'all'} onChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value='1'>Active</SelectItem>
                            <SelectItem value='0'>Inactive</SelectItem>
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
                                <Button size='sm' variant='outline' className='h-7 text-xs border-red-100 text-red-600 hover:bg-red-50 gap-1' onClick={() => { if (confirm('Delete ' + selected.length + ' categories?')) doAction('/admin/categories/bulk-delete', 'delete'); }}>
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
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Category</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center'>Products</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Status</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Created</th>
                                    <th className='px-4 py-3 w-10'></th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-zinc-50'>
                                {categories.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className='flex flex-col items-center justify-center py-20 gap-3'>
                                                <div className='w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center'>
                                                    <Tags className='w-5 h-5 text-zinc-400' />
                                                </div>
                                                <p className='text-sm text-zinc-400'>No categories found. Try adjusting your filters.</p>
                                                <Button size='sm' variant='outline' className='text-xs h-8' onClick={resetFilters}>
                                                    <RotateCcw className='w-3 h-3 mr-1' /> Clear Filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {categories.data.map((c) => {
                                    const isSelected = selected.includes(c.id);
                                    const sc = statusConfig[c.is_active ? 'active' : 'inactive'];

                                    return (
                                        <tr
                                            key={c.id}
                                            className={'transition-colors hover:bg-zinc-50/70 ' + (isSelected ? 'bg-[#fdfaf8]' : '')}
                                        >
                                            <td className='px-4 py-3.5'>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleOne(c.id)}
                                                    className={isSelected ? 'data-[state=checked]:bg-[#422d25] border-[#422d25]' : 'border-zinc-300'}
                                                />
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0'>
                                                        {c.image_url
                                                            ? <img src={c.image_url} alt={c.name} className='w-full h-full object-cover' />
                                                            : <div className='w-full h-full flex items-center justify-center'><Tags className='w-4 h-4 text-zinc-300' /></div>
                                                        }
                                                    </div>
                                                    <div className='min-w-[160px]'>
                                                        <Link href={'/admin/categories/' + c.id + '/edit'} className='font-semibold text-zinc-900 hover:text-[#422d25] transition-colors line-clamp-1'>
                                                            {c.name}
                                                        </Link>
                                                        <span className='block text-xs text-zinc-400 mt-0.5'>{c.slug}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='px-4 py-3.5 text-center'>
                                                <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-semibold'>
                                                    {c.products_count}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ' + sc.text + ' ' + sc.bg}>
                                                    <span className={'w-1.5 h-1.5 rounded-full ' + sc.dot} />
                                                    {sc.label}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className='text-xs text-zinc-400 whitespace-nowrap'>
                                                    {c.created_at
                                                        ? new Date(c.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
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
                                                            <Link href={'/admin/categories/' + c.id + '/edit'} className='w-full flex items-center gap-2'>
                                                                <Pencil className='w-3.5 h-3.5' /> Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { if (confirm('Delete ' + c.name + '?')) doAction('/admin/categories/' + c.id, 'delete'); }}
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
                            {categories.from && categories.to
                                ? 'Showing ' + categories.from + '-' + categories.to + ' of ' + categories.total + ' categories'
                                : 'No categories'}
                        </span>
                        <div className='flex items-center gap-1'>
                            {categories.links.map((link, i) => {
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
