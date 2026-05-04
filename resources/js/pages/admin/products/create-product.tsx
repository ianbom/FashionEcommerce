import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Image as ImageIcon,
    Plus,
    Trash2,
    X,
    Info,
    HelpCircle,
    LayoutGrid,
    Settings,
    FileText,
    Anchor,
    ShoppingBag,
    Eye,
    UploadCloud,
    GripVertical,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Check,
    Image,
    Layers,
    Tag,
    DollarSign,
    Package,
    Star,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

// Mock Data
const CATEGORIES = ['Abaya', 'Dress', 'Hijab', 'Accessories'];
const COLLECTIONS = ['Ramadan Collection', 'Summer Breeze', 'Eid Al-Fitr'];

export default function CreateProduct() {
    return (
        <>
            <Head title="Create Product" />

            <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 pb-2 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
                            <Link
                                href="/admin/dashboard"
                                className="transition-colors hover:text-zinc-900"
                            >
                                Dashboard
                            </Link>
                            <span>/</span>
                            <Link
                                href="/admin/products"
                                className="transition-colors hover:text-zinc-900"
                            >
                                Products
                            </Link>
                            <span>/</span>
                            <span className="text-zinc-900">
                                Create Product
                            </span>
                        </div>
                        <h1 className="font-serif text-3xl leading-tight text-zinc-900 md:text-4xl">
                            Create Product
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Add a new modest fashion product with images,
                            variants, inventory, and SEO details.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-10 rounded-lg border-zinc-200 bg-white px-4 font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                        >
                            Save as Draft
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 rounded-lg border-zinc-200 bg-white px-4 font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                        >
                            Preview Product
                        </Button>
                        <Button className="h-10 rounded-lg bg-[#7F2020] px-6 font-medium text-white shadow-md transition-all hover:bg-[#5F1717] hover:shadow-lg">
                            Publish Product
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Left & Middle Columns (Main Form) */}
                    <div className="flex flex-col gap-6 lg:col-span-9">
                        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                            {/* Column 1 */}
                            <div className="flex flex-col gap-6">
                                {/* 1. Basic Information */}
                                <SectionCard
                                    title="1. Basic Information"
                                    description="Provide the essential details about your product."
                                >
                                    <div className="grid gap-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="name">
                                                    Product Name{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    defaultValue="Najran Piping Lace Abaya"
                                                    className="rounded-lg border-zinc-200 shadow-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sku">
                                                    SKU{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="sku"
                                                    defaultValue="ABY-NJRN-001"
                                                    className="rounded-lg border-zinc-200 bg-zinc-50/50 shadow-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="slug">
                                                Product Slug{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="slug"
                                                    defaultValue="najran-piping-lace-abaya"
                                                    className="rounded-lg border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                                />
                                                <Button
                                                    variant="outline"
                                                    className="shrink-0 border-zinc-200 text-sm font-medium"
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                            <p className="mt-1 text-xs text-red-500">
                                                This slug is already in use.
                                                Please choose another.
                                            </p>
                                            <p className="text-[11px] text-zinc-400">
                                                The slug is used for the product
                                                URL.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>
                                                    Category{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Select defaultValue="Abaya">
                                                    <SelectTrigger className="rounded-lg border-zinc-200 shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map((c) => (
                                                            <SelectItem
                                                                key={c}
                                                                value={c}
                                                            >
                                                                {c}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Collection</Label>
                                                <Select defaultValue="Ramadan Collection">
                                                    <SelectTrigger className="rounded-lg border-zinc-200 shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COLLECTIONS.map(
                                                            (c) => (
                                                                <SelectItem
                                                                    key={c}
                                                                    value={c}
                                                                >
                                                                    {c}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <Label htmlFor="short_desc">
                                                    Short Description{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <span className="text-xs text-zinc-400">
                                                    54 / 160
                                                </span>
                                            </div>
                                            <Input
                                                id="short_desc"
                                                defaultValue="Elegant abaya with piping lace details on sleeves and front."
                                                className="rounded-lg border-zinc-200 shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>
                                                Description{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
                                                <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 p-1">
                                                    <Select defaultValue="p">
                                                        <SelectTrigger className="h-8 w-32 border-none bg-transparent text-sm shadow-none focus:ring-0">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="p">
                                                                Paragraph
                                                            </SelectItem>
                                                            <SelectItem value="h1">
                                                                Heading 1
                                                            </SelectItem>
                                                            <SelectItem value="h2">
                                                                Heading 2
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="mx-1 h-4 w-px bg-zinc-300" />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-600"
                                                    >
                                                        <span className="font-bold">
                                                            B
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-600"
                                                    >
                                                        <span className="font-serif italic">
                                                            I
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-600"
                                                    >
                                                        <span className="underline">
                                                            U
                                                        </span>
                                                    </Button>
                                                    <div className="mx-1 h-4 w-px bg-zinc-300" />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-600"
                                                    >
                                                        <Anchor className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-600"
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    className="min-h-[120px] resize-y rounded-none border-none focus-visible:ring-0"
                                                    defaultValue="Our Najran Piping Lace Abaya is crafted from premium Arabian crepe with delicate piping lace details on the sleeves and front.\n\nIt offers a perfect blend of elegance, comfort, and modesty for any occasion."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 5. Product Images */}
                                <SectionCard
                                    title="5. Product Images"
                                    description="Upload high-quality images of your product."
                                >
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        {/* Dropzone */}
                                        <div className="group relative col-span-2 flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-4 text-center transition-colors hover:bg-zinc-100/50 md:col-span-1">
                                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm transition-all group-hover:scale-110 group-hover:text-[#7F2020]">
                                                <UploadCloud className="h-5 w-5" />
                                            </div>
                                            <p className="mb-1 text-xs font-medium text-zinc-600">
                                                Drag & drop product images here
                                            </p>
                                            <p className="mb-3 text-[10px] text-zinc-400">
                                                PNG, JPG, or WEBP up to 4MB each
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 bg-white text-xs"
                                            >
                                                Upload Images
                                            </Button>
                                        </div>

                                        {/* Image 1 */}
                                        <div className="group relative col-span-1 aspect-[3/4] rounded-xl border border-amber-200 bg-amber-50/30 p-1.5 ring-1 ring-amber-400/50">
                                            <div className="absolute top-2 left-2 z-10 rounded border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase shadow-sm">
                                                Primary
                                            </div>
                                            <button className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-zinc-500 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mb-1.5 h-[65%] w-full overflow-hidden rounded-lg bg-zinc-200">
                                                <img
                                                    src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop"
                                                    className="h-full w-full object-cover"
                                                    alt="Primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">
                                                        Alt:
                                                    </span>
                                                    <input
                                                        type="text"
                                                        defaultValue="Najran Piping Lace Abaya Off White"
                                                        className="h-4 w-full border-none bg-transparent p-0 text-[10px] text-zinc-700 placeholder:text-zinc-300 focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">
                                                            Order
                                                        </span>
                                                        <input
                                                            type="number"
                                                            defaultValue={1}
                                                            className="h-4 w-8 rounded border border-zinc-200 p-0 text-center text-[10px]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="radio"
                                                            checked
                                                            className="h-3 w-3 text-[#7F2020] focus:ring-[#7F2020]"
                                                            readOnly
                                                        />
                                                        <span className="text-[9px] font-medium text-zinc-600">
                                                            Primary
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image 2 */}
                                        <div className="group relative col-span-1 aspect-[3/4] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm transition-all hover:border-zinc-300">
                                            <button className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-zinc-500 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mb-1.5 h-[65%] w-full overflow-hidden rounded-lg bg-zinc-200">
                                                <img
                                                    src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop"
                                                    className="h-full w-full object-cover opacity-80 grayscale"
                                                    alt="Back View"
                                                />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">
                                                        Alt:
                                                    </span>
                                                    <input
                                                        type="text"
                                                        defaultValue="Back View Abaya"
                                                        className="h-4 w-full border-none bg-transparent p-0 text-[10px] text-zinc-700 focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">
                                                            Order
                                                        </span>
                                                        <input
                                                            type="number"
                                                            defaultValue={2}
                                                            className="h-4 w-8 rounded border border-zinc-200 p-0 text-center text-[10px]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="radio"
                                                            className="h-3 w-3 text-zinc-300 focus:ring-zinc-300"
                                                            readOnly
                                                        />
                                                        <span className="text-[9px] font-medium text-zinc-400">
                                                            Primary
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image 3 (Error) */}
                                        <div className="group relative col-span-1 aspect-[3/4] rounded-xl border border-red-200 bg-red-50/30 p-1.5 shadow-sm ring-1 ring-red-400/50">
                                            <button className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-zinc-500 opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                            <div className="mb-1.5 h-[65%] w-full overflow-hidden rounded-lg bg-zinc-200">
                                                <img
                                                    src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop"
                                                    className="h-full w-full object-cover opacity-80 sepia"
                                                    alt="Detail"
                                                />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">
                                                        Alt:
                                                    </span>
                                                    <input
                                                        type="text"
                                                        defaultValue="Lace Detail"
                                                        className="h-4 w-full border-none bg-transparent p-0 text-[10px] text-zinc-700 focus:ring-0"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">
                                                            Order
                                                        </span>
                                                        <input
                                                            type="number"
                                                            defaultValue={3}
                                                            className="h-4 w-8 rounded border border-red-300 bg-red-50 p-0 text-center text-[10px]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="radio"
                                                            className="h-3 w-3 text-zinc-300 focus:ring-zinc-300"
                                                            readOnly
                                                        />
                                                        <span className="text-[9px] font-medium text-zinc-400">
                                                            Primary
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            <span>
                                                1 image has an invalid file
                                                type.
                                            </span>
                                        </div>
                                        <span className="text-xs text-zinc-400">
                                            You can upload up to 10 images.
                                        </span>
                                    </div>
                                </SectionCard>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col gap-6">
                                {/* 2. Material & Care */}
                                <SectionCard
                                    title="2. Material & Care"
                                    description="Specify material composition and care instructions."
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="material">
                                                Material{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="material"
                                                defaultValue="Premium Arabian Crepe"
                                                className="min-h-[80px] rounded-lg border-zinc-200 shadow-sm"
                                            />
                                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
                                                <Info className="h-3.5 w-3.5" />
                                                <span>
                                                    Soft, breathable, and flowy.
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="care">
                                                Care Instruction{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Textarea
                                                id="care"
                                                defaultValue="Hand wash recommended,&#10;do not bleach,&#10;iron on low heat."
                                                className="min-h-[80px] rounded-lg border-zinc-200 shadow-sm"
                                            />
                                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500">
                                                <Info className="h-3.5 w-3.5" />
                                                <span>
                                                    Keep your item in good
                                                    condition.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 3. Pricing */}
                                <SectionCard
                                    title="3. Pricing"
                                    description="Set the pricing for your product."
                                >
                                    <div className="grid grid-cols-2 items-start gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="base_price">
                                                    Base Price (IDR){' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="base_price"
                                                        defaultValue="450,000"
                                                        className="rounded-lg border-red-300 bg-red-50/30 pr-10 pl-4 font-medium text-red-600 shadow-sm focus:border-red-500 focus:ring-red-500"
                                                    />
                                                    <AlertTriangle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-red-500" />
                                                </div>
                                                <p className="mt-1 text-xs text-red-500">
                                                    Base price is required.
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sale_price">
                                                    Sale Price (IDR)
                                                </Label>
                                                <Input
                                                    id="sale_price"
                                                    defaultValue="399,000"
                                                    className="rounded-lg border-zinc-200 pl-4 font-medium shadow-sm"
                                                />
                                                <p className="mt-1 text-[11px] text-zinc-400">
                                                    Sale price must be lower
                                                    than or equal to the base
                                                    price.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex h-full flex-col justify-center rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs text-zinc-500">
                                                    Base Price
                                                </span>
                                                <span className="text-sm font-medium text-zinc-900">
                                                    IDR 450,000
                                                </span>
                                            </div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-xs text-zinc-500">
                                                    Sale Price
                                                </span>
                                                <span className="text-sm font-medium text-zinc-900">
                                                    IDR 399,000
                                                </span>
                                            </div>
                                            <div className="my-1 border-t border-dashed border-zinc-200" />
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-sm font-bold text-zinc-900">
                                                    Final Price
                                                </span>
                                                <span className="text-lg font-bold text-zinc-900">
                                                    IDR 399,000
                                                </span>
                                            </div>
                                            <div className="mt-1 flex justify-end">
                                                <Badge
                                                    variant="secondary"
                                                    className="border-none bg-red-100 px-1.5 py-0 text-[10px] text-red-700 hover:bg-red-100"
                                                >
                                                    11% OFF
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 4. Shipping & Dimensions */}
                                <SectionCard
                                    title="4. Shipping & Dimensions"
                                    description="Weight and dimensions are used to calculate shipping costs."
                                >
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="weight">
                                                Weight (g){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="weight"
                                                defaultValue="500"
                                                className="rounded-lg border-zinc-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="length">
                                                Length (cm){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="length"
                                                defaultValue="30"
                                                className="rounded-lg border-zinc-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="width">
                                                Width (cm){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="width"
                                                defaultValue="25"
                                                className="rounded-lg border-zinc-200 shadow-sm"
                                            />
                                        </div>
                                        <div className="relative z-10 space-y-1.5">
                                            <Label htmlFor="height">
                                                Height (cm){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="height"
                                                defaultValue="5"
                                                className="rounded-lg border-zinc-200 shadow-sm"
                                            />
                                            <Package className="absolute top-6 right-1 -z-10 h-10 w-10 text-zinc-100" />
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 6. Product Variants */}
                                <SectionCard
                                    title="6. Product Variants"
                                    description="Add variants for different sizes or colors."
                                >
                                    <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                                                    <tr>
                                                        <th className="w-8 px-2 py-2 text-center">
                                                            #
                                                        </th>
                                                        <th className="px-2 py-2 font-medium">
                                                            Variant SKU
                                                        </th>
                                                        <th className="px-2 py-2 font-medium">
                                                            Color Name
                                                        </th>
                                                        <th className="px-2 py-2 font-medium">
                                                            Color Hex
                                                        </th>
                                                        <th className="w-16 px-2 py-2 font-medium">
                                                            Size
                                                        </th>
                                                        <th className="px-2 py-2 font-medium">
                                                            Price Add.
                                                        </th>
                                                        <th className="w-12 px-2 py-2 text-right font-medium">
                                                            Stock
                                                        </th>
                                                        <th className="w-12 px-2 py-2 text-right font-medium">
                                                            Reserved
                                                        </th>
                                                        <th className="px-2 py-2 font-medium">
                                                            Variant Image URL
                                                        </th>
                                                        <th className="px-2 py-2 text-center font-medium">
                                                            Active
                                                        </th>
                                                        <th className="px-2 py-2 text-center font-medium">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                    {/* Variant Row 1 */}
                                                    <tr className="group transition-colors hover:bg-zinc-50">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400">
                                                            <GripVertical className="inline-block h-3 w-3 cursor-grab" />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="ABY-NJRN-001-S"
                                                                className="h-7 w-28 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="Off White"
                                                                className="h-7 w-20 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex h-7 items-center gap-1.5 rounded border border-zinc-200 bg-white px-1.5">
                                                                <div
                                                                    className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#F8F4E6',
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    defaultValue="#F8F4E6"
                                                                    className="h-full w-14 border-none p-0 text-[11px] text-zinc-600 focus:ring-0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="S"
                                                                className="h-7 rounded border-zinc-200 text-center text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="0"
                                                                className="h-7 w-16 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="25"
                                                                className="h-7 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">
                                                            0
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="https://..."
                                                                className="h-7 w-24 rounded border-zinc-200 text-[11px] text-zinc-400 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <Switch
                                                                defaultChecked
                                                                className="scale-75 data-[state=checked]:bg-[#7F2020]"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-700"
                                                                >
                                                                    <ImageIcon className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 2 */}
                                                    <tr className="group transition-colors hover:bg-zinc-50">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400">
                                                            <GripVertical className="inline-block h-3 w-3 cursor-grab" />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="ABY-NJRN-001-M"
                                                                className="h-7 w-28 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="Off White"
                                                                className="h-7 w-20 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex h-7 items-center gap-1.5 rounded border border-zinc-200 bg-white px-1.5">
                                                                <div
                                                                    className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#F8F4E6',
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    defaultValue="#F8F4E6"
                                                                    className="h-full w-14 border-none p-0 text-[11px] text-zinc-600 focus:ring-0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="M"
                                                                className="h-7 rounded border-zinc-200 text-center text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="0"
                                                                className="h-7 w-16 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="18"
                                                                className="h-7 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">
                                                            0
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="https://..."
                                                                className="h-7 w-24 rounded border-zinc-200 text-[11px] text-zinc-400 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <Switch
                                                                defaultChecked
                                                                className="scale-75 data-[state=checked]:bg-[#7F2020]"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-700"
                                                                >
                                                                    <ImageIcon className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 3 */}
                                                    <tr className="group transition-colors hover:bg-zinc-50">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400">
                                                            <GripVertical className="inline-block h-3 w-3 cursor-grab" />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="ABY-NJRN-001-L"
                                                                className="h-7 w-28 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="Off White"
                                                                className="h-7 w-20 rounded border-zinc-200 text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex h-7 items-center gap-1.5 rounded border border-zinc-200 bg-white px-1.5">
                                                                <div
                                                                    className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#F8F4E6',
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    defaultValue="#F8F4E6"
                                                                    className="h-full w-14 border-none p-0 text-[11px] text-zinc-600 focus:ring-0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="L"
                                                                className="h-7 rounded border-zinc-200 text-center text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="0"
                                                                className="h-7 w-16 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="12"
                                                                className="h-7 rounded border-zinc-200 text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">
                                                            0
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="https://..."
                                                                className="h-7 w-24 rounded border-zinc-200 text-[11px] text-zinc-400 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <Switch
                                                                defaultChecked
                                                                className="scale-75 data-[state=checked]:bg-[#7F2020]"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-700"
                                                                >
                                                                    <ImageIcon className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 4 (Error) */}
                                                    <tr className="group bg-red-50/30">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400">
                                                            <GripVertical className="inline-block h-3 w-3 cursor-grab" />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="ABY-NJRN-001-XL"
                                                                className="h-7 w-28 rounded border-red-200 bg-white text-[11px] text-red-600 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="Off White"
                                                                className="h-7 w-20 rounded border-zinc-200 bg-white text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex h-7 items-center gap-1.5 rounded border border-zinc-200 bg-white px-1.5">
                                                                <div
                                                                    className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#F8F4E6',
                                                                    }}
                                                                />
                                                                <input
                                                                    type="text"
                                                                    defaultValue="#F8F4E6"
                                                                    className="h-full w-14 border-none p-0 text-[11px] text-zinc-600 focus:ring-0"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="XL"
                                                                className="h-7 rounded border-zinc-200 bg-white text-center text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="0"
                                                                className="h-7 w-16 rounded border-zinc-200 bg-white text-right text-[11px] shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="2"
                                                                className="h-7 rounded border-red-300 bg-white text-right text-[11px] font-bold text-red-600 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">
                                                            0
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Input
                                                                defaultValue="invalid-url"
                                                                className="h-7 w-24 rounded border-red-300 bg-red-50 text-[11px] text-red-600 shadow-none"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <Switch
                                                                defaultChecked
                                                                className="scale-75 data-[state=checked]:bg-[#7F2020]"
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-700"
                                                                >
                                                                    <ImageIcon className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 p-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1 bg-white text-[11px]"
                                            >
                                                <Plus className="h-3 w-3" /> Add
                                                Variant
                                            </Button>
                                            <div className="mr-2 flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                                                    <AlertTriangle className="h-3.5 w-3.5" />{' '}
                                                    Low stock
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500">
                                                    <AlertTriangle className="h-3.5 w-3.5" />{' '}
                                                    Invalid URL
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>
                        </div>

                        {/* 7. SEO Metadata (Full width in main content area) */}
                        <SectionCard
                            title="7. SEO Metadata"
                            description="Optimize your product for search engines."
                        >
                            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_title">
                                                Meta Title{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <span className="text-xs text-zinc-400">
                                                39 / 60
                                            </span>
                                        </div>
                                        <Input
                                            id="meta_title"
                                            defaultValue="Premium Najran Piping Lace Abaya"
                                            className="rounded-lg border-zinc-200 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_desc">
                                                Meta Description{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <span className="text-xs text-zinc-400">
                                                83 / 160
                                            </span>
                                        </div>
                                        <Textarea
                                            id="meta_desc"
                                            defaultValue="Discover elegant modest fashion with premium material and refined details."
                                            className="min-h-[80px] rounded-lg border-zinc-200 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block text-xs text-zinc-500">
                                        Search Engine Preview
                                    </Label>
                                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                        <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100">
                                                <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                                            </div>
                                            <span className="truncate">
                                                https://aureasyari.com/product/najran-piping-lace-abaya
                                            </span>
                                        </div>
                                        <h3 className="mb-1 cursor-pointer text-lg leading-tight font-medium text-[#1a0dab] hover:underline">
                                            Premium Najran Piping Lace Abaya -
                                            Auréa Syar'i
                                        </h3>
                                        <p className="text-sm leading-snug text-[#4d5156]">
                                            Discover elegant modest fashion with
                                            premium material and refined
                                            details. Shop the exclusive Ramadan
                                            Collection today.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="flex flex-col gap-6 lg:col-span-3">
                        {/* Publishing Settings */}
                        <SectionCard
                            title="Publishing Settings"
                            description="Control the visibility and status of your product."
                            noPaddingTitle
                        >
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label>
                                        Status{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select defaultValue="Draft">
                                            <SelectTrigger className="flex-1 rounded-lg border-zinc-200 shadow-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="Published">
                                                    Published
                                                </SelectItem>
                                                <SelectItem value="Archived">
                                                    Archived
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 border-none bg-amber-100 px-3 font-medium text-amber-700 hover:bg-amber-100"
                                        >
                                            Draft
                                        </Badge>
                                    </div>
                                    <div className="mt-3 space-y-1.5 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-500">
                                        <p>
                                            <strong className="font-semibold text-zinc-700">
                                                Draft:
                                            </strong>{' '}
                                            Product is not visible to customers.
                                        </p>
                                        <p>
                                            <strong className="font-semibold text-zinc-700">
                                                Published:
                                            </strong>{' '}
                                            Product is live and visible.
                                        </p>
                                        <p>
                                            <strong className="font-semibold text-zinc-700">
                                                Archived:
                                            </strong>{' '}
                                            Product is hidden and unavailable.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t border-zinc-100 pt-4">
                                    <div className="group flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-amber-500" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">
                                                Is Featured
                                            </Label>
                                        </div>
                                        <Switch
                                            defaultChecked
                                            className="data-[state=checked]:bg-[#7F2020]"
                                        />
                                    </div>
                                    <div className="group flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-emerald-500" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">
                                                Is New Arrival
                                            </Label>
                                        </div>
                                        <Switch
                                            defaultChecked
                                            className="data-[state=checked]:bg-[#7F2020]"
                                        />
                                    </div>
                                    <div className="group flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-rose-500" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">
                                                Is Best Seller
                                            </Label>
                                        </div>
                                        <Switch className="data-[state=checked]:bg-[#7F2020]" />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Product Preview */}
                        <SectionCard
                            title="Product Preview"
                            description=""
                            headerRight={
                                <Badge
                                    variant="secondary"
                                    className="border-none bg-amber-100 px-2 py-0 text-amber-700 hover:bg-amber-100"
                                >
                                    Draft
                                </Badge>
                            }
                            noPaddingTitle
                        >
                            <div className="flex gap-4">
                                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop"
                                        className="h-full w-full object-cover"
                                        alt="Preview"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="mb-1 font-serif text-[15px] leading-tight text-zinc-900">
                                        Najran Piping Lace Abaya
                                    </h4>
                                    <p className="mb-2 text-[11px] text-zinc-500">
                                        Abaya
                                    </p>
                                    <div className="mb-2 flex flex-col">
                                        <span className="text-[10px] text-zinc-400 line-through decoration-zinc-300">
                                            IDR 450,000
                                        </span>
                                        <span className="text-sm font-bold text-zinc-900">
                                            IDR 399,000
                                        </span>
                                    </div>
                                    <div className="mt-auto flex flex-wrap gap-1">
                                        <Badge
                                            variant="outline"
                                            className="border-amber-200 bg-amber-50 px-1.5 py-0 text-[9px] text-amber-700"
                                        >
                                            Featured
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[9px] text-emerald-700"
                                        >
                                            New Arrival
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-rose-200 bg-rose-50 px-1.5 py-0 text-[9px] text-rose-700 opacity-50"
                                        >
                                            Best Seller
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Quick Summary */}
                        <SectionCard
                            title="Quick Summary"
                            description=""
                            noPaddingTitle
                        >
                            <div className="space-y-3 text-[13px]">
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <LayoutGrid className="h-3.5 w-3.5" />{' '}
                                        Category
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        Abaya
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <Layers className="h-3.5 w-3.5" />{' '}
                                        Collection
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        Ramadan Collection
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <Tag className="h-3.5 w-3.5" /> SKU
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        ABY-NJRN-001
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <DollarSign className="h-3.5 w-3.5" />{' '}
                                        Base Price
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        IDR 450,000
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <DollarSign className="h-3.5 w-3.5" />{' '}
                                        Sale Price
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        IDR 399,000
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <Package className="h-3.5 w-3.5" />{' '}
                                        Stock (Total)
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        57
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-zinc-50 py-1.5">
                                    <span className="flex items-center gap-2 text-zinc-500">
                                        <ImageIcon className="h-3.5 w-3.5" />{' '}
                                        Primary Images
                                    </span>
                                    <span className="font-medium text-zinc-900">
                                        1 / 4
                                    </span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-6">
                    <Button
                        variant="outline"
                        className="h-10 rounded-lg border-zinc-200 bg-white px-6 font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                    >
                        Cancel
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="h-10 rounded-lg border-zinc-200 bg-white px-6 font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                        >
                            Save as Draft
                        </Button>
                        <Button className="h-10 rounded-lg bg-[#7F2020] px-6 font-medium text-white shadow-md transition-all hover:bg-[#5F1717] hover:shadow-lg">
                            Publish Product
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

// Subcomponents

function SectionCard({
    title,
    description,
    children,
    headerRight,
    noPaddingTitle = false,
}: any) {
    return (
        <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:border-zinc-200 hover:shadow-md">
            <div
                className={`flex items-center justify-between border-b border-zinc-50 px-5 pt-5 pb-3 ${noPaddingTitle ? 'pb-4' : ''}`}
            >
                <div>
                    <h2 className="font-serif text-base leading-tight text-zinc-900 transition-colors group-hover:text-[#7F2020]">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-xs text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>
                {headerRight && <div>{headerRight}</div>}
            </div>
            <div className="flex flex-1 flex-col p-5">{children}</div>
        </div>
    );
}
