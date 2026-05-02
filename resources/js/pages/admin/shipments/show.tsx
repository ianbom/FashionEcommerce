import { Head, Link, useForm } from '@inertiajs/react';
import { PackagePlus, Printer, RefreshCw, Save } from 'lucide-react';
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
    biteship_order_id: string | null;
    biteship_tracking_id: string | null;
    raw_rate_response: unknown;
    raw_order_response: unknown;
    address: Record<string, string | number | null> | null;
    order?: {
        order_number?: string | null;
        customer_name?: string | null;
        customer_phone?: string | null;
        shipping_cost?: string | number | null;
        items?: {
            product_name?: string | null;
            quantity?: number | null;
            weight?: number | null;
            length?: number | null;
            width?: number | null;
            height?: number | null;
        }[];
    } | null;
    trackings: Tracking[];
};

type Props = { shipment: Shipment; shippingStatuses: string[] };

function getLabelUrl(shipment: Shipment): string | null {
    return shipment.label_url || null;
}

function text(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function printBiteshipLabel(shipment: Shipment) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (!printWindow) {
        window.print();

        return;
    }

    const items = shipment.order?.items ?? [];
    const totalWeight = items.reduce(
        (sum, item) => sum + Number(item.weight ?? 0),
        0,
    );
    const itemRows = items
        .map(
            (item) => `
                <tr>
                    <td>${text(item.product_name)}</td>
                    <td>${text(item.quantity)}</td>
                    <td>${text(item.weight)} gr</td>
                    <td>${text(item.length)} x ${text(item.width)} x ${text(item.height)} cm</td>
                </tr>
            `,
        )
        .join('');

    printWindow.document.write(`
        <!doctype html>
        <html>
            <head>
                <title>Resi ${text(shipment.waybill_id ?? shipment.order_number ?? shipment.id)}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { margin: 0; background: #f4f4f5; color: #18181b; font-family: Arial, sans-serif; }
                    .page { width: 148mm; min-height: 210mm; margin: 16px auto; background: #fff; padding: 18mm; }
                    .header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #18181b; padding-bottom: 12px; }
                    .brand { font-size: 20px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
                    .muted { color: #71717a; font-size: 12px; }
                    .waybill { border: 2px solid #18181b; padding: 10px 14px; text-align: center; min-width: 190px; }
                    .waybill-label { font-size: 11px; color: #71717a; text-transform: uppercase; }
                    .waybill-value { margin-top: 4px; font-family: monospace; font-size: 20px; font-weight: 800; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
                    .box { border: 1px solid #d4d4d8; padding: 12px; min-height: 110px; }
                    .box-title { margin-bottom: 8px; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: #52525b; }
                    .line { margin: 3px 0; font-size: 13px; line-height: 1.4; }
                    .section { margin-top: 16px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #d4d4d8; padding: 8px; text-align: left; vertical-align: top; }
                    th { background: #f4f4f5; font-size: 11px; text-transform: uppercase; color: #52525b; }
                    .footer { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                    .signature { height: 76px; border: 1px dashed #a1a1aa; padding: 10px; font-size: 12px; color: #71717a; }
                    @media print { body { background: #fff; } .page { margin: 0; width: auto; min-height: auto; box-shadow: none; } }
                </style>
            </head>
            <body>
                <main class="page">
                    <section class="header">
                        <div>
                            <div class="brand">Biteship Shipment Label</div>
                            <div class="muted">Generated from admin shipment detail</div>
                            <div class="line"><strong>Order:</strong> ${text(shipment.order_number ?? shipment.order?.order_number)}</div>
                        </div>
                        <div class="waybill">
                            <div class="waybill-label">Waybill / Resi</div>
                            <div class="waybill-value">${text(shipment.waybill_id)}</div>
                        </div>
                    </section>

                    <section class="grid">
                        <div class="box">
                            <div class="box-title">Courier</div>
                            <div class="line"><strong>${text(shipment.courier_company).toUpperCase()}</strong> ${text(shipment.courier_type)}</div>
                            <div class="line">Service: ${text(shipment.courier_service_name)}</div>
                            <div class="line">Tracking ID: ${text(shipment.biteship_tracking_id)}</div>
                            <div class="line">Biteship Order ID: ${text(shipment.biteship_order_id)}</div>
                        </div>
                        <div class="box">
                            <div class="box-title">Package</div>
                            <div class="line">Total weight: ${text(totalWeight)} gr</div>
                            <div class="line">Shipping cost: ${text(shipment.shipping_cost)}</div>
                            <div class="line">ETA: ${text(shipment.estimated_delivery)}</div>
                            <div class="line">Status: ${text(shipment.shipping_status)}</div>
                        </div>
                    </section>

                    <section class="grid">
                        <div class="box">
                            <div class="box-title">Sender</div>
                            <div class="line"><strong>Store / Admin</strong></div>
                            <div class="line">Use origin address configured in Biteship/admin settings.</div>
                        </div>
                        <div class="box">
                            <div class="box-title">Recipient</div>
                            <div class="line"><strong>${text(shipment.address?.recipient_name ?? shipment.order?.customer_name)}</strong></div>
                            <div class="line">${text(shipment.address?.recipient_phone ?? shipment.order?.customer_phone)}</div>
                            <div class="line">${text(shipment.address?.full_address)}</div>
                            <div class="line">${text(shipment.address?.city)} ${text(shipment.address?.postal_code)}</div>
                        </div>
                    </section>

                    <section class="section">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Weight</th>
                                    <th>Dimension</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows || '<tr><td colspan="4">No item data.</td></tr>'}
                            </tbody>
                        </table>
                    </section>

                    <section class="footer">
                        <div class="signature">Sender signature</div>
                        <div class="signature">Courier signature</div>
                    </section>
                </main>
                <script>window.onload = () => { window.print(); };</script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

export default function ShipmentShow({ shipment, shippingStatuses }: Props) {
    const form = useForm({
        shipping_status: shipment.shipping_status,
        description: '',
        location: '',
    });
    const createOrderForm = useForm({
        courier_company: shipment.courier_company ?? '',
        courier_type: shipment.courier_type ?? '',
        courier_service_name: shipment.courier_service_name ?? '',
        waybill_id: shipment.waybill_id ?? '',
        estimated_delivery: shipment.estimated_delivery ?? '',
    });
    const createOrderError = (createOrderForm.errors as Record<string, string>)
        .shipment;
    const labelUrl = getLabelUrl(shipment);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/admin/shipments/${shipment.id}/status`, {
            preserveScroll: true,
        });
    };
    const createBiteshipOrder = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createOrderForm.post(`/admin/orders/${shipment.order_id}/shipments`, {
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
                        <div className="flex flex-wrap items-center gap-2">
                            {labelUrl && (
                                <Button asChild variant="outline">
                                    <a
                                        href={labelUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Printer /> Cetak Resi Biteship
                                    </a>
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => printBiteshipLabel(shipment)}
                            >
                                <Printer /> Cetak Resi Biteship
                            </Button>
                            <Button asChild>
                                <Link
                                    href={`/admin/shipments/${shipment.id}/refresh-tracking`}
                                    method="post"
                                    as="button"
                                >
                                    <RefreshCw /> Refresh Tracking
                                </Link>
                            </Button>
                        </div>
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
                {!shipment.biteship_order_id && (
                    <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackagePlus className="size-5" /> Create Biteship Order
                            </CardTitle>
                            <CardDescription>
                                Shipment ini belum punya Biteship order ID. Submit
                                form ini untuk membuat order pickup ke Biteship API.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={createBiteshipOrder}
                                className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
                            >
                                <Field
                                    label="Courier Company"
                                    value={createOrderForm.data.courier_company}
                                    error={
                                        createOrderForm.errors.courier_company
                                    }
                                    placeholder="jne"
                                    onChange={(value) =>
                                        createOrderForm.setData(
                                            'courier_company',
                                            value,
                                        )
                                    }
                                />
                                <Field
                                    label="Courier Type"
                                    value={createOrderForm.data.courier_type}
                                    error={createOrderForm.errors.courier_type}
                                    placeholder="reg"
                                    onChange={(value) =>
                                        createOrderForm.setData(
                                            'courier_type',
                                            value,
                                        )
                                    }
                                />
                                <Field
                                    label="Service Name"
                                    value={
                                        createOrderForm.data
                                            .courier_service_name
                                    }
                                    error={
                                        createOrderForm.errors
                                            .courier_service_name
                                    }
                                    placeholder="JNE Reguler"
                                    onChange={(value) =>
                                        createOrderForm.setData(
                                            'courier_service_name',
                                            value,
                                        )
                                    }
                                />
                                <Field
                                    label="Waybill ID"
                                    value={createOrderForm.data.waybill_id}
                                    error={createOrderForm.errors.waybill_id}
                                    placeholder="Opsional"
                                    onChange={(value) =>
                                        createOrderForm.setData(
                                            'waybill_id',
                                            value,
                                        )
                                    }
                                />
                                <Field
                                    label="Estimated Delivery"
                                    value={
                                        createOrderForm.data.estimated_delivery
                                    }
                                    error={
                                        createOrderForm.errors
                                            .estimated_delivery
                                    }
                                    placeholder="2-3 days"
                                    onChange={(value) =>
                                        createOrderForm.setData(
                                            'estimated_delivery',
                                            value,
                                        )
                                    }
                                />
                                {createOrderError && (
                                    <p className="text-sm text-destructive md:col-span-2 xl:col-span-5">
                                        {createOrderError}
                                    </p>
                                )}
                                <div className="flex items-end">
                                    <Button
                                        type="submit"
                                        disabled={createOrderForm.processing}
                                        className="w-full"
                                    >
                                        <PackagePlus />
                                        {createOrderForm.processing
                                            ? 'Creating...'
                                            : 'Create Order'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
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
                                label="Biteship Order ID"
                                value={shipment.biteship_order_id ?? '-'}
                            />
                            <Row
                                label="Biteship Tracking ID"
                                value={shipment.biteship_tracking_id ?? '-'}
                            />
                            <Row
                                label="Shipped At"
                                value={shipment.shipped_at ?? '-'}
                            />
                            <Row
                                label="Delivered At"
                                value={shipment.delivered_at ?? '-'}
                            />
                            {labelUrl ? (
                                <a
                                    href={labelUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
                                >
                                    <Printer className="size-4" /> Cetak Resi Biteship
                                </a>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => printBiteshipLabel(shipment)}
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
                            >
                                <Printer className="size-4" /> Cetak Resi Lokal
                            </button>
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

function Field({
    label,
    value,
    error,
    placeholder,
    onChange,
}: {
    label: string;
    value: string;
    error?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
