import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { JsonBlock, PageHeader } from '@/pages/admin/sales/shared';

type Log = {
    id: number;
    event_type: string | null;
    waybill_id: string | null;
    biteship_order_id: string | null;
    biteship_tracking_id: string | null;
    processed_at: string | null;
    payload: unknown;
};

type Props = { log: Log };

export default function BiteshipWebhookLogShow({ log }: Props) {
    return (
        <>
            <Head title={`Biteship Webhook #${log.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title={`Biteship Webhook #${log.id}`}
                    description="Raw payload Biteship webhook untuk audit/debugging."
                    action={
                        <Button asChild variant="outline">
                            <Link href="/admin/biteship-webhook-logs">
                                Back
                            </Link>
                        </Button>
                    }
                />
                <Card>
                    <CardHeader>
                        <CardTitle>{log.event_type ?? '-'}</CardTitle>
                        <CardDescription>
                            {log.waybill_id ?? '-'} · {log.processed_at ?? '-'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JsonBlock value={log.payload} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
