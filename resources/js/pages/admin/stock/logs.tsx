import { Head, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    Paginated} from '@/pages/admin/catalog/shared';
import {
    EmptyState,
    PageHeader,
    Pagination,
    TableShell,
} from '@/pages/admin/catalog/shared';

type StockLog = {
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
};

type Props = {
    logs: Paginated<StockLog>;
    filters: { search?: string; type?: string };
};

export default function StockLogs({ logs, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/stock/logs', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Stock Logs" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title="Stock Logs"
                    description="Audit semua perubahan stok, termasuk stock before, stock after, referensi, dan catatan admin."
                />
                <TableShell title="Stock Movement History" description={`${logs.total} log tercatat`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Search variant SKU..." />
                        <select value={data.type} onChange={(event) => setData('type', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All type</option>
                            <option value="in">In</option>
                            <option value="out">Out</option>
                            <option value="adjustment">Adjustment</option>
                            <option value="order">Order</option>
                            <option value="cancellation">Cancellation</option>
                        </select>
                        <Button type="submit" variant="outline" disabled={processing}>
                            <Search />
                            Search
                        </Button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Variant</th>
                                    <th className="pb-3 pr-4 font-medium">Type</th>
                                    <th className="pb-3 pr-4 font-medium">Qty</th>
                                    <th className="pb-3 pr-4 font-medium">Before</th>
                                    <th className="pb-3 pr-4 font-medium">After</th>
                                    <th className="pb-3 pr-4 font-medium">Admin</th>
                                    <th className="pb-3 pr-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{log.variant ?? '-'}</div>
                                            <div className="text-xs text-muted-foreground">{log.product ?? '-'}</div>
                                        </td>
                                        <td className="py-3 pr-4">{log.type}</td>
                                        <td className="py-3 pr-4">{log.quantity}</td>
                                        <td className="py-3 pr-4">{log.stock_before}</td>
                                        <td className="py-3 pr-4">{log.stock_after}</td>
                                        <td className="py-3 pr-4">{log.admin ?? '-'}</td>
                                        <td className="py-3 pr-4">{log.created_at ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {logs.data.length === 0 ? <EmptyState>Tidak ada stock log.</EmptyState> : null}
                    <Pagination paginator={logs} />
                </TableShell>
            </div>
        </>
    );
}
