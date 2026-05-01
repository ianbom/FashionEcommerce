import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    Paginated} from '@/pages/admin/catalog/shared';
import {
    ActiveBadge,
    EmptyState,
    formatPrice,
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
} from '@/pages/admin/catalog/shared';

type Variant = {
    id: number;
    product_id: number;
    product: string | null;
    sku: string;
    color_name: string | null;
    color_hex: string | null;
    size: string | null;
    additional_price: string;
    stock: number;
    reserved_stock: number;
    available_stock: number;
    image_url: string | null;
    is_active: boolean;
    order_items_count: number;
};

type Props = {
    variants: Paginated<Variant>;
    product: { id: number; name: string } | null;
    filters: { search?: string; status?: string };
};

export default function ProductVariantsIndex({ variants, product, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });
    const indexUrl = product ? `/admin/products/${product.id}/variants` : '/admin/product-variants';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get(indexUrl, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Product Variants" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={product ? `${product.name} Variants` : 'Product Variants'}
                    description="Kelola SKU varian, warna, ukuran, stok, reserved stock, dan status aktif."
                    action={
                        <Button asChild>
                            <Link href={`/admin/product-variants/create${product ? `?product_id=${product.id}` : ''}`}>
                                <Plus />
                                Add Variant
                            </Link>
                        </Button>
                    }
                />

                <TableShell title="Variant List" description={`${variants.total} variant terdaftar`}>
                    <form onSubmit={submit} className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <Input value={data.search} onChange={(event) => setData('search', event.target.value)} placeholder="Search variant or product..." />
                        <select value={data.status} onChange={(event) => setData('status', event.target.value)} className="border-input rounded-md border bg-transparent px-3 py-2 text-sm">
                            <option value="">All status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                    <th className="pb-3 pr-4 font-medium">Size</th>
                                    <th className="pb-3 pr-4 font-medium">Price Add</th>
                                    <th className="pb-3 pr-4 font-medium">Stock</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {variants.data.map((variant) => (
                                    <tr key={variant.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <Thumbnail src={variant.image_url} alt={variant.sku} />
                                                <div>
                                                    <div className="font-medium">{variant.sku}</div>
                                                    <div className="text-xs text-muted-foreground">{variant.product ?? '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                {variant.color_hex ? <span className="size-4 rounded-full border" style={{ backgroundColor: variant.color_hex }} /> : null}
                                                {variant.color_name ?? '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">{variant.size ?? '-'}</td>
                                        <td className="py-3 pr-4">{formatPrice(variant.additional_price)}</td>
                                        <td className="py-3 pr-4">
                                            <div>{variant.available_stock} available</div>
                                            <div className="text-xs text-muted-foreground">{variant.reserved_stock} reserved / {variant.stock} stock</div>
                                        </td>
                                        <td className="py-3 pr-4"><ActiveBadge active={variant.is_active} /></td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/product-variants/${variant.id}/stock-adjustment`}>
                                                        <SlidersHorizontal />
                                                        Stock
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/product-variants/${variant.id}/edit`}>
                                                        <Edit />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/product-variants/${variant.id}`} method="delete" as="button">
                                                        <Trash2 />
                                                        Delete
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {variants.data.length === 0 ? <EmptyState>Tidak ada variant.</EmptyState> : null}
                    <Pagination paginator={variants} />
                </TableShell>
            </div>
        </>
    );
}
