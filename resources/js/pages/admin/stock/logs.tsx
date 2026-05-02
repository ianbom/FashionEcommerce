import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight,
    History, RotateCcw, Search, RefreshCw, ShoppingCart, Ban
} from 'lucide-react';
import { useState } from 'react';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StockLog {
    id: number;
    product: string | null;
    variant: string | null;
    type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    reference: string;
    admin: string | null;
    note: string | null;
    created_at: string | null;
}

interface PaginatedLogs {
    data: StockLog[];
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
    type?: string;
}

interface Props {
    logs: PaginatedLogs;
    filters: Filters;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; cls: string; bg: string }> = {
    in:           { label: 'Stock In',      icon: ArrowDownRight, cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    out:          { label: 'Stock Out',     icon: ArrowUpRight,   cls: 'text-rose-700',    bg: 'bg-rose-50 border-rose-100' },
    adjustment:   { label: 'Adjustment',    icon: RefreshCw,      cls: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
    order:        { label: 'Order',         icon: ShoppingCart,   cls: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
    cancellation: { label: 'Cancellation',  icon: Ban,            cls: 'text-purple-700',  bg: 'bg-purple-50 border-purple-100' },
};

export default function StockLogs({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) =>
        router.get('/admin/stock/logs', { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });

    const resetFilters = () =>
        router.get('/admin/stock/logs', {}, { preserveState: false });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    return (
        <>
            <Head title='Stock Logs' />
            <div className='flex flex-col gap-6 p-6 mx-auto w-full'>

                {/* Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end gap-4'>
                    <div>
                        <p className='text-[11px] font-bold uppercase tracking-widest text-[#422d25]/50 mb-1'>Catalog Management</p>
                        <h1 className='text-3xl font-serif text-zinc-900 leading-tight'>Stock Logs</h1>
                        <p className='text-sm text-zinc-400 mt-1'>Audit stock changes, including before/after values, references, and notes.</p>
                    </div>
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
                                placeholder='Search variant SKU...'
                                className='pl-9 h-9 border-zinc-200 bg-white rounded-lg text-sm shadow-sm'
                            />
                        </div>

                        <FilterSelect label='Movement Type' value={filters.type || 'all'} onChange={(v) => applyFilter('type', v === 'all' ? '' : v)}>
                            <SelectItem value='all'>All Types</SelectItem>
                            <SelectItem value='in'>In</SelectItem>
                            <SelectItem value='out'>Out</SelectItem>
                            <SelectItem value='adjustment'>Adjustment</SelectItem>
                            <SelectItem value='order'>Order</SelectItem>
                            <SelectItem value='cancellation'>Cancellation</SelectItem>
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
                            <thead>
                                <tr className='border-b border-zinc-100 bg-zinc-50/60'>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Variant / SKU</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Type</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center'>Quantity</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center'>Before</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center'>After</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Reference / Admin</th>
                                    <th className='px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400'>Date</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-zinc-50'>
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className='flex flex-col items-center justify-center py-20 gap-3'>
                                                <div className='w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center'>
                                                    <History className='w-5 h-5 text-zinc-400' />
                                                </div>
                                                <p className='text-sm text-zinc-400'>No stock logs found. Try adjusting your filters.</p>
                                                <Button size='sm' variant='outline' className='text-xs h-8' onClick={resetFilters}>
                                                    <RotateCcw className='w-3 h-3 mr-1' /> Clear Filters
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {logs.data.map((log) => {
                                    const tc = typeConfig[log.type] ?? { label: log.type, icon: History, cls: 'text-zinc-700', bg: 'bg-zinc-50 border-zinc-200' };
                                    const TypeIcon = tc.icon;
                                    const isPositive = log.quantity > 0;

                                    return (
                                        <tr key={log.id} className='transition-colors hover:bg-zinc-50/70'>
                                            <td className='px-4 py-3.5'>
                                                <div className='flex flex-col'>
                                                    <span className='font-semibold text-zinc-900'>{log.variant ?? '-'}</span>
                                                    <span className='text-xs text-zinc-400'>{log.product ?? '-'}</span>
                                                </div>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ' + tc.cls + ' ' + tc.bg}>
                                                    <TypeIcon className='w-3.5 h-3.5' />
                                                    {tc.label}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5 text-center'>
                                                <span className={'font-semibold ' + (isPositive ? 'text-emerald-600' : log.quantity < 0 ? 'text-red-500' : 'text-zinc-600')}>
                                                    {isPositive ? '+' : ''}{log.quantity}
                                                </span>
                                            </td>

                                            <td className='px-4 py-3.5 text-center text-zinc-500 font-medium'>
                                                {log.stock_before}
                                            </td>

                                            <td className='px-4 py-3.5 text-center font-bold text-zinc-900'>
                                                {log.stock_after}
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <div className='flex flex-col'>
                                                    <span className='text-sm text-zinc-700'>{log.reference}</span>
                                                    {log.admin && <span className='text-xs text-zinc-400'>by {log.admin}</span>}
                                                    {log.note && <span className='text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]' title={log.note}>{log.note}</span>}
                                                </div>
                                            </td>

                                            <td className='px-4 py-3.5'>
                                                <span className='text-xs text-zinc-400 whitespace-nowrap'>
                                                    {log.created_at
                                                        ? new Date(log.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : '-'}
                                                </span>
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
                            {logs.from && logs.to
                                ? 'Showing ' + logs.from + '-' + logs.to + ' of ' + logs.total + ' logs'
                                : 'No logs'}
                        </span>
                        <div className='flex items-center gap-1'>
                            {logs.links.map((link, i) => {
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