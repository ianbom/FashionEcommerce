import { Head, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, PageHeader, Pagination, TableShell } from '@/pages/admin/catalog/shared';
import type { Paginated } from '@/pages/admin/catalog/shared';

type AuditLog = {
    id: number;
    admin: string | null;
    action: string;
    module: string;
    reference_type: string | null;
    reference_id: number | null;
    ip_address: string | null;
    created_at: string | null;
};

type Props = {
    filters: { module?: string; action?: string; date_from?: string; date_to?: string };
    logs: Paginated<AuditLog>;
};

export default function AuditLogsIndex({ filters, logs }: Props) {
    const { data, setData, get, processing } = useForm({
        module: filters.module ?? '',
        action: filters.action ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/audit-logs', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Audit Logs" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Audit & Logs"
                    title="Admin Activity Logs"
                    description="Pantau aksi admin sensitif. Payment, Biteship, dan stock logs tetap tersedia pada menu masing-masing."
                />
                <TableShell title="Activity History" description={`${logs.total} activity tercatat`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-[180px_160px_180px_180px_auto]">
                        <Input value={data.module} onChange={(event) => setData('module', event.target.value)} placeholder="Module" />
                        <select value={data.action} onChange={(event) => setData('action', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All action</option>
                            <option value="post">post</option>
                            <option value="put">put</option>
                            <option value="patch">patch</option>
                            <option value="delete">delete</option>
                        </select>
                        <Input type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
                        <Input type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
                        <Button type="submit" variant="outline" disabled={processing}><Search /> Search</Button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Admin</th><th className="pb-3 pr-4 font-medium">Action</th><th className="pb-3 pr-4 font-medium">Module</th><th className="pb-3 pr-4 font-medium">Reference</th><th className="pb-3 pr-4 font-medium">IP</th><th className="pb-3 pr-4 font-medium">Date</th></tr></thead>
                            <tbody className="divide-y">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">{log.admin ?? '-'}</td>
                                        <td className="py-3 pr-4">{log.action}</td>
                                        <td className="py-3 pr-4">{log.module}</td>
                                        <td className="py-3 pr-4">{log.reference_type ?? '-'}{log.reference_id ? ` #${log.reference_id}` : ''}</td>
                                        <td className="py-3 pr-4">{log.ip_address ?? '-'}</td>
                                        <td className="py-3 pr-4">{log.created_at ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {logs.data.length === 0 ? <EmptyState>Tidak ada activity log.</EmptyState> : null}
                    <Pagination paginator={logs} />
                </TableShell>
            </div>
        </>
    );
}
