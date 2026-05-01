import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActiveBadge, formatPrice, PageHeader } from '@/pages/admin/marketing/shared';
import { StatusBadge } from '@/pages/admin/sales/shared';

type Address = {
    id: number;
    customer: string | null;
    customer_email: string | null;
    recipient_name: string;
    recipient_phone: string;
    label: string | null;
    province: string;
    city: string;
    district: string;
    subdistrict: string | null;
    postal_code: string;
    full_address: string;
    note: string | null;
    is_default: boolean;
    orders_count: number;
    orders: { id: number; order_number: string; grand_total: string; order_status: string; created_at: string | null }[];
};

type Props = { address: Address };

export default function CustomerAddressShow({ address }: Props) {
    return (
        <>
            <Head title={`Address ${address.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Customer Management"
                    title={address.label ?? address.recipient_name}
                    description={`${address.customer ?? '-'} · ${address.city}, ${address.province}`}
                    action={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/admin/customer-addresses"><ArrowLeft /> Back</Link></Button><Button asChild><Link href={`/admin/customer-addresses/${address.id}/edit`}><Edit /> Edit</Link></Button></div>}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Address Detail</CardTitle><CardDescription>{address.is_default ? <ActiveBadge active /> : 'Secondary address'}</CardDescription></CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Row label="Recipient" value={address.recipient_name} />
                            <Row label="Phone" value={address.recipient_phone} />
                            <Row label="Province" value={address.province} />
                            <Row label="City" value={address.city} />
                            <Row label="District" value={address.district} />
                            <Row label="Subdistrict" value={address.subdistrict ?? '-'} />
                            <Row label="Postal Code" value={address.postal_code} />
                            <Row label="Full Address" value={address.full_address} />
                            <Row label="Note" value={address.note ?? '-'} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Related Orders</CardTitle><CardDescription>{address.orders_count} order memakai alamat ini</CardDescription></CardHeader>
                        <CardContent className="grid gap-3">
                            {address.orders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                                    <div><Link className="font-medium text-primary underline" href={`/admin/orders/${order.id}`}>{order.order_number}</Link><div className="text-xs text-muted-foreground">{order.created_at ?? '-'}</div></div>
                                    <div className="text-right"><div>{formatPrice(order.grand_total)}</div><StatusBadge status={order.order_status} /></div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return <div className="grid gap-1"><span className="text-xs text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
