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
    FlagBadge,
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
} from '@/pages/admin/catalog/shared';

type Collection = {
    id: number;
    name: string;
    slug: string;
    banner_desktop_url: string | null;
    is_featured: boolean;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
};

type Props = {
    collections: Paginated<Collection>;
    filters: { search?: string };
};

export default function CollectionsIndex({ collections, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/collections', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Collections" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title="Collections"
                    description="Kelola campaign collection seperti Ramadan, Hajj Series, dan New Arrival."
                    action={
                        <Button asChild>
                            <Link href="/admin/collections/create">
                                <Plus />
                                Create Collection
                            </Link>
                        </Button>
                    }
                />

                <TableShell title="Collection List" description={`${collections.total} collection terdaftar`}>
                    <form onSubmit={submit} className="mb-4 flex gap-2">
                        <Input
                            value={data.search}
                            onChange={(event) => setData('search', event.target.value)}
                            placeholder="Search collection..."
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="outline" disabled={processing}>
                            <Search />
                            Search
                        </Button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 pr-4 font-medium">Banner</th>
                                    <th className="pb-3 pr-4 font-medium">Name</th>
                                    <th className="pb-3 pr-4 font-medium">Products</th>
                                    <th className="pb-3 pr-4 font-medium">Featured</th>
                                    <th className="pb-3 pr-4 font-medium">Status</th>
                                    <th className="pb-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {collections.data.map((collection) => (
                                    <tr key={collection.id} className="hover:bg-muted/40">
                                        <td className="py-3 pr-4">
                                            <Thumbnail src={collection.banner_desktop_url} alt={collection.name} />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">{collection.name}</div>
                                            <div className="text-xs text-muted-foreground">{collection.slug}</div>
                                        </td>
                                        <td className="py-3 pr-4">{collection.products_count}</td>
                                        <td className="py-3 pr-4">
                                            <FlagBadge active={collection.is_featured}>Featured</FlagBadge>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ActiveBadge active={collection.is_active} />
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/admin/collections/${collection.id}/edit`}>
                                                        <Edit />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link
                                                        href={`/admin/collections/${collection.id}`}
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

                    {collections.data.length === 0 ? (
                        <EmptyState>Tidak ada collection.</EmptyState>
                    ) : null}
                    <Pagination paginator={collections} />
                </TableShell>
            </div>
        </>
    );
}
