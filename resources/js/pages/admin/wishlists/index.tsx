import { Head, Link, useForm } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/pages/admin/catalog/shared';
import {
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
} from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    category: string | null;
    thumbnail: string | null;
    status: string;
    wishlists_count: number;
};
type Category = { id: number; name: string };
type Recent = {
    id: number;
    customer: string | null;
    product: string | null;
    created_at: string | null;
};
type Props = {
    products: Paginated<Product>;
    filters: Record<string, string>;
    categories: Category[];
    recent: Recent[];
};

export default function WishlistsIndex({
    products,
    filters,
    categories,
    recent,
}: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        category_id: filters.category_id ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/wishlists', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Wishlist Insights" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Marketing Insight"
                    title="Wishlist Insights"
                    description="Produk yang paling sering disimpan customer untuk insight campaign dan stok."
                />
                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <TableShell
                        title="Favorite Products"
                        description={`${products.total} produk memiliki wishlist`}
                    >
                        <form
                            onSubmit={submit}
                            className="mb-4 grid gap-3 md:grid-cols-3"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Product or SKU..."
                            />
                            <select
                                value={data.category_id}
                                onChange={(event) =>
                                    setData('category_id', event.target.value)
                                }
                                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={processing}
                            >
                                <Search /> Filter
                            </Button>
                        </form>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-muted/40"
                                        >
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Thumbnail
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                    />
                                                    <div>
                                                        <Link
                                                            className="font-medium text-primary underline"
                                                            href={`/admin/products/${product.id}`}
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground">
                                                            {product.sku ?? '-'}{' '}
                                                            ·{' '}
                                                            {product.category ??
                                                                '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <StatusBadge
                                                    status={product.status}
                                                />
                                            </td>
                                            <td className="py-3 text-right text-xl font-semibold">
                                                {product.wishlists_count}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination paginator={products} />
                    </TableShell>
                    <TableShell
                        title="Recent Wishlist"
                        description="Aktivitas terbaru"
                    >
                        <div className="grid gap-3">
                            {recent.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-lg border p-3 text-sm"
                                >
                                    <div className="font-medium">
                                        {item.customer ?? '-'}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {item.product ?? '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {item.created_at ?? '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TableShell>
                </div>
            </div>
        </>
    );
}
