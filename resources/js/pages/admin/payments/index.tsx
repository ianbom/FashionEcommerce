import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, RefreshCw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated } from '@/pages/admin/sales/shared';
import {
    formatPrice,
    PageHeader,
    Pagination,
    StatusBadge,
    TableShell,
} from '@/pages/admin/sales/shared';

type Payment = {
    id: number;
    order_number: string | null;
    customer: string | null;
    midtrans_order_id: string | null;
    midtrans_transaction_id: string | null;
    payment_method: string | null;
    gross_amount: string;
    transaction_status: string | null;
    fraud_status: string | null;
    paid_at: string | null;
    expired_at: string | null;
    created_at: string | null;
};

type Props = {
    payments: Paginated<Payment>;
    filters: Record<string, string>;
    statuses: string[];
};

export default function PaymentsIndex({ payments, filters, statuses }: Props) {
    const { data, setData, get, processing } = useForm({
        transaction_status: filters.transaction_status ?? '',
        payment_method: filters.payment_method ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        amount_min: filters.amount_min ?? '',
        amount_max: filters.amount_max ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/payments', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Payments" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Sales Management"
                    title="Payments"
                    description="Pantau transaksi Midtrans, status settlement, fraud status, dan lakukan manual sync."
                />
                <TableShell
                    title="Payment Transactions"
                    description={`${payments.total} transaksi pembayaran`}
                >
                    <form
                        onSubmit={submit}
                        className="mb-4 grid gap-3 lg:grid-cols-6"
                    >
                        <select
                            value={data.transaction_status}
                            onChange={(event) =>
                                setData(
                                    'transaction_status',
                                    event.target.value,
                                )
                            }
                            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        >
                            <option value="">All status</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        <Input
                            value={data.payment_method}
                            onChange={(event) =>
                                setData('payment_method', event.target.value)
                            }
                            placeholder="Method"
                        />
                        <Input
                            type="date"
                            value={data.date_from}
                            onChange={(event) =>
                                setData('date_from', event.target.value)
                            }
                        />
                        <Input
                            type="date"
                            value={data.date_to}
                            onChange={(event) =>
                                setData('date_to', event.target.value)
                            }
                        />
                        <Input
                            type="number"
                            value={data.amount_min}
                            onChange={(event) =>
                                setData('amount_min', event.target.value)
                            }
                            placeholder="Min"
                        />
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={data.amount_max}
                                onChange={(event) =>
                                    setData('amount_max', event.target.value)
                                }
                                placeholder="Max"
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
                                        Order
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Midtrans
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Method
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Amount
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Status
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Paid
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.data.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">
                                                {payment.order_number ?? '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payment.customer ?? '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div>
                                                {payment.midtrans_order_id ??
                                                    '-'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {payment.midtrans_transaction_id ??
                                                    '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {payment.payment_method ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4 font-medium">
                                            {formatPrice(payment.gross_amount)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge
                                                status={
                                                    payment.transaction_status
                                                }
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            {payment.paid_at ?? '-'}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/admin/payments/${payment.id}`}
                                                    >
                                                        <Eye /> View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/admin/payments/${payment.id}/sync`}
                                                        method="post"
                                                        as="button"
                                                    >
                                                        <RefreshCw /> Sync
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={payments} />
                </TableShell>
            </div>
        </>
    );
}
