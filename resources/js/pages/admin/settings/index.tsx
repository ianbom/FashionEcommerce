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
import { cn } from '@/lib/utils';

type SettingField = {
    key: string;
    label: string;
    type: string;
    input?: 'email' | 'number' | 'select' | 'textarea' | 'url';
    options?: string[];
};

type SettingSection = {
    title: string;
    description: string;
    fields: SettingField[];
};

type Props = {
    activeSection: string;
    sections: Record<string, SettingSection>;
    values: Record<string, string | null>;
};

const sectionLinks: Record<string, string> = {
    store: '/admin/settings/store',
    seo: '/admin/settings/seo',
    payment: '/admin/settings/payment',
    shipping: '/admin/settings/shipping',
};

export default function AdminSettingsIndex({
    activeSection,
    sections,
    values,
}: Props) {
    const current = sections[activeSection];
    const initialData = current.fields.reduce<Record<string, string>>(
        (carry, field) => {
            carry[field.key] = values[field.key] ?? '';

            return carry;
        },
        {},
    );

    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm<Record<string, string>>(initialData);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put('/admin/settings', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Settings
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {current.title}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            {current.description}
                        </p>
                    </div>

                    {recentlySuccessful ? (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            Settings tersimpan
                        </span>
                    ) : null}
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <Card className="h-fit py-3">
                        <CardContent className="flex flex-col gap-1 px-3">
                            {Object.entries(sections).map(([key, section]) => (
                                <Button
                                    key={key}
                                    asChild
                                    variant={
                                        key === activeSection
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className={cn(
                                        'justify-start',
                                        key === activeSection &&
                                            'bg-primary/10 text-primary hover:bg-primary/15',
                                    )}
                                >
                                    <Link
                                        href={
                                            sectionLinks[key] ??
                                            '/admin/settings'
                                        }
                                    >
                                        {section.title}
                                    </Link>
                                </Button>
                            ))}
                            <Button
                                asChild
                                variant="ghost"
                                className="justify-start"
                            >
                                <Link href="/admin/admin-users">
                                    Admin Users
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{current.title}</CardTitle>
                            <CardDescription>
                                Sensitive API keys seperti Midtrans server key
                                dan Biteship API key tetap dikelola dari file
                                environment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-5 md:grid-cols-2">
                                    {current.fields.map((field) => (
                                        <div
                                            key={field.key}
                                            className={cn(
                                                'grid gap-2',
                                                field.input === 'textarea' &&
                                                    'md:col-span-2',
                                            )}
                                        >
                                            <Label htmlFor={field.key}>
                                                {field.label}
                                            </Label>

                                            {field.input === 'textarea' ? (
                                                <textarea
                                                    id={field.key}
                                                    value={
                                                        data[field.key] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setData(
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                />
                                            ) : field.input === 'select' ? (
                                                <select
                                                    id={field.key}
                                                    value={
                                                        data[field.key] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setData(
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                                >
                                                    <option value="">
                                                        Select option
                                                    </option>
                                                    {field.options?.map(
                                                        (option) => (
                                                            <option
                                                                key={option}
                                                                value={option}
                                                            >
                                                                {option}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            ) : (
                                                <Input
                                                    id={field.key}
                                                    type={field.input ?? 'text'}
                                                    value={
                                                        data[field.key] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setData(
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            )}

                                            <InputError
                                                message={errors[field.key]}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href="/admin/dashboard">
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save />
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Settings'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
