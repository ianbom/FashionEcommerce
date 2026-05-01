import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JsonBlock, PageHeader, StatusBadge } from '@/pages/admin/sales/shared';

type Log = {
    id: number;
    order_number: string | null;
    provider: string;
    event_type: string | null;
    transaction_status: string | null;
    processed_at: string | null;
    created_at: string | null;
    payload: unknown;
};

type Props = { log: Log };

export default function PaymentLogShow({ log }: Props) {
    return (
        <>
            <Head title={`Payment Log #${log.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Sales Management" title={`Payment Log #${log.id}`} description="Raw payload payment log untuk audit/debugging." action={<Button asChild variant="outline"><Link href="/admin/payment-logs">Back</Link></Button>} />
                <Card>
                    <CardHeader><CardTitle>{log.event_type ?? '-'}</CardTitle><CardDescription>{log.provider} · {log.order_number ?? '-'}</CardDescription></CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex flex-wrap gap-3 text-sm">
                            <StatusBadge status={log.transaction_status} />
                            <span className="text-muted-foreground">{log.processed_at ?? log.created_at ?? '-'}</span>
                        </div>
                        <JsonBlock value={log.payload} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
