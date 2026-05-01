import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, RefreshCw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    Paginated} from '@/pages/admin/sales/shared';
import {
    formatPrice,
    PageHeader,
    Pagination,
    StatusBadge,
    TableShell,
} from '@/pages/admin/sales/shared';

type Shipment = {
    id: number;
    order_number: string | null;
    customer: string | null;
    waybill_id: string | null;
    courier_company: string;
    courier_type: string;
    courier_service_name: string | null;
    shipping_cost: string;
    shipping_status: string;
    estimated_delivery: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
};

type Props = {
    shipments: Paginated<Shipment>;
    filters: Record<string, string>;
    shippingStatuses: string[];
};

export default function ShipmentsIndex({ shipments, filters, shippingStatuses }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        courier_company: filters.courier_company ?? '',
        courier_type: filters.courier_type ?? '',
        shipping_status: filters.shipping_status ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/shipments', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Shipments" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Sales Management" title="Shipments" description="Pantau pengiriman Biteship, waybill, biaya, estimasi, dan tracking status." />
                <TableShell title="Shipment List" description={`${shipments.total} shipment tercatat`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 lg:grid-cols-6">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Order/waybill..." />
                        <Input value={data.courier_company} onChange={(event) => setData('courier_company', event.target.value)} placeholder="Courier" />
                        <Input value={data.courier_type} onChange={(event) => setData('courier_type', event.target.value)} placeholder="Type" />
                        <select value={data.shipping_status} onChange={(event) => setData('shipping_status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All status</option>
                            {shippingStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <Input type="date" value={data.date_from} onChange={(event) => setData('date_from', event.target.value)} />
                        <div className="flex gap-2">
                            <Input type="date" value={data.date_to} onChange={(event) => setData('date_to', event.target.value)} />
                            <Button type="submit" variant="outline" disabled={processing}><Search /></Button>
                        </div>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Order</th>
                                    <th className="pb-3 pr-4 font-medium">Waybill</th>
                                    <th className="pb-3 pr-4 font-medium">Courier</th>
                                    <th className="pb-3 pr-4 font-medium">Cost</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 pr-4 font-medium">ETA</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {shipments.data.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{shipment.order_number ?? '-'}</div>
                                            <div className="text-xs text-muted-foreground">{shipment.customer ?? '-'}</div>
                                        </td>
                                        <td className="py-3 pr-4">{shipment.waybill_id ?? '-'}</td>
                                        <td className="py-3 pr-4">{shipment.courier_company} {shipment.courier_type}<div className="text-xs text-muted-foreground">{shipment.courier_service_name ?? '-'}</div></td>
                                        <td className="py-3 pr-4">{formatPrice(shipment.shipping_cost)}</td>
                                        <td className="py-3 pr-4"><StatusBadge status={shipment.shipping_status} /></td>
                                        <td className="py-3 pr-4">{shipment.estimated_delivery ?? '-'}</td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm"><Link href={`/admin/shipments/${shipment.id}`}><Eye /> View</Link></Button>
                                                <Button asChild variant="outline" size="sm"><Link href={`/admin/shipments/${shipment.id}/refresh-tracking`} method="post" as="button"><RefreshCw /> Track</Link></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={shipments} />
                </TableShell>
            </div>
        </>
    );
}
