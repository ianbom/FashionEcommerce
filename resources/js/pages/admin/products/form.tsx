import { Head, Link, useForm } from '@inertiajs/react';
import {
    Image as ImageIcon, Plus, Trash2, X, Info,
    GripVertical, AlertTriangle, Check,
    Layers, Tag, DollarSign, Package, Star, Sparkles, TrendingUp, LayoutGrid
} from 'lucide-react';
import { type FormEvent, useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

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

function SectionCard({ title, description, children, icon }: {
    title: string;
    description?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-start gap-3">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
                    {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

function FieldRow({ children, cols = 1 }: { children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }) {
    const gridClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4',
    }[cols];
    return <div className={`grid ${gridClass} gap-4`}>{children}</div>;
}

function FieldGroup({ label, hint, required, error, children, charCount, maxChar }: {
    label: string;
    hint?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    charCount?: number;
    maxChar?: number;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-zinc-700">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {maxChar !== undefined && (
                    <span className={`text-[11px] tabular-nums ${(charCount ?? 0) > maxChar * 0.9 ? 'text-amber-500' : 'text-zinc-400'}`}>
                        {charCount ?? 0}/{maxChar}
                    </span>
                )}
            </div>
            {children}
            {error && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
            {hint && !error && <p className="text-[11px] text-zinc-400">{hint}</p>}
        </div>
    );
}

export default function ProductForm({ mode, product, options }: Props) {
    const isEdit = mode === 'edit' && product !== null;
    const { data, setData, post, processing, errors, transform } =
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
            base_price: product?.base_price ?? '',
            sale_price: product?.sale_price ?? '',
            weight: product?.weight ?? '',
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

    // Local blob previews — never sent to server, never stored in image_url
    const [previews, setPreviews] = useState<(string | null)[]>(() =>
        (product?.images ?? [{ image_url: null }]).map(img => img.image_url ?? null)
    );

    // Revoke old blob URLs on unmount to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach(url => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            transform((data) => ({ ...data, _method: 'put' }));
            post(`/admin/products/${product.id}`, { forceFormData: true });
            return;
        }
        transform((data) => data);
        post('/admin/products', { forceFormData: true });
    };

    const variantsCount = data.variants.filter(v => v.sku).length;
    // Preview: use blob URL if new file selected, else fall back to stored image_url
    const getPreview = (index: number): string | null =>
        previews[index] ?? data.images[index]?.image_url ?? null;
    const primaryIndex = data.images.findIndex(i => i.is_primary);
    const primaryPreview = getPreview(primaryIndex >= 0 ? primaryIndex : 0);

    const statusColors: Record<string, string> = {
        draft: 'bg-zinc-100 text-zinc-600',
        published: 'bg-emerald-100 text-emerald-700',
        archived: 'bg-rose-100 text-rose-700',
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Product' : 'Create Product'} />

            <div className="min-h-screen bg-zinc-50/50">
                {/* Page Header */}
                <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={isEdit ? `/admin/products/${product?.id}` : '/admin/products'}
                                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                </Link>
                                <div className="w-px h-5 bg-zinc-200" />
                                <div>
                                    <h1 className="text-sm font-semibold text-zinc-900">
                                        {isEdit ? `Edit: ${product?.name ?? 'Product'}` : 'Create Product'}
                                    </h1>
                                    <p className="text-[11px] text-zinc-400 hidden sm:block">
                                        {isEdit ? 'Update product details, images, and variants' : 'Fill in details to create a new product'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={`text-[11px] font-medium capitalize border-0 ${statusColors[data.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                                    {data.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">

                            {/* ── Main Column ── */}
                            <div className="flex flex-col gap-5">

                                {/* 1. Basic Information */}
                                <SectionCard
                                    title="Basic Information"
                                    description="Essential details about your product"
                                    icon={<Tag className="w-4 h-4 text-zinc-500" />}
                                >
                                    <div className="space-y-4">
                                        <FieldRow cols={2}>
                                            <FieldGroup label="Product Name" required error={errors.name}>
                                                <Input
                                                    value={data.name}
                                                    onChange={(e) => {
                                                        setData('name', e.target.value);
                                                        if (!isEdit) setData('slug', slugify(e.target.value));
                                                    }}
                                                    placeholder="e.g. Gamis Syar'i Pita"
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25]"
                                                />
                                            </FieldGroup>
                                            <FieldGroup label="SKU" required error={errors.sku} hint="Unique product identifier">
                                                <Input
                                                    value={data.sku}
                                                    onChange={(e) => setData('sku', e.target.value)}
                                                    placeholder="e.g. GMS-001"
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                                />
                                            </FieldGroup>
                                        </FieldRow>

                                        <FieldGroup label="URL Slug" required error={errors.slug} hint="Used in the product URL — lowercase letters, numbers, hyphens only">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={data.slug}
                                                    onChange={(e) => setData('slug', slugify(e.target.value))}
                                                    placeholder="e.g. gamis-syari-pita"
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-3 text-xs shrink-0 border-zinc-200"
                                                    onClick={() => setData('slug', slugify(data.name))}
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                        </FieldGroup>

                                        <FieldRow cols={2}>
                                            <FieldGroup label="Category" error={errors.category_id}>
                                                <select
                                                    value={data.category_id}
                                                    onChange={(e) => setData('category_id', e.target.value)}
                                                    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#422d25] focus:outline-none focus:ring-1 focus:ring-[#422d25]"
                                                >
                                                    <option value="">No category</option>
                                                    {options.categories.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </FieldGroup>
                                            <FieldGroup label="Collection" error={errors.collection_id}>
                                                <select
                                                    value={data.collection_id}
                                                    onChange={(e) => setData('collection_id', e.target.value)}
                                                    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#422d25] focus:outline-none focus:ring-1 focus:ring-[#422d25]"
                                                >
                                                    <option value="">No collection</option>
                                                    {options.collections.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </FieldGroup>
                                        </FieldRow>

                                        <FieldGroup
                                            label="Short Description"
                                            required
                                            error={errors.short_description}
                                            charCount={data.short_description?.length}
                                            maxChar={160}
                                        >
                                            <Input
                                                value={data.short_description}
                                                onChange={(e) => setData('short_description', e.target.value)}
                                                placeholder="Brief product summary for listings"
                                                className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25]"
                                            />
                                        </FieldGroup>

                                        <FieldGroup label="Description" required error={errors.description}>
                                            <Textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Detailed product description..."
                                                className="min-h-[120px] text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] resize-y"
                                            />
                                        </FieldGroup>
                                    </div>
                                </SectionCard>

                                {/* 2. Material & Care */}
                                <SectionCard
                                    title="Material & Care"
                                    description="Material composition and care instructions"
                                    icon={<Info className="w-4 h-4 text-zinc-500" />}
                                >
                                    <FieldRow cols={2}>
                                        <FieldGroup label="Material" required error={errors.material} hint="e.g. 100% Premium Voile, Linen">
                                            <Textarea
                                                value={data.material}
                                                onChange={(e) => setData('material', e.target.value)}
                                                placeholder="Describe material composition..."
                                                className="min-h-[90px] text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] resize-y"
                                            />
                                        </FieldGroup>
                                        <FieldGroup label="Care Instruction" required error={errors.care_instruction} hint="e.g. Hand wash cold, do not bleach">
                                            <Textarea
                                                value={data.care_instruction}
                                                onChange={(e) => setData('care_instruction', e.target.value)}
                                                placeholder="Washing and care instructions..."
                                                className="min-h-[90px] text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] resize-y"
                                            />
                                        </FieldGroup>
                                    </FieldRow>
                                </SectionCard>

                                {/* 3. Pricing */}
                                <SectionCard
                                    title="Pricing"
                                    description="Set base and sale prices (IDR)"
                                    icon={<DollarSign className="w-4 h-4 text-zinc-500" />}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <FieldGroup label="Base Price (IDR)" required error={errors.base_price}>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={data.base_price}
                                                    onChange={(e) => setData('base_price', e.target.value)}
                                                    placeholder="0"
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                                />
                                            </FieldGroup>
                                            <FieldGroup label="Sale Price (IDR)" error={errors.sale_price} hint="Must be lower than or equal to base price">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={data.sale_price}
                                                    onChange={(e) => setData('sale_price', e.target.value)}
                                                    placeholder="Leave empty for no discount"
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                                />
                                            </FieldGroup>
                                        </div>

                                        {/* Pricing Summary */}
                                        <div className="bg-zinc-50 rounded-lg border border-zinc-100 p-4 flex flex-col justify-between">
                                            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3">Price Summary</p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-zinc-500">Base</span>
                                                    <span className="font-mono text-zinc-900">IDR {Number(data.base_price || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-zinc-500">Sale</span>
                                                    <span className="font-mono text-zinc-900">IDR {Number(data.sale_price || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="border-t border-zinc-200 border-dashed pt-2 mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-semibold text-zinc-900">Final</span>
                                                        <span className="font-mono font-bold text-base text-[#422d25]">
                                                            IDR {Number(data.sale_price || data.base_price || 0).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {data.sale_price && Number(data.sale_price) < Number(data.base_price) && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-medium">
                                                            {Math.round((1 - Number(data.sale_price) / Number(data.base_price)) * 100)}% OFF
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 4. Shipping & Dimensions */}
                                <SectionCard
                                    title="Shipping & Dimensions"
                                    description="Used for shipping cost calculations"
                                    icon={<Package className="w-4 h-4 text-zinc-500" />}
                                >
                                    <FieldRow cols={4}>
                                        <FieldGroup label="Weight (g)" required error={errors.weight}>
                                            <Input
                                                type="number" min="0"
                                                value={data.weight}
                                                onChange={(e) => setData('weight', e.target.value)}
                                                placeholder="0"
                                                className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                            />
                                        </FieldGroup>
                                        <FieldGroup label="Length (cm)" required error={errors.length}>
                                            <Input
                                                type="number" min="0"
                                                value={data.length}
                                                onChange={(e) => setData('length', e.target.value)}
                                                placeholder="0"
                                                className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                            />
                                        </FieldGroup>
                                        <FieldGroup label="Width (cm)" required error={errors.width}>
                                            <Input
                                                type="number" min="0"
                                                value={data.width}
                                                onChange={(e) => setData('width', e.target.value)}
                                                placeholder="0"
                                                className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                            />
                                        </FieldGroup>
                                        <FieldGroup label="Height (cm)" required error={errors.height}>
                                            <Input
                                                type="number" min="0"
                                                value={data.height}
                                                onChange={(e) => setData('height', e.target.value)}
                                                placeholder="0"
                                                className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] font-mono"
                                            />
                                        </FieldGroup>
                                    </FieldRow>
                                </SectionCard>

                                {/* 5. Product Images */}
                                <SectionCard
                                    title="Product Images"
                                    description="Upload high-quality product photos (recommended: 800×1067px)"
                                    icon={<ImageIcon className="w-4 h-4 text-zinc-500" />}
                                >
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {data.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`relative rounded-lg border-2 overflow-hidden group transition-all ${image.is_primary
                                                    ? 'border-[#422d25] ring-2 ring-[#422d25]/20'
                                                    : 'border-zinc-200 hover:border-zinc-300'
                                                    }`}
                                            >
                                                {/* Image area */}
                                                <div className="aspect-[3/4] bg-zinc-50 relative flex items-center justify-center">
                                                    {getPreview(index) ? (
                                                        <img
                                                            src={getPreview(index)!}
                                                            className="w-full h-full object-cover"
                                                            alt={image.alt_text}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-zinc-300">
                                                            <ImageIcon className="w-7 h-7" />
                                                            <span className="text-[10px]">Click to upload</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            // Store File object for upload — do NOT touch image_url
                                                            updateImage(index, 'image', file);
                                                            // Preview via blob URL (local only, never sent to server)
                                                            const next = [...previews];
                                                            if (next[index] && next[index]!.startsWith('blob:')) {
                                                                URL.revokeObjectURL(next[index]!);
                                                            }
                                                            next[index] = file ? URL.createObjectURL(file) : null;
                                                            setPreviews(next);
                                                        }}
                                                    />
                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (previews[index]?.startsWith('blob:')) {
                                                                URL.revokeObjectURL(previews[index]!);
                                                            }
                                                            setData('images', data.images.filter((_, i) => i !== index));
                                                            setPreviews(previews.filter((_, i) => i !== index));
                                                        }}
                                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 border border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {/* Primary badge */}
                                                    {image.is_primary && (
                                                        <div className="absolute bottom-1.5 left-1.5 bg-[#422d25] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider z-10">
                                                            Primary
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Controls */}
                                                <div className="px-2 py-1.5 bg-white border-t border-zinc-100 space-y-1">
                                                    <input
                                                        type="text"
                                                        value={image.alt_text}
                                                        onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                                                        placeholder="Alt text"
                                                        className="w-full text-[10px] text-zinc-700 border border-zinc-100 rounded px-1.5 py-0.5 focus:ring-0 focus:border-zinc-300 bg-zinc-50 placeholder:text-zinc-300"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                checked={image.is_primary}
                                                                onChange={() => setPrimaryImage(index)}
                                                                className="w-3 h-3 accent-[#422d25]"
                                                            />
                                                            <span className="text-[10px] text-zinc-500">Primary</span>
                                                        </label>
                                                        <div className="flex items-center gap-0.5">
                                                            <span className="text-[10px] text-zinc-400">Order:</span>
                                                            <input
                                                                type="number"
                                                                value={image.sort_order}
                                                                onChange={(e) => updateImage(index, 'sort_order', Number(e.target.value))}
                                                                className="w-8 text-center text-[10px] border border-zinc-100 rounded bg-zinc-50 focus:ring-0 focus:border-zinc-300 py-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add image button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('images', [...data.images, blankImage()]);
                                                setPreviews([...previews, null]);
                                            }}
                                            className="aspect-[3/4] rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                        >
                                            <Plus className="w-6 h-6" />
                                            <span className="text-[11px] font-medium">Add Image</span>
                                        </button>
                                    </div>
                                    {fieldError('images') && (
                                        <p className="mt-3 text-[11px] text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />{fieldError('images')}
                                        </p>
                                    )}
                                </SectionCard>

                                {/* 6. Product Variants */}
                                <SectionCard
                                    title="Product Variants"
                                    description="Add size/color combinations with individual stock and pricing"
                                    icon={<Layers className="w-4 h-4 text-zinc-500" />}
                                >
                                    <div className="rounded-lg border border-zinc-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs min-w-[700px]">
                                                <thead>
                                                    <tr className="bg-zinc-50 border-b border-zinc-200">
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 w-8"></th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500">Variant SKU</th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500">Color Name</th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 w-28">Color</th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500 w-20">Size</th>
                                                        <th className="px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500 w-24">Price Add.</th>
                                                        <th className="px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500 w-20">Stock</th>
                                                        <th className="px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500 w-20">Reserved</th>
                                                        <th className="px-3 py-2.5 text-center text-[11px] font-medium text-zinc-500 w-16">Active</th>
                                                        <th className="px-3 py-2.5 text-center text-[11px] font-medium text-zinc-500 w-12"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                    {data.variants.map((variant, index) => (
                                                        <tr key={index} className="group hover:bg-zinc-50/60 transition-colors">
                                                            <td className="px-3 py-2 text-center">
                                                                <GripVertical className="w-3.5 h-3.5 text-zinc-300 cursor-grab" />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    value={variant.sku}
                                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                                    className={`h-7 text-xs font-mono border-zinc-200 ${fieldError(`variants.${index}.sku`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    value={variant.color_name}
                                                                    onChange={(e) => updateVariant(index, 'color_name', e.target.value)}
                                                                    className={`h-7 text-xs border-zinc-200 ${fieldError(`variants.${index}.color_name`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <div className={`flex items-center gap-2 border rounded px-2 h-7 bg-white ${fieldError(`variants.${index}.color_hex`) ? 'border-red-300' : 'border-zinc-200'}`}>
                                                                    <div className="relative w-4 h-4 rounded-full border border-zinc-200 overflow-hidden shrink-0">
                                                                        <input
                                                                            type="color"
                                                                            value={variant.color_hex || '#000000'}
                                                                            onChange={(e) => updateVariant(index, 'color_hex', e.target.value)}
                                                                            className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer border-none p-0"
                                                                        />
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={variant.color_hex || '#000000'}
                                                                        readOnly
                                                                        className="w-14 border-none bg-transparent p-0 text-[11px] font-mono text-zinc-600 focus:ring-0"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    value={variant.size}
                                                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                                    className={`h-7 text-xs text-center border-zinc-200 ${fieldError(`variants.${index}.size`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    type="number" min="0"
                                                                    value={variant.additional_price}
                                                                    onChange={(e) => updateVariant(index, 'additional_price', e.target.value)}
                                                                    className={`h-7 text-xs text-right font-mono border-zinc-200 ${fieldError(`variants.${index}.additional_price`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    type="number" min="0"
                                                                    value={variant.stock}
                                                                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                                    className={`h-7 text-xs text-right font-mono border-zinc-200 ${fieldError(`variants.${index}.stock`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Input
                                                                    type="number" min="0"
                                                                    value={variant.reserved_stock}
                                                                    onChange={(e) => updateVariant(index, 'reserved_stock', e.target.value)}
                                                                    className={`h-7 text-xs text-right font-mono border-zinc-200 ${fieldError(`variants.${index}.reserved_stock`) ? 'border-red-300' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <Switch
                                                                    checked={variant.is_active}
                                                                    onCheckedChange={(v) => updateVariant(index, 'is_active', v)}
                                                                    className="scale-[0.8] data-[state=checked]:bg-[#422d25]"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('variants', data.variants.filter((_, i) => i !== index))}
                                                                    className="w-6 h-6 rounded flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all mx-auto"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-3 py-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setData('variants', [...data.variants, blankVariant()])}
                                                className="h-7 text-xs gap-1.5 bg-white border-zinc-200 text-zinc-700"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Variant
                                            </Button>
                                            <span className="text-[11px] text-zinc-400">{variantsCount} variant{variantsCount !== 1 ? 's' : ''} with SKU</span>
                                        </div>
                                    </div>
                                    {fieldError('variants') && (
                                        <p className="mt-2 text-[11px] text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />{fieldError('variants')}
                                        </p>
                                    )}
                                </SectionCard>

                                {/* 7. SEO Metadata */}
                                <SectionCard
                                    title="SEO Metadata"
                                    description="Optimize your product for search engines"
                                    icon={
                                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    }
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <FieldGroup
                                                label="Meta Title"
                                                error={errors.meta_title}
                                                hint="Recommended: 50–60 characters"
                                                charCount={data.meta_title?.length}
                                                maxChar={60}
                                            >
                                                <Input
                                                    value={data.meta_title}
                                                    onChange={(e) => setData('meta_title', e.target.value)}
                                                    placeholder={data.name || 'Product title for search results'}
                                                    className="h-9 text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25]"
                                                />
                                            </FieldGroup>
                                            <FieldGroup
                                                label="Meta Description"
                                                error={errors.meta_description}
                                                hint="Recommended: 120–160 characters"
                                                charCount={data.meta_description?.length}
                                                maxChar={160}
                                            >
                                                <Textarea
                                                    value={data.meta_description}
                                                    onChange={(e) => setData('meta_description', e.target.value)}
                                                    placeholder={data.short_description || 'Brief description for search results...'}
                                                    className="min-h-[80px] text-sm border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] resize-y"
                                                />
                                            </FieldGroup>
                                        </div>

                                        {/* SERP Preview */}
                                        <div>
                                            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Search Preview</p>
                                            <div className="border border-zinc-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                                        <svg className="w-3 h-3 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[11px] text-zinc-500 truncate">
                                                        aureasyari.com › product › {data.slug || 'product-slug'}
                                                    </span>
                                                </div>
                                                <h3 className="text-[#1a0dab] text-base font-medium leading-tight mb-1 line-clamp-1">
                                                    {data.meta_title || data.name || 'Product Title'} — Auréa Syar'i
                                                </h3>
                                                <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                                                    {data.meta_description || data.short_description || 'Product description will appear here in search engine results.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Form Actions (bottom) */}
                                <div className="flex items-center justify-between pt-2 pb-8">
                                    <Button asChild variant="outline" className="h-10 px-5 border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                                        <Link href={isEdit ? `/admin/products/${product?.id}` : '/admin/products'}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        {/* <Button
                                            type="button"
                                            variant="outline"
                                            className="h-10 px-5 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                            onClick={() => {
                                                setData('status', 'draft');
                                                submit({ preventDefault: () => {} } as any);
                                            }}
                                            disabled={processing}
                                        >
                                            Save as Draft
                                        </Button> */}
                                        <Button
                                            type="submit"
                                            className="h-10 px-6 bg-[#422d25] hover:bg-[#34231d] text-white shadow-sm font-medium"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : isEdit ? 'Save Changes' : 'Save Product'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Sidebar ── */}
                            <div className="flex flex-col gap-4 xl:sticky xl:top-[57px]">

                                {/* Publishing */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-zinc-100">
                                        <h3 className="text-sm font-semibold text-zinc-900">Publishing</h3>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">Control product visibility</p>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-700">
                                                Status <span className="text-red-500">*</span>
                                            </Label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#422d25] focus:outline-none focus:ring-1 focus:ring-[#422d25]"
                                            >
                                                {options.statuses.map((s) => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                            {errors.status && <p className="text-[11px] text-red-500">{errors.status}</p>}
                                        </div>

                                        <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 space-y-1.5 text-[11px] text-zinc-500">
                                            <p><span className="font-semibold text-zinc-700">Draft</span> — Not visible to customers</p>
                                            <p><span className="font-semibold text-zinc-700">Published</span> — Live and visible in store</p>
                                            <p><span className="font-semibold text-zinc-700">Archived</span> — Hidden and unavailable</p>
                                        </div>

                                        <div className="border-t border-zinc-100 pt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Star className={`w-4 h-4 ${data.is_featured ? 'text-amber-500' : 'text-zinc-300'}`} />
                                                    <Label htmlFor="is_featured" className="text-xs text-zinc-700 cursor-pointer">Featured</Label>
                                                </div>
                                                <Switch
                                                    id="is_featured"
                                                    checked={data.is_featured}
                                                    onCheckedChange={(v) => setData('is_featured', v)}
                                                    className="scale-90 data-[state=checked]:bg-[#422d25]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className={`w-4 h-4 ${data.is_new_arrival ? 'text-emerald-500' : 'text-zinc-300'}`} />
                                                    <Label htmlFor="is_new_arrival" className="text-xs text-zinc-700 cursor-pointer">New Arrival</Label>
                                                </div>
                                                <Switch
                                                    id="is_new_arrival"
                                                    checked={data.is_new_arrival}
                                                    onCheckedChange={(v) => setData('is_new_arrival', v)}
                                                    className="scale-90 data-[state=checked]:bg-[#422d25]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className={`w-4 h-4 ${data.is_best_seller ? 'text-rose-500' : 'text-zinc-300'}`} />
                                                    <Label htmlFor="is_best_seller" className="text-xs text-zinc-700 cursor-pointer">Best Seller</Label>
                                                </div>
                                                <Switch
                                                    id="is_best_seller"
                                                    checked={data.is_best_seller}
                                                    onCheckedChange={(v) => setData('is_best_seller', v)}
                                                    className="scale-90 data-[state=checked]:bg-[#422d25]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Preview */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-zinc-100">
                                        <h3 className="text-sm font-semibold text-zinc-900">Preview</h3>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">How it appears in the store</p>
                                    </div>
                                    <div className="p-5">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-20 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {primaryPreview ? (
                                                <img src={primaryPreview} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-zinc-900 leading-tight line-clamp-2 mb-0.5">
                                                    {data.name || <span className="text-zinc-300">Product Name</span>}
                                                </h4>
                                                <p className="text-[11px] text-zinc-400 mb-1.5">
                                                    {options.categories.find(c => c.id.toString() === data.category_id.toString())?.name || 'No Category'}
                                                </p>
                                                <div>
                                                    {data.sale_price ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-zinc-400 line-through">IDR {Number(data.base_price || 0).toLocaleString('id-ID')}</span>
                                                            <span className="text-sm font-bold text-[#422d25]">IDR {Number(data.sale_price).toLocaleString('id-ID')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-bold text-zinc-900">IDR {Number(data.base_price || 0).toLocaleString('id-ID')}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {data.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] px-1.5 py-0">Featured</Badge>}
                                                    {data.is_new_arrival && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] px-1.5 py-0">New</Badge>}
                                                    {data.is_best_seller && <Badge className="bg-rose-100 text-rose-700 border-0 text-[9px] px-1.5 py-0">Best Seller</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Summary */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-zinc-100">
                                        <h3 className="text-sm font-semibold text-zinc-900">Summary</h3>
                                    </div>
                                    <div className="p-5 space-y-0">
                                        {[
                                            { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: 'Category', value: options.categories.find(c => c.id.toString() === data.category_id.toString())?.name || '—' },
                                            { icon: <Layers className="w-3.5 h-3.5" />, label: 'Collection', value: options.collections.find(c => c.id.toString() === data.collection_id.toString())?.name || '—' },
                                            { icon: <Tag className="w-3.5 h-3.5" />, label: 'SKU', value: data.sku || '—' },
                                            { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Base Price', value: data.base_price ? `IDR ${Number(data.base_price).toLocaleString('id-ID')}` : '—' },
                                            { icon: <Package className="w-3.5 h-3.5" />, label: 'Variants', value: `${variantsCount} with SKU` },
                                            { icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Images', value: `${data.images.filter(i => i.image || i.image_url).length} uploaded` },
                                        ].map(({ icon, label, value }) => (
                                            <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                                                <span className="flex items-center gap-2 text-[11px] text-zinc-400">{icon}{label}</span>
                                                <span className="text-[11px] font-medium text-zinc-700 max-w-[120px] text-right truncate">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Save actions (sidebar) */}
                                <div className="flex flex-col gap-2">
                                    {/* <Button
                                        type="submit"
                                        form="product-form"
                                        className="w-full h-10 bg-[#422d25] hover:bg-[#34231d] text-white font-medium shadow-sm"
                                        disabled={processing}
                                        onClick={() => submit({ preventDefault: () => {} } as any)}
                                    >
                                        {isEdit ? 'Save Changes' : 'Publish Product'}
                                    </Button> */}
                                    {/* <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-10 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        onClick={() => {
                                            setData('status', 'draft');
                                            submit({ preventDefault: () => {} } as any);
                                        }}
                                        disabled={processing}
                                    >
                                        Save as Draft
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
