import { Head, Link, router } from '@inertiajs/react';
import {
    Archive, AlertTriangle, Ban, CheckCircle2, ChevronLeft, ChevronRight,
    Download, Eye, FileText, MoreVertical, Pencil, Plus, RotateCcw,
    Search, ShoppingBag, Trash2, Upload, X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    return { label: 'Standard', cls: 'text-zinc-600 border-zinc-200 bg-zinc-50' };
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

    const stats = [
        { title: 'Total Products', val: products.total, sub: '', icon: ShoppingBag, color: 'text-zinc-600', bg: 'bg-zinc-100/50' },
        { title: 'Published', val: products.data.filter(p => p.status === 'published').length, sub: 'of current page', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Draft', val: products.data.filter(p => p.status === 'draft').length, sub: 'of current page', icon: FileText, color: 'text-zinc-600', bg: 'bg-zinc-100/50' },
        { title: 'Archived', val: products.data.filter(p => p.status === 'archived').length, sub: 'of current page', icon: Archive, color: 'text-zinc-600', bg: 'bg-zinc-100/50' },
        { title: 'Low Stock', val: products.data.filter(p => p.total_stock > 0 && p.total_stock <= 5).length, sub: 'of current page', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Out of Stock', val: products.data.filter(p => p.total_stock === 0).length, sub: 'of current page', icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <>
            <Head title="Products" />
            <div className="flex flex-col gap-6 p-6 mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={'/admin/dashboard'}>Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-zinc-500">Products</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-serif text-zinc-900 mb-1">Products</h1>
                        <p className="text-sm text-zinc-500">Manage your modest fashion product catalog, inventory, pricing, and visibility.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="text-zinc-700 bg-white shadow-sm rounded-lg hover:bg-zinc-50">
                            <Download className="w-4 h-4 mr-2" /> Import Products
                        </Button>
                        <Button variant="outline" className="text-zinc-700 bg-white shadow-sm rounded-lg hover:bg-zinc-50">
                            <Upload className="w-4 h-4 mr-2" /> Export
                        </Button>
                        <Link href="/admin/products/create">
                            <Button className="bg-[#422d25] hover:bg-[#34231d] text-white rounded-lg shadow-md transition-all duration-300">
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.map((m, i) => (
                        <Card key={i} className="border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
                            <CardContent className="p-5 flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-medium text-zinc-500">{m.title}</span>
                                    <div className={`p-1.5 rounded-md ${m.bg}`}>
                                        <m.icon className={`w-4 h-4 ${m.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl font-serif text-zinc-900 mt-1">{m.val}</div>
                                <div className="text-[11px] mt-1 text-zinc-400">{m.sub}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Table Area */}
                <div className="bg-white border border-zinc-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    {/* Filters */}
                    <form onSubmit={handleSearch} className="p-4 border-b border-zinc-100 flex flex-wrap items-end gap-3 bg-zinc-50/50">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search product name, SKU, or slug"
                                className="pl-9 h-10 border-zinc-200 bg-white rounded-lg shadow-sm"
                            />
                        </div>

                        <div className="w-[140px]">
                            <label className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-1 block px-1">Category</label>
                            <Select value={filters.category_id || 'all'} onValueChange={(v) => applyFilter('category_id', v === 'all' ? '' : v)}>
                                <SelectTrigger className="h-9 border-zinc-200 bg-white shadow-sm text-xs">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {options.categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[150px]">
                            <label className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-1 block px-1">Collection</label>
                            <Select value={filters.collection_id || 'all'} onValueChange={(v) => applyFilter('collection_id', v === 'all' ? '' : v)}>
                                <SelectTrigger className="h-9 border-zinc-200 bg-white shadow-sm text-xs">
                                    <SelectValue placeholder="All Collections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Collections</SelectItem>
                                    {options.collections.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[130px]">
                            <label className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-1 block px-1">Status</label>
                            <Select value={filters.status || 'all'} onValueChange={(v) => applyFilter('status', v === 'all' ? '' : v)}>
                                <SelectTrigger className="h-9 border-zinc-200 bg-white shadow-sm text-xs">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {options.statuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[130px]">
                            <label className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 mb-1 block px-1">Stock</label>
                            <Select value={filters.stock_status || 'all'} onValueChange={(v) => applyFilter('stock_status', v === 'all' ? '' : v)}>
                                <SelectTrigger className="h-9 border-zinc-200 bg-white shadow-sm text-xs">
                                    <SelectValue placeholder="All Stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stock</SelectItem>
                                    <SelectItem value="in_stock">In Stock</SelectItem>
                                    <SelectItem value="low_stock">Low Stock</SelectItem>
                                    <SelectItem value="sold_out">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" variant="outline" className="h-9 text-xs bg-white border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900">
                            <Search className="w-3.5 h-3.5 mr-2" /> Search
                        </Button>
                        <Button type="button" variant="outline" onClick={resetFilters} className="h-9 text-xs bg-white border-zinc-200 shadow-sm text-zinc-600 hover:text-zinc-900">
                            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                        </Button>
                    </form>

                    {/* Bulk Actions */}
                    {selected.length > 0 && (
                        <div className="p-3 px-4 border-b border-zinc-100 bg-[#fdfaf8] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-[#422d25]">{selected.length} products selected</span>
                                <div className="h-4 w-px bg-zinc-200" />
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Publish Selected
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-700">
                                    <Archive className="w-3.5 h-3.5 mr-1.5" /> Archive Selected
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Selected
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={() => setSelected([])}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <Checkbox checked={allSelected} onCheckedChange={toggleAll}
                                            className="data-[state=checked]:bg-[#422d25] border-zinc-300" />
                                    </th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Product</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">SKU</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Category</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Collection</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Price</th>
                                    <th className="px-4 py-3 font-medium tracking-wider text-center">Variants</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Stock</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Status</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Visibility</th>
                                    <th className="px-4 py-3 font-medium tracking-wider">Created At</th>
                                    <th className="px-4 py-3 font-medium tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="text-center py-16 text-zinc-400 text-sm">
                                            No products found. Try adjusting your filters.
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

                                    return (
                                        <tr key={p.id} className={`hover:bg-zinc-50/50 transition-colors ${isSelected ? 'bg-[#fdfaf8]' : ''}`}>
                                            <td className="px-4 py-4">
                                                <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(p.id)}
                                                    className={`${isSelected ? 'data-[state=checked]:bg-[#422d25] border-[#422d25]' : 'border-zinc-300'}`} />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                                                        {p.thumbnail
                                                            ? <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center text-zinc-300"><ShoppingBag className="w-5 h-5" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex flex-col min-w-[180px] whitespace-normal">
                                                        <span className="font-semibold text-zinc-900">{p.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-zinc-500 font-mono text-xs">{p.sku ?? <span className="text-zinc-300">No SKU</span>}</td>
                                            <td className="px-4 py-4 text-zinc-600">{p.category ?? '—'}</td>
                                            <td className="px-4 py-4 text-zinc-600">{p.collection ?? '—'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-900">{fmt(p.base_price)}</span>
                                                    {p.sale_price && (
                                                        <span className="text-xs text-zinc-500 mt-0.5">Sale: {fmt(p.sale_price)}</span>
                                                    )}
                                                    {discount && (
                                                        <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100 text-[10px] px-1.5 py-0 rounded mt-1 w-fit">
                                                            {discount}% OFF
                                                        </Badge>
                                                    )}
                                                    {!p.sale_price && <span className="text-xs text-zinc-400 mt-1">No Sale</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-xs">
                                                <span className="font-medium text-zinc-700">{p.variants_count} variants</span>
                                            </td>
                                            <td className="px-4 py-4 text-xs">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        Stock: {p.total_stock}
                                                    </span>
                                                    {isOutOfStock && <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 w-fit rounded text-[10px] px-1.5 py-0.5">Out of Stock</Badge>}
                                                    {isLowStock && <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 w-fit rounded text-[10px] px-1.5 py-0.5">Low Stock</Badge>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge className={`shadow-none font-medium capitalize ${
                                                    p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' :
                                                    p.status === 'archived' ? 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-100' :
                                                    'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
                                                }`}>{p.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`shadow-none font-medium ${vis.cls}`}>{vis.label}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-zinc-500">{p.created_at ?? '—'}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link href={`/admin/products/${p.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200 hover:bg-white rounded-md">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/products/${p.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200 hover:bg-white rounded-md">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200 hover:bg-white rounded-md">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-zinc-100">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/products/${p.id}`} className="w-full">View Detail</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/products/${p.id}/edit`} className="w-full">Edit Product</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/products/${p.id}/variants`} className="w-full">Manage Variants</Link>
                                                            </DropdownMenuItem>
                                                            {p.status !== 'published' && (
                                                                <DropdownMenuItem onClick={() => doAction(`/admin/products/${p.id}/publish`)} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50">
                                                                    Publish
                                                                </DropdownMenuItem>
                                                            )}
                                                            {p.status !== 'archived' && (
                                                                <DropdownMenuItem onClick={() => doAction(`/admin/products/${p.id}/archive`)} className="text-zinc-600">
                                                                    Archive
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => doAction(`/admin/products/${p.id}/duplicate`)} className="text-zinc-600">
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => { if (confirm(`Delete "${p.name}"?`)) doAction(`/admin/products/${p.id}`, 'delete'); }}
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <span className="text-sm text-zinc-500">
                            {products.from && products.to
                                ? `Showing ${products.from} to ${products.to} of ${products.total} products`
                                : 'No products'}
                        </span>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, i) => {
                                const isChevronLeft = link.label.includes('Previous') || link.label.includes('&laquo;');
                                const isChevronRight = link.label.includes('Next') || link.label.includes('&raquo;');
                                const label = isChevronLeft ? <ChevronLeft className="w-4 h-4" />
                                    : isChevronRight ? <ChevronRight className="w-4 h-4" />
                                    : <span dangerouslySetInnerHTML={{ __html: link.label }} />;

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'ghost'}
                                        size="icon"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`h-8 w-8 rounded-md text-sm ${
                                            link.active ? 'bg-[#422d25] hover:bg-[#34231d] text-white shadow-sm' :
                                            !link.url ? 'text-zinc-300 cursor-not-allowed' :
                                            'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
