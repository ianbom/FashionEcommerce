import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated} from '@/pages/admin/sales/shared';
import { PageHeader, Pagination, StatusBadge, TableShell } from '@/pages/admin/sales/shared';

type Log = {
    id: number;
    order_number: string | null;
    provider: string;
    event_type: string | null;
    transaction_status: string | null;
    processed_at: string | null;
    created_at: string | null;
};

type Props = {
    logs: Paginated<Log>;
    filters: Record<string, string>;
};

export default function PaymentLogsIndex({ logs, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        provider: filters.provider ?? '',
        transaction_status: filters.transaction_status ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/payment-logs', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Payment Logs" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Sales Management" title="Payment Logs" description="Audit webhook/payment notification Midtrans. Data read-only untuk debugging." />
                <TableShell title="Webhook Logs" description={`${logs.total} payment log`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-5">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Order number" />
                        <Input value={data.provider} onChange={(event) => setData('provider', event.target.value)} placeholder="Provider" />
                        <Input value={data.transaction_status} onChange={(event) => setData('transaction_status', event.target.value)} placeholder="Status" />
                        <Input type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
                        <div className="flex gap-2">
                            <Input type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
                            <Button type="submit" variant="outline" disabled={processing}><Search /></Button>
                        </div>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Order</th><th className="pb-3 pr-4 font-medium">Provider</th><th className="pb-3 pr-4 font-medium">Event</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Processed</th><th className="pb-3 text-right font-medium">Action</th></tr></thead>
                            <tbody className="divide-y">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">{log.order_number ?? '-'}</td>
                                        <td className="py-3 pr-4">{log.provider}</td>
                                        <td className="py-3 pr-4">{log.event_type ?? '-'}</td>
                                        <td className="py-3 pr-4"><StatusBadge status={log.transaction_status} /></td>
                                        <td className="py-3 pr-4">{log.processed_at ?? log.created_at ?? '-'}</td>
                                        <td className="py-3 text-right"><Button asChild variant="outline" size="sm"><Link href={`/admin/payment-logs/${log.id}`}><Eye /> View</Link></Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={logs} />
                </TableShell>
            </div>
        </>
    );
}
