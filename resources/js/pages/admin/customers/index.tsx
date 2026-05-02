import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Power, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ActiveBadge,
    formatPrice,
    MetricCard,
    PageHeader,
    Pagination,
    TableShell,
} from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    orders_count: number;
    addresses_count: number;
    total_spent: string | number;
    registered_at: string | null;
};

type Props = {
    customers: Paginated<Customer>;
    filters: Record<string, string>;
};

export default function CustomersIndex({ customers, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        is_active: filters.is_active ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        spent_min: filters.spent_min ?? '',
        spent_max: filters.spent_max ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/customers', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Customers" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Customer Management"
                    title="Customers"
                    description="Lihat profil customer, total spending, status aktif, alamat, wishlist, dan histori order."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                        label="Total Customers"
                        value={customers.total}
                    />
                    <MetricCard
                        label="Current Page"
                        value={customers.data.length}
                        detail="Customer pada halaman ini"
                    />
                    <MetricCard
                        label="Active Filter"
                        value={data.is_active || 'all'}
                    />
                </div>

                <TableShell
                    title="Customer List"
                    description={`${customers.total} customer terdaftar`}
                >
                    <form
                        onSubmit={submit}
                        className="mb-4 grid gap-3 md:grid-cols-6"
                    >
                        <Input
                            value={data.search}
                            onChange={(event) =>
                                setData('search', event.target.value)
                            }
                            placeholder="Name, email, phone..."
                            className="md:col-span-2"
                        />
                        <select
                            value={data.is_active}
                            onChange={(event) =>
                                setData('is_active', event.target.value)
                            }
                            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        >
                            <option value="">All status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={processing}
                        >
                            <Search />
                            Filter
                        </Button>
                    </form>

                    <div className="mb-4 grid gap-3 md:grid-cols-2">
                        <Input
                            value={data.spent_min}
                            onChange={(event) =>
                                setData('spent_min', event.target.value)
                            }
                            placeholder="Minimum total spent"
                        />
                        <Input
                            value={data.spent_max}
                            onChange={(event) =>
                                setData('spent_max', event.target.value)
                            }
                            placeholder="Maximum total spent"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pr-4 pb-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Phone
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Orders
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Spent
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Status
                                    </th>
                                    <th className="hidden pr-4 pb-3 font-medium lg:table-cell">
                                        Registered
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">
                                                {customer.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {customer.phone ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {customer.orders_count}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {formatPrice(customer.total_spent)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ActiveBadge
                                                active={customer.is_active}
                                            />
                                        </td>
                                        <td className="hidden py-3 pr-4 text-muted-foreground lg:table-cell">
                                            {customer.registered_at ?? '-'}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/customers/${customer.id}`}
                                                    >
                                                        <Eye /> View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/customers/${customer.id}/toggle-active`}
                                                        method="post"
                                                        as="button"
                                                        preserveScroll
                                                    >
                                                        <Power /> Toggle
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination paginator={customers} />
                </TableShell>
            </div>
        </>
    );
}
