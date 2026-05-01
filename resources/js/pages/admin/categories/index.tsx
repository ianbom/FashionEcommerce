import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
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
    Thumbnail,
} from '@/pages/admin/catalog/shared';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
};

type Props = {
    categories: Paginated<Category>;
    filters: { search?: string };
};

export default function CategoriesIndex({ categories, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/categories', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Categories" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title="Categories"
                    description="Kelola kategori produk dan status tampil di filter customer."
                    action={
                        <Button asChild>
                            <Link href="/admin/categories/create">
                                <Plus />
                                Create Category
                            </Link>
                        </Button>
                    }
                />

                <TableShell
                    title="Category List"
                    description={`${categories.total} category terdaftar`}
                >
                    <form onSubmit={submit} className="mb-4 flex gap-2">
                        <Input
                            value={data.search}
                            onChange={(event) =>
                                setData('search', event.target.value)
                            }
                            placeholder="Search category..."
                            className="max-w-sm"
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={processing}
                        >
                            <Search />
                            Search
                        </Button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Image</th>
                                    <th className="pb-3 pr-4 font-medium">Name</th>
                                    <th className="pb-3 pr-4 font-medium">Products</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="hidden pb-3 pr-4 font-medium md:table-cell">Created</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.data.map((category) => (
                                    <tr key={category.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <Thumbnail src={category.image_url} alt={category.name} />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-xs text-muted-foreground">{category.slug}</div>
                                        </td>
                                        <td className="py-3 pr-4">{category.products_count}</td>
                                        <td className="py-3 pr-4">
                                            <ActiveBadge active={category.is_active} />
                                        </td>
                                        <td className="hidden py-3 pr-4 text-muted-foreground md:table-cell">
                                            {category.created_at ?? '-'}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/categories/${category.id}/edit`}>
                                                        <Edit />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link
                                                        href={`/admin/categories/${category.id}`}
                                                        method="delete"
                                                        as="button"
                                                        preserveScroll
                                                    >
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

                    {categories.data.length === 0 ? (
                        <EmptyState>Tidak ada category.</EmptyState>
                    ) : null}

                    <Pagination paginator={categories} />
                </TableShell>
            </div>
        </>
    );
}
