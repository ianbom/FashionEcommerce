import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
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

type Page = {
    id: number;
    title: string;
    slug: string;
    type: string;
    meta_title: string | null;
    is_active: boolean;
    updated_at: string | null;
};

type Props = {
    pages: Paginated<Page>;
    filters: Record<string, string>;
    types: string[];
};

export default function PagesIndex({ pages, filters, types }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        type: filters.type ?? '',
        is_active: filters.is_active ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/pages', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Pages" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Content Management"
                    title="Pages"
                    description="Kelola halaman statis, policy, FAQ, SEO title, dan status publikasi."
                    action={
                        <Button asChild>
                            <Link href="/admin/pages/create">
                                <Plus /> Create Page
                            </Link>
                        </Button>
                    }
                />
                <TableShell
                    title="Static Pages"
                    description={`${pages.total} page tersimpan`}
                >
                    <form
                        onSubmit={submit}
                        className="mb-4 grid gap-3 md:grid-cols-4"
                    >
                        <Input
                            value={data.search}
                            onChange={(event) =>
                                setData('search', event.target.value)
                            }
                            placeholder="Title or slug..."
                        />
                        <select
                            value={data.type}
                            onChange={(event) =>
                                setData('type', event.target.value)
                            }
                            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        >
                            <option value="">All type</option>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
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
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pr-4 pb-3 font-medium">
                                        Page
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Type
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        SEO
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Status
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Updated
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pages.data.map((page) => (
                                    <tr
                                        key={page.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="font-medium">
                                                {page.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                /{page.slug}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {page.type}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {page.meta_title ?? '-'}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ActiveBadge
                                                active={page.is_active}
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            {page.updated_at ?? '-'}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/${page.slug}`}
                                                    >
                                                        <Eye /> Preview
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/pages/${page.id}/edit`}
                                                    >
                                                        <Edit /> Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/pages/${page.id}`}
                                                        method="delete"
                                                        as="button"
                                                    >
                                                        <Trash2 /> Delete
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination paginator={pages} />
                </TableShell>
            </div>
        </>
    );
}
