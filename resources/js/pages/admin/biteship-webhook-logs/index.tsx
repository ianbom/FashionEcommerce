import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated } from '@/pages/admin/sales/shared';
import { PageHeader, Pagination, TableShell } from '@/pages/admin/sales/shared';

type Log = {
    id: number;
    event_type: string | null;
    biteship_order_id: string | null;
    biteship_tracking_id: string | null;
    waybill_id: string | null;
    processed_at: string | null;
    created_at: string | null;
};

type Props = { logs: Paginated<Log>; filters: Record<string, string> };

export default function BiteshipWebhookLogsIndex({ logs, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        event_type: filters.event_type ?? '',
        waybill_id: filters.waybill_id ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/biteship-webhook-logs', {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Biteship Webhook Logs" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title="Biteship Webhook Logs"
                    description="Audit webhook Biteship untuk tracking dan status pengiriman."
                />
                <TableShell
                    title="Webhook Logs"
                    description={`${logs.total} Biteship webhook log`}
                >
                    <form
                        onSubmit={submit}
                        className="mb-4 grid gap-3 md:grid-cols-4"
                    >
                        <Input
                            value={data.event_type}
                            onChange={(event) =>
                                setData('event_type', event.target.value)
                            }
                            placeholder="Event type"
                        />
                        <Input
                            value={data.waybill_id}
                            onChange={(event) =>
                                setData('waybill_id', event.target.value)
                            }
                            placeholder="Waybill ID"
                        />
                        <Input
                            type="date"
                            value={data.date_from}
                            onChange={(event) =>
                                setData('date_from', event.target.value)
                            }
                        />
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={data.date_to}
                                onChange={(event) =>
                                    setData('date_to', event.target.value)
                                }
                            />
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                            >
                                <Search />
                            </Button>
                        </div>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pr-4 pb-3 font-medium">
                                        Event
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Waybill
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Biteship IDs
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Processed
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.data.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="py-3 pr-4">
                                            {log.event_type ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {log.waybill_id ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                                            {log.biteship_order_id ?? '-'} /{' '}
                                            {log.biteship_tracking_id ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {log.processed_at ??
                                                log.created_at ??
                                                '-'}
                                        </td>
                                        <td className="py-3 text-right">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={`/admin/biteship-webhook-logs/${log.id}`}
                                                >
                                                    <Eye /> View
                                                </Link>
                                            </Button>
                                        </td>
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
