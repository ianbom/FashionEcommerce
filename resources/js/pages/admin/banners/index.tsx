import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ActiveBadge,
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
} from '@/pages/admin/marketing/shared';
import type { Paginated } from '@/pages/admin/marketing/shared';

type Banner = {
    id: number;
    title: string;
    subtitle: string | null;
    image_desktop_url: string | null;
    placement: string;
    sort_order: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
};

type Props = {
    banners: Paginated<Banner>;
    filters: Record<string, string>;
    placements: string[];
};

export default function BannersIndex({ banners, filters, placements }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
        placement: filters.placement ?? '',
        is_active: filters.is_active ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/banners', { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Banners" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Content Management"
                    title="Banners"
                    description="Atur banner homepage, collection, dan promo yang tampil berdasarkan status dan periode aktif."
                    action={
                        <Button asChild>
                            <Link href="/admin/banners/create">
                                <Plus /> Create Banner
                            </Link>
                        </Button>
                    }
                />
                <TableShell
                    title="Banner List"
                    description={`${banners.total} banner terdaftar`}
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
                            placeholder="Title or subtitle..."
                        />
                        <select
                            value={data.placement}
                            onChange={(event) =>
                                setData('placement', event.target.value)
                            }
                            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        >
                            <option value="">All placement</option>
                            {placements.map((placement) => (
                                <option key={placement} value={placement}>
                                    {placement}
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
                                        Banner
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Placement
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Sort
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Period
                                    </th>
                                    <th className="pr-4 pb-3 font-medium">
                                        Status
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {banners.data.map((banner) => (
                                    <tr
                                        key={banner.id}
                                        className="hover:bg-muted/40"
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <Thumbnail
                                                    src={
                                                        banner.image_desktop_url
                                                    }
                                                    alt={banner.title}
                                                />
                                                <div>
                                                    <div className="font-medium">
                                                        {banner.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {banner.subtitle ?? '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            {banner.placement}
                                        </td>
                                        <td className="py-3 pr-4">
                                            {banner.sort_order}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div>{banner.starts_at ?? '-'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                to {banner.ends_at ?? '-'}
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <ActiveBadge
                                                active={banner.is_active}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/banners/${banner.id}/edit`}
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
                                                        href={`/admin/banners/${banner.id}`}
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
                    <Pagination paginator={banners} />
                </TableShell>
            </div>
        </>
    );
}
