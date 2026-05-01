import { Head, Link, useForm } from '@inertiajs/react';
import { History, Search, SlidersHorizontal } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    Paginated} from '@/pages/admin/catalog/shared';
import {
    ActiveBadge,
    EmptyState,
    PageHeader,
    Pagination,
    TableShell,
} from '@/pages/admin/catalog/shared';

type VariantStock = {
    id: number;
    product: string | null;
    sku: string;
    color_name: string | null;
    size: string | null;
    stock: number;
    reserved_stock: number;
    available_stock: number;
    is_active: boolean;
};

type Props = {
    variants: Paginated<VariantStock>;
    filters: { search?: string; stock_status?: string };
};

export default function StockIndex({ variants, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        stock_status: filters.stock_status ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/stock', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Stock" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title="Stock Monitor"
                    description="Pantau stok varian, reserved stock, available stock, dan lakukan manual adjustment."
                    action={
                        <Button asChild variant="outline">
                            <Link href="/admin/stock/logs">
                                <History />
                                Stock Logs
                            </Link>
                        </Button>
                    }
                />

                <TableShell title="Variant Stock" description={`${variants.total} varian dipantau`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Search SKU or product..." />
                        <select value={data.stock_status} onChange={(event) => setData('stock_status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All stock</option>
                            <option value="in_stock">In stock</option>
                            <option value="low_stock">Low stock</option>
                            <option value="sold_out">Sold out</option>
                        </select>
                        <Button type="submit" variant="outline" disabled={processing}>
                            <Search />
                            Search
                        </Button>
                    </form>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Variant</th>
                                    <th className="pb-3 pr-4 font-medium">Color</th>
                                    <th className="pb-3 pr-4 font-medium">Stock</th>
                                    <th className="pb-3 pr-4 font-medium">Reserved</th>
                                    <th className="pb-3 pr-4 font-medium">Available</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {variants.data.map((variant) => (
                                    <tr key={variant.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{variant.sku}</div>
                                            <div className="text-xs text-muted-foreground">{variant.product ?? '-'}</div>
                                        </td>
                                        <td className="py-3 pr-4">{variant.color_name ?? '-'} / {variant.size ?? '-'}</td>
                                        <td className="py-3 pr-4">{variant.stock}</td>
                                        <td className="py-3 pr-4">{variant.reserved_stock}</td>
                                        <td className="py-3 pr-4 font-medium">{variant.available_stock}</td>
                                        <td className="py-3 pr-4"><ActiveBadge active={variant.is_active} /></td>
                                        <td className="py-3 text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/product-variants/${variant.id}/stock-adjustment`}>
                                                    <SlidersHorizontal />
                                                    Adjust
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {variants.data.length === 0 ? <EmptyState>Tidak ada stock.</EmptyState> : null}
                    <Pagination paginator={variants} />
                </TableShell>
            </div>
        </>
    );
}
