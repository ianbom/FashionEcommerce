import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
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

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    grand_total: string;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    courier: string | null;
    waybill_id: string | null;
    created_at: string | null;
};

type Props = {
    orders: Paginated<Order>;
    filters: Record<string, string>;
    options: {
        paymentStatuses: string[];
        orderStatuses: string[];
        shippingStatuses: string[];
    };
};

export default function OrdersIndex({ orders, filters, options }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        payment_status: filters.payment_status ?? '',
        order_status: filters.order_status ?? '',
        shipping_status: filters.shipping_status ?? '',
        courier: filters.courier ?? '',
        voucher_code: filters.voucher_code ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/orders', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Orders" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title="Orders"
                    description="Pantau pesanan customer, status pembayaran, order flow, pengiriman, dan voucher."
                />

                <TableShell title="Order List" description={`${orders.total} order tercatat`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 lg:grid-cols-4">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Search order/customer..." />
                        <select value={data.payment_status} onChange={(event) => setData('payment_status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">Payment status</option>
                            {options.paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <select value={data.order_status} onChange={(event) => setData('order_status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">Order status</option>
                            {options.orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <select value={data.shipping_status} onChange={(event) => setData('shipping_status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">Shipping status</option>
                            {options.shippingStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        <Input value={data.courier} onChange={(event) => setData('courier', event.target.value)} placeholder="Courier" />
                        <Input value={data.voucher_code} onChange={(event) => setData('voucher_code', event.target.value)} placeholder="Voucher code" />
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
                                    <th className="pb-3 pr-4 font-medium">Customer</th>
                                    <th className="pb-3 pr-4 font-medium">Total</th>
                                    <th className="pb-3 pr-4 font-medium">Payment</th>
                                    <th className="pb-3 pr-4 font-medium">Order</th>
                                    <th className="pb-3 pr-4 font-medium">Shipping</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{order.order_number}</div>
                                            <div className="text-xs text-muted-foreground">{order.created_at ?? '-'}</div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div>{order.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                                        </td>
                                        <td className="py-3 pr-4 font-medium">{formatPrice(order.grand_total)}</td>
                                        <td className="py-3 pr-4"><StatusBadge status={order.payment_status} /></td>
                                        <td className="py-3 pr-4"><StatusBadge status={order.order_status} /></td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge status={order.shipping_status} />
                                            <div className="mt-1 text-xs text-muted-foreground">{order.waybill_id ?? order.courier ?? '-'}</div>
                                        </td>
                                        <td className="py-3 text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/orders/${order.id}`}><Eye /> View</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={orders} />
                </TableShell>
            </div>
        </>
    );
}
