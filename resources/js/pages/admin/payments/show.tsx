import { Head, Link } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, JsonBlock, PageHeader, StatusBadge } from '@/pages/admin/sales/shared';

type Payment = {
    id: number;
    order_id: number;
    order_number: string | null;
    customer: string | null;
    payment_provider: string;
    payment_method: string | null;
    midtrans_order_id: string | null;
    midtrans_transaction_id: string | null;
    midtrans_snap_token: string | null;
    midtrans_redirect_url: string | null;
    gross_amount: string;
    currency: string;
    transaction_status: string | null;
    fraud_status: string | null;
    paid_at: string | null;
    expired_at: string | null;
    raw_response: unknown;
    logs: { id: number; event_type: string | null; transaction_status: string | null; processed_at: string | null; payload: unknown }[];
};

type Props = { payment: Payment };

export default function PaymentShow({ payment }: Props) {
    return (
        <>
            <Head title={`Payment ${payment.midtrans_order_id ?? payment.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title={payment.midtrans_order_id ?? `Payment #${payment.id}`}
                    description="Detail transaksi Midtrans, related order, raw response, dan payment logs."
                    action={<Button asChild><Link href={`/admin/payments/${payment.id}/sync`} method="post" as="button"><RefreshCw /> Sync Status</Link></Button>}
                />
                <div className="grid gap-4 md:grid-cols-4">
                    <Metric label="Amount" value={formatPrice(payment.gross_amount)} />
                    <Metric label="Status" value={<StatusBadge status={payment.transaction_status} />} />
                    <Metric label="Fraud" value={payment.fraud_status ?? '-'} />
                    <Metric label="Method" value={payment.payment_method ?? '-'} />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Payment Summary</CardTitle><CardDescription>{payment.payment_provider}</CardDescription></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Row label="Order" value={<Link className="text-primary underline" href={`/admin/orders/${payment.order_id}`}>{payment.order_number ?? '-'}</Link>} />
                            <Row label="Customer" value={payment.customer ?? '-'} />
                            <Row label="Transaction ID" value={payment.midtrans_transaction_id ?? '-'} />
                            <Row label="Paid At" value={payment.paid_at ?? '-'} />
                            <Row label="Expired At" value={payment.expired_at ?? '-'} />
                            <Row label="Redirect URL" value={payment.midtrans_redirect_url ?? '-'} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Raw Response</CardTitle><CardDescription>Payload terakhir yang tersimpan.</CardDescription></CardHeader>
                        <CardContent><JsonBlock value={payment.raw_response} /></CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader><CardTitle>Payment Logs</CardTitle><CardDescription>{payment.logs.length} event tersimpan.</CardDescription></CardHeader>
                    <CardContent className="grid gap-3">
                        {payment.logs.map((log) => (
                            <div key={log.id} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="font-medium">{log.event_type ?? '-'}</span>
                                    <StatusBadge status={log.transaction_status} />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">{log.processed_at ?? '-'}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
    return <Card><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
