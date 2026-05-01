import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
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
import { PageHeader } from '@/pages/admin/catalog/shared';

type Option = { id: number; name: string };
type ProductImagePayload = {
    id?: number;
    image_url: string | null;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
};
type ProductImageRow = ProductImagePayload & {
    image: File | null;
};
type ProductVariantRow = {
    id?: number;
    sku: string;
    color_name: string;
    color_hex: string;
    size: string;
    additional_price: string | number;
    stock: string | number;
    reserved_stock: string | number;
    image_url: string;
    is_active: boolean;
};
type ProductFormData = {
    category_id: string | number;
    collection_id: string | number;
    name: string;
    slug: string;
    sku: string;
    short_description: string;
    description: string;
    material: string;
    care_instruction: string;
    base_price: string | number;
    sale_price: string | number;
    weight: string | number;
    length: string | number;
    width: string | number;
    height: string | number;
    status: string;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    meta_title: string;
    meta_description: string;
    images: ProductImageRow[];
    variants: ProductVariantRow[];
};
type Product = Omit<ProductFormData, 'images'> & {
    id: number;
    images: ProductImagePayload[];
};

type Props = {
    mode: 'create' | 'edit';
    product: Product | null;
    options: {
        categories: Option[];
        collections: Option[];
        statuses: string[];
    };
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const blankImage = (): ProductImageRow => ({
    image: null,
    image_url: null,
    alt_text: '',
    sort_order: 0,
    is_primary: false,
});

const blankVariant = (): ProductVariantRow => ({
    sku: '',
    color_name: '',
    color_hex: '',
    size: '',
    additional_price: 0,
    stock: 0,
    reserved_stock: 0,
    image_url: '',
    is_active: true,
});

export default function ProductForm({ mode, product, options }: Props) {
    const isEdit = mode === 'edit' && product !== null;
    const { data, setData, post, put, processing, errors } =
        useForm<ProductFormData>({
            category_id: product?.category_id ?? '',
            collection_id: product?.collection_id ?? '',
            name: product?.name ?? '',
            slug: product?.slug ?? '',
            sku: product?.sku ?? '',
            short_description: product?.short_description ?? '',
            description: product?.description ?? '',
            material: product?.material ?? '',
            care_instruction: product?.care_instruction ?? '',
            base_price: product?.base_price ?? 0,
            sale_price: product?.sale_price ?? '',
            weight: product?.weight ?? 0,
            length: product?.length ?? '',
            width: product?.width ?? '',
            height: product?.height ?? '',
            status: product?.status ?? 'draft',
            is_featured: product?.is_featured ?? false,
            is_new_arrival: product?.is_new_arrival ?? false,
            is_best_seller: product?.is_best_seller ?? false,
            meta_title: product?.meta_title ?? '',
            meta_description: product?.meta_description ?? '',
            images: product?.images?.length
                ? product.images.map((image) => ({ ...image, image: null }))
                : [blankImage()],
            variants: product?.variants?.length ? product.variants : [blankVariant()],
        });

    const fieldError = (key: string) =>
        (errors as Record<string, string | undefined>)[key];

    const updateImage = (
        index: number,
        field: keyof ProductImageRow,
        value: ProductImageRow[keyof ProductImageRow],
    ) => {
        const next = [...data.images];
        next[index] = { ...next[index], [field]: value };
        setData('images', next);
    };

    const updateVariant = (
        index: number,
        field: keyof ProductVariantRow,
        value: string | number | boolean,
    ) => {
        const next = [...data.variants];
        next[index] = { ...next[index], [field]: value };
        setData('variants', next);
    };

    const setPrimaryImage = (index: number) => {
        setData(
            'images',
            data.images.map((image, imageIndex) => ({
                ...image,
                is_primary: imageIndex === index,
            })),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEdit) {
            put(`/admin/products/${product.id}`, { forceFormData: true });

            return;
        }

        post('/admin/products', { forceFormData: true });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Product' : 'Create Product'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={isEdit ? 'Edit Product' : 'Create Product'}
                    description="Kelola data utama, gambar, varian, stok awal, label, dan SEO product."
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>
                                Produk published membutuhkan gambar utama,
                                varian aktif dengan stok, harga, dan berat valid.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name</Label>
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
                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" value={data.sku} onChange={(event) => setData('sku', event.target.value)} />
                                <InputError message={errors.sku} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(event) => setData('status', event.target.value)}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                                >
                                    {options.statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(event) => setData('category_id', event.target.value)}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                                >
                                    <option value="">No category</option>
                                    {options.categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="collection_id">Collection</Label>
                                <select
                                    id="collection_id"
                                    value={data.collection_id}
                                    onChange={(event) => setData('collection_id', event.target.value)}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                                >
                                    <option value="">No collection</option>
                                    {options.collections.map((collection) => (
                                        <option key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.collection_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="base_price">Base Price</Label>
                                <Input id="base_price" type="number" min="0" value={data.base_price} onChange={(event) => setData('base_price', event.target.value)} />
                                <InputError message={errors.base_price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sale_price">Sale Price</Label>
                                <Input id="sale_price" type="number" min="0" value={data.sale_price} onChange={(event) => setData('sale_price', event.target.value)} />
                                <InputError message={errors.sale_price} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Weight (gram)</Label>
                                <Input id="weight" type="number" min="0" value={data.weight} onChange={(event) => setData('weight', event.target.value)} />
                                <InputError message={errors.weight} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(['length', 'width', 'height'] as const).map((field) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor={field}>{field}</Label>
                                        <Input id={field} type="number" min="0" value={data[field]} onChange={(event) => setData(field, event.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="short_description">Short Description</Label>
                                <textarea id="short_description" value={data.short_description} onChange={(event) => setData('short_description', event.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]" />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-32 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="material">Material</Label>
                                <Input id="material" value={data.material} onChange={(event) => setData('material', event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="care_instruction">Care Instruction</Label>
                                <Input id="care_instruction" value={data.care_instruction} onChange={(event) => setData('care_instruction', event.target.value)} />
                            </div>
                            <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
                                {[
                                    ['is_featured', 'Featured'],
                                    ['is_new_arrival', 'New Arrival'],
                                    ['is_best_seller', 'Best Seller'],
                                ].map(([field, label]) => (
                                    <label key={field} className="flex items-center gap-3 rounded-lg border p-4 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(data[field as keyof ProductFormData])}
                                            onChange={(event) => setData(field as keyof ProductFormData, event.target.checked)}
                                        />
                                        <span className="font-medium">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Images</CardTitle>
                                <CardDescription>Upload foto produk, alt text, urutan, dan primary image.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setData('images', [...data.images, blankImage()])}>
                                <Plus />
                                Add Image
                            </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <InputError message={fieldError('images')} />
                            {data.images.map((image, index) => (
                                <div key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px_140px_auto]">
                                    <div className="grid gap-2">
                                        <Label>Image</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => updateImage(index, 'image', event.target.files?.[0] ?? null)}
                                        />
                                        {image.image_url && (
                                            <a href={image.image_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                                                Lihat gambar saat ini
                                            </a>
                                        )}
                                        <InputError message={fieldError(`images.${index}.image`)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Alt Text</Label>
                                        <Input value={image.alt_text} onChange={(event) => updateImage(index, 'alt_text', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sort</Label>
                                        <Input type="number" value={image.sort_order} onChange={(event) => updateImage(index, 'sort_order', event.target.value)} />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="radio" checked={image.is_primary} onChange={() => setPrimaryImage(index)} />
                                        Primary image
                                    </label>
                                    <Button type="button" variant="outline" onClick={() => setData('images', data.images.filter((_, imageIndex) => imageIndex !== index))}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Variants</CardTitle>
                                <CardDescription>SKU varian harus unik dan reserved stock tidak boleh melebihi stock.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setData('variants', [...data.variants, blankVariant()])}>
                                <Plus />
                                Add Variant
                            </Button>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <InputError message={fieldError('variants')} />
                            {data.variants.map((variant, index) => (
                                <div key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
                                    <div className="grid gap-2">
                                        <Label>Variant SKU</Label>
                                        <Input value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} />
                                        <InputError message={fieldError(`variants.${index}.sku`)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Color Name</Label>
                                        <Input value={variant.color_name} onChange={(event) => updateVariant(index, 'color_name', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Color Hex</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="color"
                                                value={variant.color_hex || '#000000'}
                                                onChange={(event) => updateVariant(index, 'color_hex', event.target.value)}
                                                className="h-9 w-14 p-1"
                                            />
                                            <Input value={variant.color_hex || '#000000'} readOnly className="font-mono text-xs" />
                                        </div>
                                        <InputError message={fieldError(`variants.${index}.color_hex`)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Size</Label>
                                        <Input value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Additional Price</Label>
                                        <Input type="number" min="0" value={variant.additional_price} onChange={(event) => updateVariant(index, 'additional_price', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Stock</Label>
                                        <Input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} />
                                        <InputError message={fieldError(`variants.${index}.stock`)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Reserved</Label>
                                        <Input type="number" min="0" value={variant.reserved_stock} onChange={(event) => updateVariant(index, 'reserved_stock', event.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Image URL</Label>
                                        <Input value={variant.image_url} onChange={(event) => updateVariant(index, 'image_url', event.target.value)} />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 md:col-span-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={variant.is_active} onChange={(event) => updateVariant(index, 'is_active', event.target.checked)} />
                                            Active variant
                                        </label>
                                        <Button type="button" variant="outline" onClick={() => setData('variants', data.variants.filter((_, variantIndex) => variantIndex !== index))}>
                                            <Trash2 />
                                            Remove Variant
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Preview</CardTitle>
                            <CardDescription>Metadata default untuk halaman product.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input id="meta_title" value={data.meta_title} onChange={(event) => setData('meta_title', event.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Input id="meta_description" value={data.meta_description} onChange={(event) => setData('meta_description', event.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button asChild type="button" variant="outline">
                            <Link href={isEdit ? `/admin/products/${product.id}` : '/admin/products'}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save />
                            Save Product
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
