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

type Collection = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    banner_desktop_url: string | null;
    banner_mobile_url: string | null;
    is_featured: boolean;
    is_active: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    collection: Collection | null;
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function ImageUploadField({
    label,
    currentUrl,
    previewUrl,
    onPreviewChange,
    onFileChange,
    error,
    description,
}: {
    label: string;
    currentUrl: string | null;
    previewUrl: string | null;
    onPreviewChange: (url: string | null) => void;
    onFileChange: (file: File | null) => void;
    error?: string;
    description: string;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        onFileChange(file);

        if (file) {
onPreviewChange(URL.createObjectURL(file));
}
    };

    const clear = () => {
        onFileChange(null);
        onPreviewChange(null);

        if (fileInputRef.current) {
fileInputRef.current.value = '';
}
    };

    const display = previewUrl ?? currentUrl;

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="relative flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {display ? (
                        <>
                            <img src={display} alt="Preview" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={clear}
                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    )}
                </div>
                <div
                    className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center transition hover:border-primary/60 hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Klik untuk upload gambar</p>
                    <p className="text-xs text-muted-foreground/60">{description}</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleChange}
                    />
                </div>
            </div>
            {error && <InputError message={error} />}
        </div>
    );
}

export default function CollectionForm({ mode, collection }: Props) {
    const isEdit = mode === 'edit' && collection !== null;

    const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        name: collection?.name ?? '',
        slug: collection?.slug ?? '',
        description: collection?.description ?? '',
        banner_desktop: null as File | null,
        banner_mobile: null as File | null,
        is_featured: collection?.is_featured ?? false,
        is_active: collection?.is_active ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = isEdit ? `/admin/collections/${collection.id}` : '/admin/collections';
        post(url, { forceFormData: true });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Collection' : 'Create Collection'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={isEdit ? 'Edit Collection' : 'Create Collection'}
                    description="Collection aktif bisa dipakai untuk campaign dan assignment produk."
                />

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Collection Information</CardTitle>
                        <CardDescription>
                            Upload banner desktop (landscape) dan mobile (portrait) untuk collection ini.
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

                            <ImageUploadField
                                label="Desktop Banner"
                                currentUrl={collection?.banner_desktop_url ?? null}
                                previewUrl={desktopPreview}
                                onPreviewChange={setDesktopPreview}
                                onFileChange={(file) => setData('banner_desktop', file)}
                                error={errors.banner_desktop}
                                description="Landscape — maks. 4 MB (JPG, PNG, WEBP)"
                            />

                            <ImageUploadField
                                label="Mobile Banner"
                                currentUrl={collection?.banner_mobile_url ?? null}
                                previewUrl={mobilePreview}
                                onPreviewChange={setMobilePreview}
                                onFileChange={(file) => setData('banner_mobile', file)}
                                error={errors.banner_mobile}
                                description="Portrait — maks. 2 MB (JPG, PNG, WEBP)"
                            />

                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.is_featured}
                                        onChange={(event) => setData('is_featured', event.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block font-medium">Featured collection</span>
                                        <span className="text-muted-foreground">Bisa ditampilkan di homepage.</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) => setData('is_active', event.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block font-medium">Active collection</span>
                                        <span className="text-muted-foreground">Collection aktif bisa tampil ke customer.</span>
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/collections">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    Save Collection
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
