import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Eye, Search, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ActiveBadge,
    PageHeader,
    Pagination,
    TableShell,
} from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';

type Address = {
    id: number;
    customer: string | null;
    customer_email: string | null;
    recipient_name: string;
    recipient_phone: string;
    label: string | null;
    province: string;
    city: string;
    postal_code: string;
    full_address: string;
    is_default: boolean;
    orders_count: number;
};

type Props = {
    addresses: Paginated<Address>;
    filters: Record<string, string>;
};

export default function CustomerAddressesIndex({ addresses, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        province: filters.province ?? '',
        city: filters.city ?? '',
        is_default: filters.is_default ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/customer-addresses', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Customer Addresses" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Customer Management" title="Customer Addresses" description="Cari alamat customer untuk kebutuhan customer service tanpa mengubah snapshot order lama." />
                <TableShell title="Address Book" description={`${addresses.total} alamat customer`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-5">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Customer, recipient, city..." className="md:col-span-2" />
                        <Input value={data.province} onChange={(event) => setData('province', event.target.value)} placeholder="Province" />
                        <Input value={data.city} onChange={(event) => setData('city', event.target.value)} placeholder="City" />
                        <div className="flex gap-2">
                            <select value={data.is_default} onChange={(event) => setData('is_default', event.target.value)} className="border-input min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm">
                                <option value="">All</option>
                                <option value="yes">Default</option>
                                <option value="no">Non-default</option>
                            </select>
                            <Button type="submit" variant="outline" disabled={processing}><Search /></Button>
                        </div>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Customer</th>
                                    <th className="pb-3 pr-4 font-medium">Recipient</th>
                                    <th className="pb-3 pr-4 font-medium">Area</th>
                                    <th className="pb-3 pr-4 font-medium">Default</th>
                                    <th className="pb-3 pr-4 font-medium">Orders</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {addresses.data.map((address) => (
                                    <tr key={address.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4"><div className="font-medium">{address.customer ?? '-'}</div><div className="text-xs text-muted-foreground">{address.customer_email ?? '-'}</div></td>
                                        <td className="py-3 pr-4"><div>{address.recipient_name}</div><div className="text-xs text-muted-foreground">{address.recipient_phone}</div></td>
                                        <td className="py-3 pr-4"><div>{address.city}, {address.province}</div><div className="text-xs text-muted-foreground">{address.postal_code}</div></td>
                                        <td className="py-3 pr-4">{address.is_default ? <ActiveBadge active /> : '-'}</td>
                                        <td className="py-3 pr-4">{address.orders_count}</td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline"><Link href={`/admin/customer-addresses/${address.id}`}><Eye /> View</Link></Button>
                                                <Button asChild size="sm" variant="outline"><Link href={`/admin/customer-addresses/${address.id}/edit`}><Edit /> Edit</Link></Button>
                                                {address.orders_count === 0 ? (
                                                    <Button asChild size="sm" variant="outline"><Link href={`/admin/customer-addresses/${address.id}`} method="delete" as="button"><Trash2 /> Delete</Link></Button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={addresses} />
                </TableShell>
            </div>
        </>
    );
}
