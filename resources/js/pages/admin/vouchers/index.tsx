import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveBadge, formatPrice, PageHeader, Pagination, TableShell } from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';

type Voucher = {
    id: number;
    code: string;
    name: string;
    discount_type: string;
    discount_value: string;
    max_discount: string | null;
    min_order_amount: string | null;
    usage_limit: number | null;
    used_count: number;
    paid_orders_count: number;
    ends_at: string | null;
    is_active: boolean;
};

type Props = { vouchers: Paginated<Voucher>; filters: Record<string, string> };

export default function VouchersIndex({ vouchers, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        discount_type: filters.discount_type ?? '',
        is_active: filters.is_active ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/vouchers', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Vouchers" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Marketing Management" title="Vouchers" description="Kelola kode promo, limit penggunaan, periode aktif, dan status campaign." action={<Button asChild><Link href="/admin/vouchers/create"><Plus /> Create Voucher</Link></Button>} />
                <TableShell title="Voucher List" description={`${vouchers.total} voucher terdaftar`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-4">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Code or name..." />
                        <select value={data.discount_type} onChange={(event) => setData('discount_type', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All discount</option><option value="fixed">Fixed</option><option value="percentage">Percentage</option>
                        </select>
                        <select value={data.is_active} onChange={(event) => setData('is_active', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All status</option><option value="active">Active</option><option value="inactive">Inactive</option>
                        </select>
                        <Button type="submit" variant="outline" disabled={processing}><Search /> Filter</Button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 pr-4 font-medium">Voucher</th><th className="pb-3 pr-4 font-medium">Discount</th><th className="pb-3 pr-4 font-medium">Usage</th><th className="pb-3 pr-4 font-medium">Ends</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 text-right font-medium">Action</th></tr></thead>
                            <tbody className="divide-y">
                                {vouchers.data.map((voucher) => (
                                    <tr key={voucher.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4"><div className="font-semibold">{voucher.code}</div><div className="text-xs text-muted-foreground">{voucher.name}</div></td>
                                        <td className="py-3 pr-4">{voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}<div className="text-xs text-muted-foreground">Min {formatPrice(voucher.min_order_amount)} · Max {voucher.max_discount ? formatPrice(voucher.max_discount) : '-'}</div></td>
                                        <td className="py-3 pr-4">{voucher.used_count}/{voucher.usage_limit ?? '∞'}<div className="text-xs text-muted-foreground">{voucher.paid_orders_count} paid orders</div></td>
                                        <td className="py-3 pr-4">{voucher.ends_at ?? '-'}</td>
                                        <td className="py-3 pr-4"><ActiveBadge active={voucher.is_active} /></td>
                                        <td className="py-3"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/vouchers/${voucher.id}/edit`}><Edit /> Edit</Link></Button><Button asChild size="sm" variant="outline"><Link href={`/admin/vouchers/${voucher.id}`} method="delete" as="button"><Trash2 /> Delete</Link></Button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={vouchers} />
                </TableShell>
            </div>
        </>
    );
}
