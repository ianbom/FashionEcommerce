import { Head, Link, useForm } from '@inertiajs/react';
import { RefreshCw, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    formatPrice,
    JsonBlock,
    PageHeader,
    StatusBadge,
} from '@/pages/admin/sales/shared';

type Tracking = {
    id: number;
    status: string;
    description: string | null;
    location: string | null;
    happened_at: string | null;
    raw_payload: unknown;
};
type Shipment = {
    id: number;
    order_id: number;
    order_number: string | null;
    customer: string | null;
    waybill_id: string | null;
    label_url: string | null;
    courier_company: string;
    courier_type: string;
    courier_service_name: string | null;
    shipping_cost: string;
    insurance_cost: string;
    shipping_status: string;
    estimated_delivery: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    raw_rate_response: unknown;
    raw_order_response: unknown;
    address: Record<string, string | number | null> | null;
    trackings: Tracking[];
};

type Props = { shipment: Shipment; shippingStatuses: string[] };

export default function ShipmentShow({ shipment, shippingStatuses }: Props) {
    const form = useForm({
        shipping_status: shipment.shipping_status,
        description: '',
        location: '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/admin/shipments/${shipment.id}/status`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Shipment ${shipment.waybill_id ?? shipment.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title={shipment.waybill_id ?? `Shipment #${shipment.id}`}
                    description="Detail shipment, recipient address, tracking timeline, raw Biteship payload, dan label."
                    action={
                        <Button asChild>
                            <Link
                                href={`/admin/shipments/${shipment.id}/refresh-tracking`}
                                method="post"
                                as="button"
                            >
                                <RefreshCw /> Refresh Tracking
                            </Link>
                        </Button>
                    }
                />
                <div className="grid gap-4 md:grid-cols-4">
                    <Metric
                        label="Status"
                        value={
                            <StatusBadge status={shipment.shipping_status} />
                        }
                    />
                    <Metric
                        label="Courier"
                        value={`${shipment.courier_company} ${shipment.courier_type}`}
                    />
                    <Metric
                        label="Cost"
                        value={formatPrice(shipment.shipping_cost)}
                    />
                    <Metric
                        label="ETA"
                        value={shipment.estimated_delivery ?? '-'}
                    />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Summary</CardTitle>
                            <CardDescription>
                                {shipment.order_number ?? '-'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Row
                                label="Order"
                                value={
                                    <Link
                                        className="text-primary underline"
                                        href={`/admin/orders/${shipment.order_id}`}
                                    >
                                        {shipment.order_number ?? '-'}
                                    </Link>
                                }
                            />
                            <Row
                                label="Customer"
                                value={shipment.customer ?? '-'}
                            />
                            <Row
                                label="Service"
                                value={shipment.courier_service_name ?? '-'}
                            />
                            <Row
                                label="Shipped At"
                                value={shipment.shipped_at ?? '-'}
                            />
                            <Row
                                label="Delivered At"
                                value={shipment.delivered_at ?? '-'}
                            />
                            {shipment.label_url ? (
                                <a
                                    href={shipment.label_url}
                                    target="_blank"
                                    className="text-sm font-medium text-primary underline"
                                >
                                    Open shipping label
                                </a>
                            ) : null}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipient Address</CardTitle>
                            <CardDescription>
                                Snapshot alamat order.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Row
                                label="Recipient"
                                value={String(
                                    shipment.address?.recipient_name ?? '-',
                                )}
                            />
                            <Row
                                label="Phone"
                                value={String(
                                    shipment.address?.recipient_phone ?? '-',
                                )}
                            />
                            <Row
                                label="City"
                                value={String(shipment.address?.city ?? '-')}
                            />
                            <Row
                                label="Address"
                                value={String(
                                    shipment.address?.full_address ?? '-',
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Shipment Status</CardTitle>
                        <CardDescription>
                            Update status manual dan simpan timeline event.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_auto]"
                        >
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <select
                                    value={form.data.shipping_status}
                                    onChange={(event) =>
                                        form.setData(
                                            'shipping_status',
                                            event.target.value,
                                        )
                                    }
                                    className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                >
                                    {shippingStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Location</Label>
                                <Input
                                    value={form.data.location}
                                    onChange={(event) =>
                                        form.setData(
                                            'location',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    <Save /> Save
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Tracking Timeline</CardTitle>
                        <CardDescription>
                            {shipment.trackings.length} event tracking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {shipment.trackings.map((tracking) => (
                            <div
                                key={tracking.id}
                                className="rounded-lg border p-4 text-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-medium">
                                        {tracking.status}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {tracking.happened_at ?? '-'}
                                    </span>
                                </div>
                                <p className="mt-1 text-muted-foreground">
                                    {tracking.description ?? '-'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {tracking.location ?? '-'}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw Rate Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <JsonBlock value={shipment.raw_rate_response} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw Order Response</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <JsonBlock value={shipment.raw_order_response} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
