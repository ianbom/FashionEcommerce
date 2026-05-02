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

type Product = { id: number; name: string };
type Variant = {
    id: number;
    product_id: number;
    product: string | null;
    sku: string;
    color_name: string | null;
    color_hex: string | null;
    size: string | null;
    additional_price: string;
    stock: number;
    reserved_stock: number;
    image_url: string | null;
    is_active: boolean;
};

type Props = {
    mode: 'create' | 'edit';
    variant: Variant | null;
    products: Product[];
    selectedProductId: number | null;
};

export default function ProductVariantForm({
    mode,
    variant,
    products,
    selectedProductId,
}: Props) {
    const isEdit = mode === 'edit' && variant !== null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(
        variant?.image_url ?? null,
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        product_id: variant?.product_id ?? selectedProductId ?? '',
        sku: variant?.sku ?? '',
        color_name: variant?.color_name ?? '',
        color_hex: variant?.color_hex ?? '',
        size: variant?.size ?? '',
        additional_price: variant?.additional_price ?? 0,
        stock: variant?.stock ?? 0,
        reserved_stock: variant?.reserved_stock ?? 0,
        image: null as File | null,
        is_active: variant?.is_active ?? true,
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
        const url = isEdit
            ? `/admin/product-variants/${variant.id}`
            : '/admin/product-variants';
        post(url, { forceFormData: true });
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Variant' : 'Create Variant'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title={isEdit ? 'Edit Variant' : 'Create Variant'}
                    description="SKU varian unik, stok tidak negatif, dan reserved stock tidak boleh lebih besar dari stok."
                />
                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Variant Information</CardTitle>
                        <CardDescription>
                            Perubahan stok melalui form ini tetap dicatat ke
                            stock logs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex flex-col gap-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="product_id">Product</Label>
                                    <select
                                        id="product_id"
                                        value={data.product_id}
                                        onChange={(event) =>
                                            setData(
                                                'product_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    >
                                        <option value="">Select product</option>
                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.product_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(event) =>
                                            setData('sku', event.target.value)
                                        }
                                    />
                                    <InputError message={errors.sku} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="color_name">
                                        Color Name
                                    </Label>
                                    <Input
                                        id="color_name"
                                        value={data.color_name}
                                        onChange={(event) =>
                                            setData(
                                                'color_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="color_hex">Color Hex</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="color_hex"
                                            type="color"
                                            value={data.color_hex || '#000000'}
                                            onChange={(event) =>
                                                setData(
                                                    'color_hex',
                                                    event.target.value,
                                                )
                                            }
                                            className="h-9 w-14 p-1"
                                        />
                                        <Input
                                            value={data.color_hex || '#000000'}
                                            readOnly
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                    <InputError message={errors.color_hex} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="size">Size</Label>
                                    <Input
                                        id="size"
                                        value={data.size}
                                        onChange={(event) =>
                                            setData('size', event.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="additional_price">
                                        Additional Price
                                    </Label>
                                    <Input
                                        id="additional_price"
                                        type="number"
                                        min="0"
                                        value={data.additional_price}
                                        onChange={(event) =>
                                            setData(
                                                'additional_price',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min="0"
                                        value={data.stock}
                                        onChange={(event) =>
                                            setData(
                                                'stock',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError message={errors.stock} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reserved_stock">
                                        Reserved Stock
                                    </Label>
                                    <Input
                                        id="reserved_stock"
                                        type="number"
                                        min="0"
                                        value={data.reserved_stock}
                                        onChange={(event) =>
                                            setData(
                                                'reserved_stock',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.reserved_stock}
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label>Variant Image</Label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                    {/* Preview */}
                                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                        {preview ? (
                                            <>
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearImage}
                                                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
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
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Klik untuk upload atau drag &amp;
                                            drop gambar
                                        </p>
                                        <p className="text-xs text-muted-foreground/60">
                                            JPG, PNG, WEBP — maks. 2 MB
                                        </p>
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
                                        Active variant
                                    </span>
                                    <span className="text-muted-foreground">
                                        Varian aktif bisa tampil dan dibeli
                                        customer jika stok tersedia.
                                    </span>
                                </span>
                            </label>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button asChild type="button" variant="outline">
                                    <Link href="/admin/product-variants">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save />
                                    Save Variant
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
