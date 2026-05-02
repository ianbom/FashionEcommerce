import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    adminUser: AdminUser | null;
};

export default function AdminUserForm({ mode, adminUser }: Props) {
    const isEdit = mode === 'edit' && adminUser !== null;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: adminUser?.name ?? '',
        email: adminUser?.email ?? '',
        phone: adminUser?.phone ?? '',
        avatar_url: adminUser?.avatar_url ?? '',
        password: '',
        password_confirmation: '',
        is_active: adminUser?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEdit) {
            put(`/admin/admin-users/${adminUser.id}`, {
                onSuccess: () => reset('password', 'password_confirmation'),
            });

            return;
        }

        post('/admin/admin-users', {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Admin User' : 'Create Admin User'} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Settings
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit ? 'Edit Admin User' : 'Create Admin User'}
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Role akan otomatis diset sebagai admin. Password minimal
                        8 karakter.
                    </p>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Isi data admin internal yang dapat mengakses
                            dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(event) =>
                                            setData('phone', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="avatar_url">
                                        Avatar URL
                                    </Label>
                                    <Input
                                        id="avatar_url"
                                        type="url"
                                        value={data.avatar_url}
                                        onChange={(event) =>
                                            setData(
                                                'avatar_url',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.avatar_url} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {isEdit ? 'New Password' : 'Password'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setData(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(event) =>
                                            setData(
                                                'password_confirmation',
                                                event.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(event) =>
                                        setData(
                                            'is_active',
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium">
                                        Active admin
                                    </span>
                                    <span className="text-muted-foreground">
                                        Admin aktif dapat login ke dashboard.
                                    </span>
                                </span>
                            </label>
                            <InputError message={errors.is_active} />

                            <div className="flex items-center justify-end gap-3 border-t pt-6">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/admin/admin-users">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    {processing ? 'Saving...' : 'Save Admin'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
