import { Head, Link, useForm } from '@inertiajs/react';
import { PackagePlus, Printer, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
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
    PageHeader,
    StatusBadge,
} from '@/pages/admin/sales/shared';

type OrderItem = {
    id: number;
    product_name: string;
    product_sku: string | null;
    variant_sku: string | null;
    color_name: string | null;
    size: string | null;
    price: string;
    quantity: number;
    subtotal: string;
    product_image_url: string | null;
};

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    subtotal: string;
    discount_amount: string;
    shipping_cost: string;
    service_fee: string;
    grand_total: string;
    voucher_code: string | null;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    notes: string | null;
    no_return_refund_agreed: boolean;
    no_return_refund_agreed_at: string | null;
    items: OrderItem[];
    address: Record<string, string | number | null> | null;
    payment: Record<string, string | number | null> | null;
    payment_logs: { id: number; event_type: string | null; transaction_status: string | null; processed_at: string | null }[];
    shipment: Record<string, string | number | null> | null;
    trackings: { id: number; status: string; description: string | null; location: string | null; happened_at: string | null }[];
};

type Props = {
    order: Order;
};

export default function OrderShow({ order }: Props) {
    const noteForm = useForm({ notes: order.notes ?? '' });
    const shipmentForm = useForm<{
        courier_company: string;
        courier_type: string;
        courier_service_name: string;
        waybill_id: string;
        estimated_delivery: string;
        label_photo: File | null;
    }>({
        courier_company: '',
        courier_type: 'reg',
        courier_service_name: '',
        waybill_id: '',
        estimated_delivery: '',
        label_photo: null,
    });

    const submitNotes = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        noteForm.post(`/admin/orders/${order.id}/notes`, { preserveScroll: true });
    };

    const submitShipment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        shipmentForm.post(`/admin/orders/${order.id}/shipments`, { forceFormData: true });
    };

    return (
        <>
            <Head title={order.order_number} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title={order.order_number}
                    description="Detail pesanan, pembayaran, pengiriman, tracking, agreement, dan internal notes."
                    action={
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['processing', 'Mark Processing'],
                                ['ready_to_ship', 'Ready To Ship'],
                                ['completed', 'Complete'],
                                ['cancelled', 'Cancel'],
                            ].map(([status, label]) => (
                                <Button key={status} asChild variant="outline">
                                    <Link href={`/admin/orders/${order.id}/status`} method="post" data={{ status }} as="button" preserveScroll>
                                        {label}
                                    </Link>
                                </Button>
                            ))}
                            <Button type="button" variant="outline" onClick={() => window.print()}>
                                <Printer />
                                Print
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-4 md:grid-cols-4">
                    <Metric label="Grand Total" value={formatPrice(order.grand_total)} />
                    <Metric label="Payment" value={<StatusBadge status={order.payment_status} />} />
                    <Metric label="Order" value={<StatusBadge status={order.order_status} />} />
                    <Metric label="Shipping" value={<StatusBadge status={order.shipping_status} />} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ordered Items</CardTitle>
                            <CardDescription>{order.items.length} item dalam pesanan.</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pb-3 pr-4 font-medium">Item</th>
                                        <th className="pb-3 pr-4 font-medium">Variant</th>
                                        <th className="pb-3 pr-4 font-medium">Price</th>
                                        <th className="pb-3 pr-4 font-medium">Qty</th>
                                        <th className="pb-3 text-right font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    {item.product_image_url ? <img src={item.product_image_url} alt={item.product_name} className="size-12 rounded-md border object-cover" /> : null}
                                                    <div>
                                                        <div className="font-medium">{item.product_name}</div>
                                                        <div className="text-xs text-muted-foreground">{item.product_sku ?? '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">{item.variant_sku ?? '-'} · {item.color_name ?? '-'} · {item.size ?? '-'}</td>
                                            <td className="py-3 pr-4">{formatPrice(item.price)}</td>
                                            <td className="py-3 pr-4">{item.quantity}</td>
                                            <td className="py-3 text-right font-medium">{formatPrice(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Ringkasan nominal pesanan.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
                            <Row label="Discount" value={`- ${formatPrice(order.discount_amount)}`} />
                            <Row label="Shipping" value={formatPrice(order.shipping_cost)} />
                            <Row label="Service Fee" value={formatPrice(order.service_fee)} />
                            <Row label="Voucher" value={order.voucher_code ?? '-'} />
                            <Row label="Total" value={formatPrice(order.grand_total)} strong />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <InfoCard title="Customer Info" rows={[
                        ['Name', order.customer_name],
                        ['Email', order.customer_email],
                        ['Phone', order.customer_phone],
                    ]} />
                    <InfoCard title="Address Snapshot" rows={[
                        ['Recipient', String(order.address?.recipient_name ?? '-')],
                        ['Phone', String(order.address?.recipient_phone ?? '-')],
                        ['City', String(order.address?.city ?? '-')],
                        ['Address', String(order.address?.full_address ?? '-')],
                    ]} />
                    <InfoCard title="No Return Agreement" rows={[
                        ['Agreed', order.no_return_refund_agreed ? 'Yes' : 'No'],
                        ['Agreed At', order.no_return_refund_agreed_at ?? '-'],
                    ]} />
                </div>

                {!order.shipment && order.payment_status === 'paid' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Shipment</CardTitle>
                            <CardDescription>
                                Shipment hanya dapat dibuat sekali untuk order paid. Foto label disimpan ke Laravel public storage.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitShipment} className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label>Courier Company</Label>
                                    <Input value={shipmentForm.data.courier_company} onChange={(event) => shipmentForm.setData('courier_company', event.target.value)} placeholder="jne" />
                                    <InputError message={shipmentForm.errors.courier_company} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Courier Type</Label>
                                    <Input value={shipmentForm.data.courier_type} onChange={(event) => shipmentForm.setData('courier_type', event.target.value)} placeholder="reg" />
                                    <InputError message={shipmentForm.errors.courier_type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Service Name</Label>
                                    <Input value={shipmentForm.data.courier_service_name} onChange={(event) => shipmentForm.setData('courier_service_name', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Waybill ID</Label>
                                    <Input value={shipmentForm.data.waybill_id} onChange={(event) => shipmentForm.setData('waybill_id', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Estimated Delivery</Label>
                                    <Input value={shipmentForm.data.estimated_delivery} onChange={(event) => shipmentForm.setData('estimated_delivery', event.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Label Photo</Label>
                                    <Input type="file" accept="image/*" onChange={(event) => shipmentForm.setData('label_photo', event.target.files?.[0] ?? null)} />
                                    <InputError message={shipmentForm.errors.label_photo} />
                                </div>
                                <div className="md:col-span-3">
                                    <Button type="submit" disabled={shipmentForm.processing}>
                                        <PackagePlus />
                                        Create Shipment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Info</CardTitle>
                            <CardDescription>Midtrans transaction snapshot.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {order.payment ? (
                                <div className="grid gap-3 text-sm">
                                    <Row label="Provider" value={String(order.payment.payment_provider ?? '-')} />
                                    <Row label="Method" value={String(order.payment.payment_method ?? '-')} />
                                    <Row label="Transaction" value={String(order.payment.midtrans_transaction_id ?? '-')} />
                                    <Row label="Gross" value={formatPrice(String(order.payment.gross_amount ?? 0))} />
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No payment record.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Info</CardTitle>
                            <CardDescription>Courier, waybill, and latest tracking.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {order.shipment ? (
                                <div className="grid gap-3 text-sm">
                                    <Row label="Courier" value={`${order.shipment.courier_company ?? '-'} ${order.shipment.courier_type ?? ''}`} />
                                    <Row label="Waybill" value={String(order.shipment.waybill_id ?? '-')} />
                                    <Row label="Status" value={String(order.shipment.shipping_status ?? '-')} />
                                    <Button asChild variant="outline">
                                        <Link href={`/admin/shipments/${order.shipment.id}`}>Open Shipment</Link>
                                    </Button>
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No shipment created.</p>}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Internal Notes</CardTitle>
                        <CardDescription>Catatan internal admin, tidak tampil ke customer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitNotes} className="flex flex-col gap-3">
                            <textarea value={noteForm.data.notes} onChange={(event) => noteForm.setData('notes', event.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]" />
                            <Button className="w-fit" type="submit" disabled={noteForm.processing}>
                                <Save />
                                Save Note
                            </Button>
                        </form>
                    </CardContent>
                </Card>
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

function Row({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className={strong ? 'font-semibold' : 'font-medium'}>{value}</span>
        </div>
    );
}

function InfoCard({ title, rows }: { title: string; rows: [string, string][] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
                {rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
            </CardContent>
        </Card>
    );
}
