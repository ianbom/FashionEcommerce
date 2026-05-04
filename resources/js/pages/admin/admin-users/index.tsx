import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PerPageSelect } from '../pagination';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string | null;
    edit_url: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    per_page?: number;
};

type Props = {
    admins: Paginated<AdminUser>;
    filters: {
        search?: string;
    };
};

export default function AdminUsersIndex({ admins, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get('/admin/admin-users', {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Admin Users" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Settings
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Admin Users
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Kelola akun internal dengan role admin dan status
                            aktif.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/admin/admin-users/create">
                            <Plus />
                            Create Admin
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Admin Accounts</CardTitle>
                            <CardDescription>
                                {admins.total} admin terdaftar
                            </CardDescription>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex w-full gap-2 md:w-auto"
                        >
                            <Input
                                value={data.search}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                                placeholder="Search admin..."
                                className="md:w-72"
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
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="pr-4 pb-3 font-medium">
                                            Name
                                        </th>
                                        <th className="pr-4 pb-3 font-medium">
                                            Contact
                                        </th>
                                        <th className="pr-4 pb-3 font-medium">
                                            Status
                                        </th>
                                        <th className="hidden pr-4 pb-3 font-medium md:table-cell">
                                            Created
                                        </th>
                                        <th className="pb-3 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {admins.data.map((admin) => (
                                        <tr
                                            key={admin.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">
                                                    {admin.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    #{admin.id}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div>{admin.email}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {admin.phone ?? '-'}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        admin.is_active
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                                                    }
                                                >
                                                    {admin.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="hidden py-3 pr-4 text-muted-foreground md:table-cell">
                                                {admin.created_at ?? '-'}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link href={admin.edit_url}>
                                                        <Edit />
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {admins.data.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                                Tidak ada admin yang cocok dengan pencarian.
                            </div>
                        ) : null}

                        <div className="mt-6 flex flex-col justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
                            <span>
                                Showing {admins.from ?? 0}-{admins.to ?? 0} of{' '}
                                {admins.total}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {admins.links.map((link) =>
                                    link.url ? (
                                        <Button
                                            key={`${link.label}-${link.url}`}
                                            asChild
                                            size="sm"
                                            variant={
                                                link.active
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            <Link href={link.url}>
                                                {link.label
                                                    .replace('&laquo;', '')
                                                    .replace('&raquo;', '')
                                                    .trim()}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            key={link.label}
                                            size="sm"
                                            variant="outline"
                                            disabled
                                        >
                                            {link.label
                                                .replace('&laquo;', '')
                                                .replace('&raquo;', '')
                                                .trim()}
                                        </Button>
                                    ),
                                )}
                                <PerPageSelect paginator={admins} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
