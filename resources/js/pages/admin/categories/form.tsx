import { Head, Link, useForm } from '@inertiajs/react';
import { ImageIcon, Save, Upload, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
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
import { PageHeader } from '@/pages/admin/catalog/shared';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    category: Category | null;
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function CategoryForm({ mode, category }: Props) {
    const isEdit = mode === 'edit' && category !== null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(category?.image_url ?? null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        image: null as File | null,
        is_active: category?.is_active ?? true,
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setData('image', null);
        setPreview(null);

        if (fileInputRef.current) {
fileInputRef.current.value = '';
}
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = isEdit ? `/admin/categories/${category.id}` : '/admin/categories';
        post(url, { forceFormData: true });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Category' : 'Create Category'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={isEdit ? 'Edit Category' : 'Create Category'}
                    description="Nama dan slug category digunakan sebagai pengelompokan katalog customer."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Category Information</CardTitle>
                        <CardDescription>
                            Upload gambar category langsung dari komputer kamu (maks. 2 MB).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => {
                                            setData('name', event.target.value);

                                            if (!data.slug) {
                                                setData('slug', slugify(event.target.value));
                                            }
                                        }}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(event) => setData('slug', slugify(event.target.value))}
                                    />
                                    <InputError message={errors.slug} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Image Upload */}
                            <div className="grid gap-2">
                                <Label>Category Image</Label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                    {/* Preview */}
                                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {preview ? (
                                            <>
                                                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={clearImage}
                                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    {/* Drop zone */}
                                    <div
                                        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition hover:border-primary/60 hover:bg-muted/50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Klik untuk upload atau drag &amp; drop gambar
                                        </p>
                                        <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP — maks. 2 MB</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                <InputError message={errors.image} />
                            </div>

                            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(event) => setData('is_active', event.target.checked)}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block font-medium">Active category</span>
                                    <span className="text-muted-foreground">
                                        Category aktif bisa ditampilkan sebagai filter customer.
                                    </span>
                                </span>
                            </label>
                            <InputError message={errors.is_active} />

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/categories">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    Save Category
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
