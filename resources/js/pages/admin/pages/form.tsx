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
import { PageHeader, textInputClass } from '@/pages/admin/marketing/shared';

type StaticPage = Record<string, string | number | boolean | null> & {
    id: number;
};
type Props = {
    mode: 'create' | 'edit';
    page: StaticPage | null;
    types: string[];
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function PageForm({ mode, page, types }: Props) {
    const isEdit = mode === 'edit' && page !== null;
    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        title: String(page?.title ?? ''),
        slug: String(page?.slug ?? ''),
        content: String(page?.content ?? ''),
        type: String(page?.type ?? 'about'),
        meta_title: String(page?.meta_title ?? ''),
        meta_description: String(page?.meta_description ?? ''),
        is_active: Boolean(page?.is_active ?? true),
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(isEdit ? `/admin/pages/${page.id}` : '/admin/pages');
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Page' : 'Create Page'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Content Management"
                    title={isEdit ? 'Edit Page' : 'Create Page'}
                    description="Kelola konten statis dan metadata SEO untuk halaman customer."
                />
                <Card>
                    <CardHeader>
                        <CardTitle>Page Content</CardTitle>
                        <CardDescription>
                            Gunakan textarea sebagai rich-content baseline;
                            konten bisa ditulis HTML/markdown sesuai kebutuhan
                            render customer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={data.title}
                                        onChange={(event) => {
                                            setData(
                                                'title',
                                                event.target.value,
                                            );

                                            if (!data.slug) {
                                                setData(
                                                    'slug',
                                                    slugify(event.target.value),
                                                );
                                            }
                                        }}
                                    />
                                    <InputError message={errors.title} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Slug</Label>
                                    <Input
                                        value={data.slug}
                                        onChange={(event) =>
                                            setData(
                                                'slug',
                                                slugify(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError message={errors.slug} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <select
                                        value={data.type}
                                        onChange={(event) =>
                                            setData('type', event.target.value)
                                        }
                                        className={textInputClass()}
                                    >
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Meta Title</Label>
                                    <Input
                                        value={data.meta_title}
                                        onChange={(event) =>
                                            setData(
                                                'meta_title',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.meta_title} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Content</Label>
                                <textarea
                                    value={data.content}
                                    onChange={(event) =>
                                        setData('content', event.target.value)
                                    }
                                    className={`${textInputClass()} min-h-80 font-mono`}
                                />
                                <InputError message={errors.content} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Meta Description</Label>
                                <textarea
                                    value={data.meta_description}
                                    onChange={(event) =>
                                        setData(
                                            'meta_description',
                                            event.target.value,
                                        )
                                    }
                                    className={`${textInputClass()} min-h-24`}
                                />
                                <InputError message={errors.meta_description} />
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
                                        Active page
                                    </span>
                                    <span className="text-muted-foreground">
                                        Page inactive tidak ditampilkan ke
                                        customer.
                                    </span>
                                </span>
                            </label>
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/pages">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save /> Save Page
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
