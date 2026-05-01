import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, Pagination, ReadBadge, TableShell } from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';
import { StatusBadge } from '@/pages/admin/sales/shared';

type Notification = {
    id: number;
    customer: string | null;
    customer_email: string | null;
    title: string;
    message: string;
    type: string;
    reference_type: string | null;
    reference_id: number | null;
    is_read: boolean;
    created_at: string | null;
};

type Props = {
    notifications: Paginated<Notification>;
    filters: Record<string, string>;
    types: string[];
};

export default function NotificationsIndex({ notifications, filters, types }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        read: filters.read ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/notifications', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Notifications" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Customer Management" title="Notifications" description="Pantau dan kirim notifikasi manual untuk customer atau segment customer aktif." action={<Button asChild><Link href="/admin/notifications/create"><Plus /> Send Notification</Link></Button>} />
                <TableShell title="Notification Log" description={`${notifications.total} notification tersimpan`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-4">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Title, message, customer..." />
                        <select value={data.type} onChange={(event) => setData('type', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All type</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <select value={data.read} onChange={(event) => setData('read', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">Read status</option><option value="read">Read</option><option value="unread">Unread</option>
                        </select>
                        <Button type="submit" variant="outline" disabled={processing}><Search /> Filter</Button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Notification</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Type</th><th className="pb-3 pr-4 font-medium">Read</th><th className="pb-3 pr-4 font-medium">Reference</th><th className="pb-3 font-medium">Created</th></tr></thead>
                            <tbody className="divide-y">
                                {notifications.data.map((notification) => (
                                    <tr key={notification.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4"><div className="font-medium">{notification.title}</div><div className="max-w-md truncate text-xs text-muted-foreground">{notification.message}</div></td>
                                        <td className="py-3 pr-4"><div>{notification.customer ?? '-'}</div><div className="text-xs text-muted-foreground">{notification.customer_email ?? '-'}</div></td>
                                        <td className="py-3 pr-4"><StatusBadge status={notification.type} /></td>
                                        <td className="py-3 pr-4"><ReadBadge read={notification.is_read} /></td>
                                        <td className="py-3 pr-4">{notification.reference_type ?? '-'} {notification.reference_id ?? ''}</td>
                                        <td className="py-3">{notification.created_at ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={notifications} />
                </TableShell>
            </div>
        </>
    );
}
