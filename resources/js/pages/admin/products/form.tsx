import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Image as ImageIcon, Plus, Trash2, X, Info, HelpCircle,
    LayoutGrid, Settings, FileText, Anchor, ShoppingBag, Eye,
    UploadCloud, GripVertical, AlertTriangle, CheckCircle2, ChevronDown, Check,
    Layers, Tag, DollarSign, Package, Star, Sparkles, TrendingUp
} from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

function SectionCard({ title, description, children, headerRight, noPaddingTitle = false }: any) {
    return (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-zinc-200 group h-full flex flex-col">
            <div className={`px-5 pt-5 pb-3 border-b border-zinc-50 flex items-center justify-between ${noPaddingTitle ? 'pb-4' : ''}`}>
                <div>
                    <h2 className="text-base font-serif text-zinc-900 leading-tight group-hover:text-[#422d25] transition-colors">{title}</h2>
                    {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
                </div>
                {headerRight && <div>{headerRight}</div>}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}

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

    const hasImages = data.images.filter(i => i.image || i.image_url).length > 0;
    const variantsCount = data.variants.filter(v => v.sku).length;

    return (
        <>
            <Head title={isEdit ? 'Edit Product' : 'Create Product'} />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-h-screen">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                            <Link href="/admin/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                            <span>/</span>
                            <Link href="/admin/products" className="hover:text-zinc-900 transition-colors">Products</Link>
                            <span>/</span>
                            <span className="text-zinc-900">{isEdit ? 'Edit Product' : 'Create Product'}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 leading-tight">{isEdit ? 'Edit Product' : 'Create Product'}</h1>
                        <p className="text-sm text-zinc-500 mt-1">Kelola data utama, gambar, varian, stok awal, label, dan SEO product.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" className="h-10 px-4 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium" onClick={() => setData('status', 'draft')}>
                            Save as Draft
                        </Button>
                        {isEdit && (
                            <Button variant="outline" className="h-10 px-4 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium" asChild>
                                <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">Preview Product</a>
                            </Button>
                        )}
                        <Button className="h-10 px-6 bg-[#422d25] hover:bg-[#34231d] text-white shadow-md rounded-lg font-medium transition-all hover:shadow-lg" onClick={(e) => { e.preventDefault(); submit(e as any); }}>
                            {isEdit ? 'Save Changes' : 'Publish Product'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left & Middle Columns (Main Form) */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-6">
                                {/* 1. Basic Information */}
                                <SectionCard title="1. Basic Information" description="Provide the essential details about your product.">
                                    <div className="grid gap-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(event) => {
                                                        setData('name', event.target.value);
                
                                                        if (!data.slug && !isEdit) {
                                                            setData('slug', slugify(event.target.value));
                                                        }
                                                    }}
                                                    className="border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] rounded-lg shadow-sm"
                                                />
                                                <InputError message={errors.name} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(event) => setData('sku', event.target.value)}
                                                    className="border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] rounded-lg shadow-sm bg-zinc-50/50"
                                                />
                                                <InputError message={errors.sku} />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label htmlFor="slug">Product Slug <span className="text-red-500">*</span></Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="slug"
                                                    value={data.slug}
                                                    onChange={(event) => setData('slug', slugify(event.target.value))}
                                                    className={`rounded-lg shadow-sm ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25]'}`}
                                                />
                                                <Button type="button" variant="outline" className="shrink-0 text-sm font-medium border-zinc-200" onClick={() => setData('slug', slugify(data.name))}>Generate</Button>
                                            </div>
                                            <InputError message={errors.slug} />
                                            <p className="text-[11px] text-zinc-400">The slug is used for the product URL.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="category_id">Category</Label>
                                                <select
                                                    id="category_id"
                                                    value={data.category_id}
                                                    onChange={(event) => setData('category_id', event.target.value)}
                                                    className="border-zinc-200 h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus:border-[#422d25] focus:ring-[#422d25]"
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
                                            <div className="space-y-1.5">
                                                <Label htmlFor="collection_id">Collection</Label>
                                                <select
                                                    id="collection_id"
                                                    value={data.collection_id}
                                                    onChange={(event) => setData('collection_id', event.target.value)}
                                                    className="border-zinc-200 h-10 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus:border-[#422d25] focus:ring-[#422d25]"
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
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <Label htmlFor="short_description">Short Description <span className="text-red-500">*</span></Label>
                                                <span className="text-xs text-zinc-400">{data.short_description?.length || 0} / 160</span>
                                            </div>
                                            <Input
                                                id="short_description"
                                                value={data.short_description}
                                                onChange={(event) => setData('short_description', event.target.value)}
                                                className="border-zinc-200 rounded-lg shadow-sm"
                                            />
                                            <InputError message={errors.short_description} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                                            <div className={`border rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#422d25] focus-within:border-transparent transition-all ${errors.description ? 'border-red-300' : 'border-zinc-200'}`}>
                                                <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 p-1">
                                                    <select className="h-8 border-none bg-transparent w-32 shadow-none focus:ring-0 text-sm">
                                                        <option value="p">Paragraph</option>
                                                        <option value="h1">Heading 1</option>
                                                        <option value="h2">Heading 2</option>
                                                    </select>
                                                    <div className="w-px h-4 bg-zinc-300 mx-1" />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="font-bold">B</span></Button>
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="italic font-serif">I</span></Button>
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="underline">U</span></Button>
                                                    <div className="w-px h-4 bg-zinc-300 mx-1" />
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><Anchor className="w-4 h-4" /></Button>
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><ImageIcon className="w-4 h-4" /></Button>
                                                </div>
                                                <Textarea 
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(event) => setData('description', event.target.value)}
                                                    className="border-none focus-visible:ring-0 min-h-[120px] resize-y rounded-none"
                                                />
                                            </div>
                                            <InputError message={errors.description} />
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 5. Product Images */}
                                <SectionCard title="5. Product Images" description="Upload high-quality images of your product.">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        
                                        {/* Dropzone / Add Button */}
                                        <div
                                            className="col-span-2 md:col-span-1 aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-zinc-100/50 transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group"
                                            onClick={() => setData('images', [...data.images, blankImage()])}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-zinc-400 group-hover:text-[#422d25] group-hover:scale-110 transition-all">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-medium text-zinc-600 mb-1">Add another image</p>
                                        </div>

                                        {data.images.map((image, index) => (
                                            <div key={index} className={`col-span-1 aspect-[3/4] rounded-xl border p-1.5 relative group ${image.is_primary ? 'border-amber-200 bg-amber-50/30 ring-1 ring-amber-400/50' : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all'}`}>
                                                {image.is_primary && <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10 shadow-sm border border-amber-200">Primary</div>}
                                                <button type="button" onClick={() => setData('images', data.images.filter((_, imageIndex) => imageIndex !== index))} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-zinc-500 hover:text-red-500 flex items-center justify-center z-10 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="w-full h-[65%] rounded-lg bg-zinc-100 mb-1.5 overflow-hidden flex items-center justify-center relative">
                                                    {image.image_url ? (
                                                        <img src={image.image_url} className="w-full h-full object-cover" alt={image.alt_text} />
                                                    ) : (
                                                        <ImageIcon className="w-8 h-8 text-zinc-300" />
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(event) => updateImage(index, 'image', event.target.files?.[0] ?? null)}
                                                    />
                                                </div>
                                                <div className="space-y-1.5 px-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">Alt:</span>
                                                        <input type="text" value={image.alt_text} onChange={(event) => updateImage(index, 'alt_text', event.target.value)} placeholder="Alt text" className="w-full text-[10px] border-none bg-transparent p-0 h-4 focus:ring-0 text-zinc-700 placeholder:text-zinc-300" />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-medium text-zinc-500">Order</span>
                                                            <input type="number" value={image.sort_order} onChange={(event) => updateImage(index, 'sort_order', event.target.value)} className="w-8 text-center text-[10px] border border-zinc-200 rounded p-0 h-4" />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <input type="radio" checked={image.is_primary} onChange={() => setPrimaryImage(index)} className={`w-3 h-3 focus:ring-1 ${image.is_primary ? 'text-[#422d25] focus:ring-[#422d25]' : 'text-zinc-300 focus:ring-zinc-300'}`} />
                                                            <span className={`text-[9px] font-medium ${image.is_primary ? 'text-zinc-600' : 'text-zinc-400'}`}>Primary</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                    <InputError message={fieldError('images')} className="mt-2" />
                                </SectionCard>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col gap-6">
                                {/* 2. Material & Care */}
                                <SectionCard title="2. Material & Care" description="Specify material composition and care instructions.">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="material">Material <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="material"
                                                value={data.material}
                                                onChange={(event) => setData('material', event.target.value)}
                                                className={`min-h-[80px] rounded-lg shadow-sm ${errors.material ? 'border-red-300' : 'border-zinc-200'}`}
                                            />
                                            <InputError message={errors.material} />
                                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>Soft, breathable, and flowy.</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="care_instruction">Care Instruction <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                id="care_instruction"
                                                value={data.care_instruction}
                                                onChange={(event) => setData('care_instruction', event.target.value)}
                                                className={`min-h-[80px] rounded-lg shadow-sm ${errors.care_instruction ? 'border-red-300' : 'border-zinc-200'}`}
                                            />
                                            <InputError message={errors.care_instruction} />
                                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>Keep your item in good condition.</span>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 3. Pricing */}
                                <SectionCard title="3. Pricing" description="Set the pricing for your product.">
                                    <div className="grid grid-cols-2 gap-6 items-start">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="base_price">Base Price (IDR) <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <Input
                                                        id="base_price"
                                                        type="number" min="0"
                                                        value={data.base_price}
                                                        onChange={(event) => setData('base_price', event.target.value)}
                                                        className={`pl-4 rounded-lg shadow-sm font-medium ${errors.base_price ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30 text-red-600' : 'border-zinc-200'}`}
                                                    />
                                                    {errors.base_price && <AlertTriangle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />}
                                                </div>
                                                <InputError message={errors.base_price} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sale_price">Sale Price (IDR)</Label>
                                                <Input
                                                    id="sale_price"
                                                    type="number" min="0"
                                                    value={data.sale_price}
                                                    onChange={(event) => setData('sale_price', event.target.value)}
                                                    className="pl-4 border-zinc-200 rounded-lg shadow-sm font-medium"
                                                />
                                                <InputError message={errors.sale_price} />
                                                <p className="text-[11px] text-zinc-400 mt-1">Sale price must be lower than or equal to the base price.</p>
                                            </div>
                                        </div>
                                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col justify-center h-full">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-zinc-500">Base Price</span>
                                                <span className="text-sm font-medium text-zinc-900">IDR {data.base_price || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs text-zinc-500">Sale Price</span>
                                                <span className="text-sm font-medium text-zinc-900">IDR {data.sale_price || 0}</span>
                                            </div>
                                            <div className="border-t border-zinc-200 border-dashed my-1" />
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-bold text-zinc-900">Final Price</span>
                                                <span className="text-lg font-bold text-zinc-900">IDR {data.sale_price ? data.sale_price : data.base_price || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 4. Shipping & Dimensions */}
                                <SectionCard title="4. Shipping & Dimensions" description="Weight and dimensions are used to calculate shipping costs.">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="weight">Weight (g) <span className="text-red-500">*</span></Label>
                                            <Input id="weight" type="number" min="0" value={data.weight} onChange={(event) => setData('weight', event.target.value)} className={`rounded-lg shadow-sm ${errors.weight ? 'border-red-300' : 'border-zinc-200'}`} />
                                            <InputError message={errors.weight} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="length">Length (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="length" type="number" min="0" value={data.length} onChange={(event) => setData('length', event.target.value)} className={`rounded-lg shadow-sm ${errors.length ? 'border-red-300' : 'border-zinc-200'}`} />
                                            <InputError message={errors.length} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="width">Width (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="width" type="number" min="0" value={data.width} onChange={(event) => setData('width', event.target.value)} className={`rounded-lg shadow-sm ${errors.width ? 'border-red-300' : 'border-zinc-200'}`} />
                                            <InputError message={errors.width} />
                                        </div>
                                        <div className="space-y-1.5 relative z-10">
                                            <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="height" type="number" min="0" value={data.height} onChange={(event) => setData('height', event.target.value)} className={`rounded-lg shadow-sm ${errors.height ? 'border-red-300' : 'border-zinc-200'}`} />
                                            <InputError message={errors.height} />
                                            <Package className="w-10 h-10 text-zinc-100 absolute right-1 top-6 -z-10" />
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 6. Product Variants */}
                                <SectionCard title="6. Product Variants" description="Add variants for different sizes or colors.">
                                    <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[11px] text-left">
                                                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                                                    <tr>
                                                        <th className="px-2 py-2 w-8 text-center">#</th>
                                                        <th className="px-2 py-2 font-medium">Variant SKU</th>
                                                        <th className="px-2 py-2 font-medium">Color Name</th>
                                                        <th className="px-2 py-2 font-medium">Color Hex</th>
                                                        <th className="px-2 py-2 font-medium w-16">Size</th>
                                                        <th className="px-2 py-2 font-medium">Price Add.</th>
                                                        <th className="px-2 py-2 font-medium w-12 text-right">Stock</th>
                                                        <th className="px-2 py-2 font-medium w-12 text-right">Reserved</th>
                                                        <th className="px-2 py-2 font-medium text-center">Active</th>
                                                        <th className="px-2 py-2 font-medium text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                    {data.variants.map((variant, index) => (
                                                        <tr key={index} className="group hover:bg-zinc-50 transition-colors">
                                                            <td className="px-2 py-1.5 text-center text-zinc-400"><GripVertical className="w-3 h-3 inline-block cursor-grab" /></td>
                                                            <td className="px-2 py-1.5"><Input value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} className={`h-7 text-[11px] rounded shadow-none w-28 ${fieldError(`variants.${index}.sku`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5"><Input value={variant.color_name} onChange={(event) => updateVariant(index, 'color_name', event.target.value)} className={`h-7 text-[11px] rounded shadow-none w-20 ${fieldError(`variants.${index}.color_name`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5">
                                                                <div className={`flex items-center gap-1.5 border rounded px-1.5 h-7 bg-white ${fieldError(`variants.${index}.color_hex`) ? 'border-red-300' : 'border-zinc-200'}`}>
                                                                    <div className="w-3 h-3 rounded-full border border-zinc-200 shrink-0 relative overflow-hidden">
                                                                        <input type="color" value={variant.color_hex || '#000000'} onChange={(event) => updateVariant(index, 'color_hex', event.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" />
                                                                    </div>
                                                                    <input type="text" value={variant.color_hex || '#000000'} readOnly className="w-14 border-none p-0 text-[11px] h-full focus:ring-0 text-zinc-600" />
                                                                </div>
                                                            </td>
                                                            <td className="px-2 py-1.5"><Input value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)} className={`h-7 text-[11px] rounded shadow-none text-center ${fieldError(`variants.${index}.size`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5"><Input type="number" min="0" value={variant.additional_price} onChange={(event) => updateVariant(index, 'additional_price', event.target.value)} className={`h-7 text-[11px] rounded shadow-none text-right w-16 ${fieldError(`variants.${index}.additional_price`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5"><Input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} className={`h-7 text-[11px] rounded shadow-none text-right ${fieldError(`variants.${index}.stock`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5"><Input type="number" min="0" value={variant.reserved_stock} onChange={(event) => updateVariant(index, 'reserved_stock', event.target.value)} className={`h-7 text-[11px] rounded shadow-none text-right ${fieldError(`variants.${index}.reserved_stock`) ? 'border-red-300' : 'border-zinc-200'}`} /></td>
                                                            <td className="px-2 py-1.5 text-center"><Switch checked={variant.is_active} onCheckedChange={(checked) => updateVariant(index, 'is_active', checked)} className="scale-75 data-[state=checked]:bg-[#422d25]" /></td>
                                                            <td className="px-2 py-1.5 text-center">
                                                                <div className="flex justify-center gap-1">
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => setData('variants', data.variants.filter((_, variantIndex) => variantIndex !== index))} className="h-6 w-6 text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setData('variants', [...data.variants, blankVariant()])} className="h-7 text-[11px] bg-white gap-1"><Plus className="w-3 h-3" /> Add Variant</Button>
                                        </div>
                                        <InputError message={fieldError('variants')} className="p-3" />
                                    </div>
                                </SectionCard>

                            </div>
                        </div>

                        {/* 7. SEO Metadata */}
                        <SectionCard title="7. SEO Metadata" description="Optimize your product for search engines.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_title">Meta Title</Label>
                                            <span className="text-xs text-zinc-400">{data.meta_title?.length || 0} / 60</span>
                                        </div>
                                        <Input id="meta_title" value={data.meta_title} onChange={(event) => setData('meta_title', event.target.value)} className="border-zinc-200 rounded-lg shadow-sm" />
                                        <InputError message={errors.meta_title} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_description">Meta Description</Label>
                                            <span className="text-xs text-zinc-400">{data.meta_description?.length || 0} / 160</span>
                                        </div>
                                        <Textarea id="meta_description" value={data.meta_description} onChange={(event) => setData('meta_description', event.target.value)} className="min-h-[80px] border-zinc-200 rounded-lg shadow-sm" />
                                        <InputError message={errors.meta_description} />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block text-zinc-500 text-xs">Search Engine Preview</Label>
                                    <div className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                                                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                                            </div>
                                            <span className="truncate">https://aureasyari.com/product/{data.slug || 'product-slug'}</span>
                                        </div>
                                        <h3 className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight mb-1">{data.meta_title || data.name || 'Product Title'} - Auréa Syar'i</h3>
                                        <p className="text-[#4d5156] text-sm leading-snug">{data.meta_description || data.short_description || 'Product description will appear here...'}</p>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        
                        {/* Publishing Settings */}
                        <SectionCard title="Publishing Settings" description="Control the visibility and status of your product." noPaddingTitle>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label>Status <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <select
                                            value={data.status}
                                            onChange={(event) => setData('status', event.target.value)}
                                            className="border-zinc-200 h-10 rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm flex-1 focus:border-[#422d25] focus:ring-[#422d25]"
                                        >
                                            {options.statuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 font-medium shrink-0 capitalize">{data.status}</Badge>
                                    </div>
                                    <InputError message={errors.status} />
                                    <div className="text-[11px] text-zinc-500 space-y-1.5 mt-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                        <p><strong className="text-zinc-700 font-semibold">Draft:</strong> Product is not visible to customers.</p>
                                        <p><strong className="text-zinc-700 font-semibold">Published:</strong> Product is live and visible.</p>
                                        <p><strong className="text-zinc-700 font-semibold">Archived:</strong> Product is hidden and unavailable.</p>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 pt-4 space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <Star className={`w-4 h-4 transition-colors ${data.is_featured ? 'text-amber-500' : 'text-zinc-400 group-hover:text-amber-500'}`} />
                                            <Label htmlFor="is_featured" className="cursor-pointer font-medium text-zinc-700">Is Featured</Label>
                                        </div>
                                        <Switch id="is_featured" checked={data.is_featured} onCheckedChange={(checked) => setData('is_featured', checked)} className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={`w-4 h-4 transition-colors ${data.is_new_arrival ? 'text-emerald-500' : 'text-zinc-400 group-hover:text-emerald-500'}`} />
                                            <Label htmlFor="is_new_arrival" className="cursor-pointer font-medium text-zinc-700">Is New Arrival</Label>
                                        </div>
                                        <Switch id="is_new_arrival" checked={data.is_new_arrival} onCheckedChange={(checked) => setData('is_new_arrival', checked)} className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className={`w-4 h-4 transition-colors ${data.is_best_seller ? 'text-rose-500' : 'text-zinc-400 group-hover:text-rose-500'}`} />
                                            <Label htmlFor="is_best_seller" className="cursor-pointer font-medium text-zinc-700">Is Best Seller</Label>
                                        </div>
                                        <Switch id="is_best_seller" checked={data.is_best_seller} onCheckedChange={(checked) => setData('is_best_seller', checked)} className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Product Preview */}
                        <SectionCard title="Product Preview" description="" headerRight={<Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0 capitalize">{data.status}</Badge>} noPaddingTitle>
                            <div className="flex gap-4">
                                <div className="w-20 h-24 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200 flex items-center justify-center">
                                    {data.images.find(i => i.is_primary)?.image_url ? (
                                        <img src={data.images.find(i => i.is_primary)?.image_url as string} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-zinc-300" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-serif text-[15px] text-zinc-900 leading-tight mb-1">{data.name || 'Product Name'}</h4>
                                    <p className="text-[11px] text-zinc-500 mb-2">{options.categories.find(c => c.id.toString() === data.category_id.toString())?.name || 'Category'}</p>
                                    <div className="flex flex-col mb-2">
                                        {data.sale_price ? (
                                            <>
                                                <span className="text-[10px] text-zinc-400 line-through decoration-zinc-300">IDR {data.base_price || 0}</span>
                                                <span className="text-sm font-bold text-zinc-900">IDR {data.sale_price}</span>
                                            </>
                                        ) : (
                                            <span className="text-sm font-bold text-zinc-900">IDR {data.base_price || 0}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        {data.is_featured && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-200 text-amber-700 bg-amber-50">Featured</Badge>}
                                        {data.is_new_arrival && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-200 text-emerald-700 bg-emerald-50">New Arrival</Badge>}
                                        {data.is_best_seller && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-rose-200 text-rose-700 bg-rose-50">Best Seller</Badge>}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Quick Summary */}
                        <SectionCard title="Quick Summary" description="" noPaddingTitle>
                            <div className="space-y-3 text-[13px]">
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Category</span>
                                    <span className="font-medium text-zinc-900">{options.categories.find(c => c.id.toString() === data.category_id.toString())?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Collection</span>
                                    <span className="font-medium text-zinc-900">{options.collections.find(c => c.id.toString() === data.collection_id.toString())?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> SKU</span>
                                    <span className="font-medium text-zinc-900">{data.sku || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Base Price</span>
                                    <span className="font-medium text-zinc-900">IDR {data.base_price || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Sale Price</span>
                                    <span className="font-medium text-zinc-900">IDR {data.sale_price || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Variants</span>
                                    <span className="font-medium text-zinc-900">{variantsCount}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Images</span>
                                    <span className="font-medium text-zinc-900">{data.images.length}</span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Bottom Actions */}
                    <div className="lg:col-span-12 flex items-center justify-between pt-6 mt-4 border-t border-zinc-200">
                        <Button asChild variant="outline" className="h-10 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium">
                            <Link href={isEdit ? `/admin/products/${product.id}` : '/admin/products'}>Cancel</Link>
                        </Button>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="h-10 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium" onClick={() => { setData('status', 'draft'); submit({ preventDefault: () => {} } as any); }} disabled={processing}>
                                Save as Draft
                            </Button>
                            <Button type="submit" className="h-10 px-6 bg-[#422d25] hover:bg-[#34231d] text-white shadow-md rounded-lg font-medium transition-all hover:shadow-lg" disabled={processing}>
                                {isEdit ? 'Save Changes' : 'Publish Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
