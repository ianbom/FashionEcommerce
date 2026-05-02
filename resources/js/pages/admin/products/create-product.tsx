import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft, Image as ImageIcon, Plus, Trash2, X, Info, HelpCircle,
    LayoutGrid, Settings, FileText, Anchor, ShoppingBag, Eye,
    UploadCloud, GripVertical, AlertTriangle, CheckCircle2, ChevronDown, Check,
    Image, Layers, Tag, DollarSign, Package, Star, Sparkles, TrendingUp
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// Mock Data
const CATEGORIES = ['Abaya', 'Dress', 'Hijab', 'Accessories'];
const COLLECTIONS = ['Ramadan Collection', 'Summer Breeze', 'Eid Al-Fitr'];

export default function CreateProduct() {
    return (
        <>
            <Head title="Create Product" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full min-h-screen">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                            <Link href="/admin/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
                            <span>/</span>
                            <Link href="/admin/products" className="hover:text-zinc-900 transition-colors">Products</Link>
                            <span>/</span>
                            <span className="text-zinc-900">Create Product</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 leading-tight">Create Product</h1>
                        <p className="text-sm text-zinc-500 mt-1">Add a new modest fashion product with images, variants, inventory, and SEO details.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" className="h-10 px-4 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium">
                            Save as Draft
                        </Button>
                        <Button variant="outline" className="h-10 px-4 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium">
                            Preview Product
                        </Button>
                        <Button className="h-10 px-6 bg-[#422d25] hover:bg-[#34231d] text-white shadow-md rounded-lg font-medium transition-all hover:shadow-lg">
                            Publish Product
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
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
                                                <Input id="name" defaultValue="Najran Piping Lace Abaya" className="border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] rounded-lg shadow-sm" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                                                <Input id="sku" defaultValue="ABY-NJRN-001" className="border-zinc-200 focus:border-[#422d25] focus:ring-[#422d25] rounded-lg shadow-sm bg-zinc-50/50" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="slug">Product Slug <span className="text-red-500">*</span></Label>
                                            <div className="flex gap-2">
                                                <Input id="slug" defaultValue="najran-piping-lace-abaya" className="border-red-300 focus:border-red-500 focus:ring-red-500 rounded-lg shadow-sm" />
                                                <Button variant="outline" className="shrink-0 text-sm font-medium border-zinc-200">Generate</Button>
                                            </div>
                                            <p className="text-xs text-red-500 mt-1">This slug is already in use. Please choose another.</p>
                                            <p className="text-[11px] text-zinc-400">The slug is used for the product URL.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Category <span className="text-red-500">*</span></Label>
                                                <Select defaultValue="Abaya">
                                                    <SelectTrigger className="border-zinc-200 rounded-lg shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Collection</Label>
                                                <Select defaultValue="Ramadan Collection">
                                                    <SelectTrigger className="border-zinc-200 rounded-lg shadow-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COLLECTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between">
                                                <Label htmlFor="short_desc">Short Description <span className="text-red-500">*</span></Label>
                                                <span className="text-xs text-zinc-400">54 / 160</span>
                                            </div>
                                            <Input id="short_desc" defaultValue="Elegant abaya with piping lace details on sleeves and front." className="border-zinc-200 rounded-lg shadow-sm" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Description <span className="text-red-500">*</span></Label>
                                            <div className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
                                                <div className="flex items-center gap-1 border-b border-zinc-200 bg-zinc-50 p-1">
                                                    <Select defaultValue="p">
                                                        <SelectTrigger className="h-8 border-none bg-transparent w-32 shadow-none focus:ring-0 text-sm">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="p">Paragraph</SelectItem>
                                                            <SelectItem value="h1">Heading 1</SelectItem>
                                                            <SelectItem value="h2">Heading 2</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="w-px h-4 bg-zinc-300 mx-1" />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="font-bold">B</span></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="italic font-serif">I</span></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><span className="underline">U</span></Button>
                                                    <div className="w-px h-4 bg-zinc-300 mx-1" />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><Anchor className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600"><ImageIcon className="w-4 h-4" /></Button>
                                                </div>
                                                <Textarea 
                                                    className="border-none focus-visible:ring-0 min-h-[120px] resize-y rounded-none"
                                                    defaultValue="Our Najran Piping Lace Abaya is crafted from premium Arabian crepe with delicate piping lace details on the sleeves and front.\n\nIt offers a perfect blend of elegance, comfort, and modesty for any occasion."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 5. Product Images */}
                                <SectionCard title="5. Product Images" description="Upload high-quality images of your product.">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        
                                        {/* Dropzone */}
                                        <div className="col-span-2 md:col-span-1 aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:bg-zinc-100/50 transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-zinc-400 group-hover:text-[#422d25] group-hover:scale-110 transition-all">
                                                <UploadCloud className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-medium text-zinc-600 mb-1">Drag & drop product images here</p>
                                            <p className="text-[10px] text-zinc-400 mb-3">PNG, JPG, or WEBP up to 4MB each</p>
                                            <Button variant="outline" size="sm" className="h-8 text-xs bg-white">Upload Images</Button>
                                        </div>

                                        {/* Image 1 */}
                                        <div className="col-span-1 aspect-[3/4] rounded-xl border border-amber-200 bg-amber-50/30 p-1.5 relative group ring-1 ring-amber-400/50">
                                            <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10 shadow-sm border border-amber-200">Primary</div>
                                            <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-zinc-500 hover:text-red-500 flex items-center justify-center z-10 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="w-full h-[65%] rounded-lg bg-zinc-200 mb-1.5 overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="Primary" />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">Alt:</span>
                                                    <input type="text" defaultValue="Najran Piping Lace Abaya Off White" className="w-full text-[10px] border-none bg-transparent p-0 h-4 focus:ring-0 text-zinc-700 placeholder:text-zinc-300" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">Order</span>
                                                        <input type="number" defaultValue={1} className="w-8 text-center text-[10px] border border-zinc-200 rounded p-0 h-4" />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input type="radio" checked className="w-3 h-3 text-[#422d25] focus:ring-[#422d25]" readOnly />
                                                        <span className="text-[9px] font-medium text-zinc-600">Primary</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image 2 */}
                                        <div className="col-span-1 aspect-[3/4] rounded-xl border border-zinc-200 bg-white p-1.5 relative group shadow-sm hover:border-zinc-300 transition-all">
                                            <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-zinc-500 hover:text-red-500 flex items-center justify-center z-10 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="w-full h-[65%] rounded-lg bg-zinc-200 mb-1.5 overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-80" alt="Back View" />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">Alt:</span>
                                                    <input type="text" defaultValue="Back View Abaya" className="w-full text-[10px] border-none bg-transparent p-0 h-4 focus:ring-0 text-zinc-700" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">Order</span>
                                                        <input type="number" defaultValue={2} className="w-8 text-center text-[10px] border border-zinc-200 rounded p-0 h-4" />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input type="radio" className="w-3 h-3 text-zinc-300 focus:ring-zinc-300" readOnly />
                                                        <span className="text-[9px] font-medium text-zinc-400">Primary</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Image 3 (Error) */}
                                        <div className="col-span-1 aspect-[3/4] rounded-xl border border-red-200 bg-red-50/30 p-1.5 relative group shadow-sm ring-1 ring-red-400/50">
                                            <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-red-50 text-zinc-500 hover:text-red-500 flex items-center justify-center z-10 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="w-full h-[65%] rounded-lg bg-zinc-200 mb-1.5 overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover sepia opacity-80" alt="Detail" />
                                            </div>
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[9px] font-medium text-zinc-500">Alt:</span>
                                                    <input type="text" defaultValue="Lace Detail" className="w-full text-[10px] border-none bg-transparent p-0 h-4 focus:ring-0 text-zinc-700" />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-medium text-zinc-500">Order</span>
                                                        <input type="number" defaultValue={3} className="w-8 text-center text-[10px] border border-red-300 bg-red-50 rounded p-0 h-4" />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <input type="radio" className="w-3 h-3 text-zinc-300 focus:ring-zinc-300" readOnly />
                                                        <span className="text-[9px] font-medium text-zinc-400">Primary</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                                        <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            <span>1 image has an invalid file type.</span>
                                        </div>
                                        <span className="text-xs text-zinc-400">You can upload up to 10 images.</span>
                                    </div>
                                </SectionCard>
                            </div>

                            {/* Column 2 */}
                            <div className="flex flex-col gap-6">
                                {/* 2. Material & Care */}
                                <SectionCard title="2. Material & Care" description="Specify material composition and care instructions.">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="material">Material <span className="text-red-500">*</span></Label>
                                            <Textarea id="material" defaultValue="Premium Arabian Crepe" className="min-h-[80px] border-zinc-200 rounded-lg shadow-sm" />
                                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
                                                <Info className="w-3.5 h-3.5" />
                                                <span>Soft, breathable, and flowy.</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="care">Care Instruction <span className="text-red-500">*</span></Label>
                                            <Textarea id="care" defaultValue="Hand wash recommended,&#10;do not bleach,&#10;iron on low heat." className="min-h-[80px] border-zinc-200 rounded-lg shadow-sm" />
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
                                                    <Input id="base_price" defaultValue="450,000" className="pl-4 border-red-300 focus:border-red-500 focus:ring-red-500 rounded-lg shadow-sm pr-10 text-red-600 font-medium bg-red-50/30" />
                                                    <AlertTriangle className="w-4 h-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
                                                </div>
                                                <p className="text-xs text-red-500 mt-1">Base price is required.</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sale_price">Sale Price (IDR)</Label>
                                                <Input id="sale_price" defaultValue="399,000" className="pl-4 border-zinc-200 rounded-lg shadow-sm font-medium" />
                                                <p className="text-[11px] text-zinc-400 mt-1">Sale price must be lower than or equal to the base price.</p>
                                            </div>
                                        </div>
                                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col justify-center h-full">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-zinc-500">Base Price</span>
                                                <span className="text-sm font-medium text-zinc-900">IDR 450,000</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs text-zinc-500">Sale Price</span>
                                                <span className="text-sm font-medium text-zinc-900">IDR 399,000</span>
                                            </div>
                                            <div className="border-t border-zinc-200 border-dashed my-1" />
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm font-bold text-zinc-900">Final Price</span>
                                                <span className="text-lg font-bold text-zinc-900">IDR 399,000</span>
                                            </div>
                                            <div className="flex justify-end mt-1">
                                                <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-1.5 py-0 text-[10px]">11% OFF</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* 4. Shipping & Dimensions */}
                                <SectionCard title="4. Shipping & Dimensions" description="Weight and dimensions are used to calculate shipping costs.">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="weight">Weight (g) <span className="text-red-500">*</span></Label>
                                            <Input id="weight" defaultValue="500" className="border-zinc-200 rounded-lg shadow-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="length">Length (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="length" defaultValue="30" className="border-zinc-200 rounded-lg shadow-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="width">Width (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="width" defaultValue="25" className="border-zinc-200 rounded-lg shadow-sm" />
                                        </div>
                                        <div className="space-y-1.5 relative z-10">
                                            <Label htmlFor="height">Height (cm) <span className="text-red-500">*</span></Label>
                                            <Input id="height" defaultValue="5" className="border-zinc-200 rounded-lg shadow-sm" />
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
                                                        <th className="px-2 py-2 font-medium">Variant Image URL</th>
                                                        <th className="px-2 py-2 font-medium text-center">Active</th>
                                                        <th className="px-2 py-2 font-medium text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                    {/* Variant Row 1 */}
                                                    <tr className="group hover:bg-zinc-50 transition-colors">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400"><GripVertical className="w-3 h-3 inline-block cursor-grab" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="ABY-NJRN-001-S" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-28" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="Off White" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-20" /></td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded px-1.5 h-7 bg-white">
                                                                <div className="w-3 h-3 rounded-full border border-zinc-200 shrink-0" style={{ backgroundColor: '#F8F4E6' }} />
                                                                <input type="text" defaultValue="#F8F4E6" className="w-14 border-none p-0 text-[11px] h-full focus:ring-0 text-zinc-600" />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="S" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-center" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="0" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right w-16" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="25" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right" /></td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">0</td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="https://..." className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-zinc-400 w-24" /></td>
                                                        <td className="px-2 py-1.5 text-center"><Switch defaultChecked className="scale-75 data-[state=checked]:bg-[#422d25]" /></td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-700"><ImageIcon className="w-3 h-3" /></Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 2 */}
                                                    <tr className="group hover:bg-zinc-50 transition-colors">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400"><GripVertical className="w-3 h-3 inline-block cursor-grab" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="ABY-NJRN-001-M" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-28" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="Off White" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-20" /></td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded px-1.5 h-7 bg-white">
                                                                <div className="w-3 h-3 rounded-full border border-zinc-200 shrink-0" style={{ backgroundColor: '#F8F4E6' }} />
                                                                <input type="text" defaultValue="#F8F4E6" className="w-14 border-none p-0 text-[11px] h-full focus:ring-0 text-zinc-600" />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="M" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-center" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="0" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right w-16" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="18" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right" /></td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">0</td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="https://..." className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-zinc-400 w-24" /></td>
                                                        <td className="px-2 py-1.5 text-center"><Switch defaultChecked className="scale-75 data-[state=checked]:bg-[#422d25]" /></td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-700"><ImageIcon className="w-3 h-3" /></Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 3 */}
                                                    <tr className="group hover:bg-zinc-50 transition-colors">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400"><GripVertical className="w-3 h-3 inline-block cursor-grab" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="ABY-NJRN-001-L" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-28" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="Off White" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-20" /></td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded px-1.5 h-7 bg-white">
                                                                <div className="w-3 h-3 rounded-full border border-zinc-200 shrink-0" style={{ backgroundColor: '#F8F4E6' }} />
                                                                <input type="text" defaultValue="#F8F4E6" className="w-14 border-none p-0 text-[11px] h-full focus:ring-0 text-zinc-600" />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="L" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-center" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="0" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right w-16" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="12" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right" /></td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">0</td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="https://..." className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-zinc-400 w-24" /></td>
                                                        <td className="px-2 py-1.5 text-center"><Switch defaultChecked className="scale-75 data-[state=checked]:bg-[#422d25]" /></td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-700"><ImageIcon className="w-3 h-3" /></Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {/* Variant Row 4 (Error) */}
                                                    <tr className="group bg-red-50/30">
                                                        <td className="px-2 py-1.5 text-center text-zinc-400"><GripVertical className="w-3 h-3 inline-block cursor-grab" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="ABY-NJRN-001-XL" className="h-7 text-[11px] border-red-200 rounded shadow-none w-28 text-red-600 bg-white" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="Off White" className="h-7 text-[11px] border-zinc-200 rounded shadow-none w-20 bg-white" /></td>
                                                        <td className="px-2 py-1.5">
                                                            <div className="flex items-center gap-1.5 border border-zinc-200 rounded px-1.5 h-7 bg-white">
                                                                <div className="w-3 h-3 rounded-full border border-zinc-200 shrink-0" style={{ backgroundColor: '#F8F4E6' }} />
                                                                <input type="text" defaultValue="#F8F4E6" className="w-14 border-none p-0 text-[11px] h-full focus:ring-0 text-zinc-600" />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="XL" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-center bg-white" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="0" className="h-7 text-[11px] border-zinc-200 rounded shadow-none text-right w-16 bg-white" /></td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="2" className="h-7 text-[11px] border-red-300 rounded shadow-none text-right bg-white text-red-600 font-bold" /></td>
                                                        <td className="px-2 py-1.5 text-right text-zinc-500">0</td>
                                                        <td className="px-2 py-1.5"><Input defaultValue="invalid-url" className="h-7 text-[11px] border-red-300 rounded shadow-none text-red-600 w-24 bg-red-50" /></td>
                                                        <td className="px-2 py-1.5 text-center"><Switch defaultChecked className="scale-75 data-[state=checked]:bg-[#422d25]" /></td>
                                                        <td className="px-2 py-1.5 text-center">
                                                            <div className="flex justify-center gap-1">
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-700"><ImageIcon className="w-3 h-3" /></Button>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
                                            <Button variant="outline" size="sm" className="h-7 text-[11px] bg-white gap-1"><Plus className="w-3 h-3" /> Add Variant</Button>
                                            <div className="flex items-center gap-4 mr-2">
                                                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Low stock</div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Invalid URL</div>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>

                            </div>
                        </div>

                        {/* 7. SEO Metadata (Full width in main content area) */}
                        <SectionCard title="7. SEO Metadata" description="Optimize your product for search engines.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_title">Meta Title <span className="text-red-500">*</span></Label>
                                            <span className="text-xs text-zinc-400">39 / 60</span>
                                        </div>
                                        <Input id="meta_title" defaultValue="Premium Najran Piping Lace Abaya" className="border-zinc-200 rounded-lg shadow-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <Label htmlFor="meta_desc">Meta Description <span className="text-red-500">*</span></Label>
                                            <span className="text-xs text-zinc-400">83 / 160</span>
                                        </div>
                                        <Textarea id="meta_desc" defaultValue="Discover elegant modest fashion with premium material and refined details." className="min-h-[80px] border-zinc-200 rounded-lg shadow-sm" />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block text-zinc-500 text-xs">Search Engine Preview</Label>
                                    <div className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                                        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                                                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                                            </div>
                                            <span className="truncate">https://aureasyari.com/product/najran-piping-lace-abaya</span>
                                        </div>
                                        <h3 className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer leading-tight mb-1">Premium Najran Piping Lace Abaya - Auréa Syar'i</h3>
                                        <p className="text-[#4d5156] text-sm leading-snug">Discover elegant modest fashion with premium material and refined details. Shop the exclusive Ramadan Collection today.</p>
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
                                        <Select defaultValue="Draft">
                                            <SelectTrigger className="border-zinc-200 rounded-lg shadow-sm flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Draft">Draft</SelectItem>
                                                <SelectItem value="Published">Published</SelectItem>
                                                <SelectItem value="Archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 font-medium shrink-0">Draft</Badge>
                                    </div>
                                    <div className="text-[11px] text-zinc-500 space-y-1.5 mt-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                        <p><strong className="text-zinc-700 font-semibold">Draft:</strong> Product is not visible to customers.</p>
                                        <p><strong className="text-zinc-700 font-semibold">Published:</strong> Product is live and visible.</p>
                                        <p><strong className="text-zinc-700 font-semibold">Archived:</strong> Product is hidden and unavailable.</p>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-100 pt-4 space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">Is Featured</Label>
                                        </div>
                                        <Switch defaultChecked className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">Is New Arrival</Label>
                                        </div>
                                        <Switch defaultChecked className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                                            <Label className="cursor-pointer font-medium text-zinc-700">Is Best Seller</Label>
                                        </div>
                                        <Switch className="data-[state=checked]:bg-[#422d25]" />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Product Preview */}
                        <SectionCard title="Product Preview" description="" headerRight={<Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0">Draft</Badge>} noPaddingTitle>
                            <div className="flex gap-4">
                                <div className="w-20 h-24 rounded-lg bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                                    <img src="https://images.unsplash.com/photo-1588665042457-3f9df881f3b3?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="Preview" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-serif text-[15px] text-zinc-900 leading-tight mb-1">Najran Piping Lace Abaya</h4>
                                    <p className="text-[11px] text-zinc-500 mb-2">Abaya</p>
                                    <div className="flex flex-col mb-2">
                                        <span className="text-[10px] text-zinc-400 line-through decoration-zinc-300">IDR 450,000</span>
                                        <span className="text-sm font-bold text-zinc-900">IDR 399,000</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-auto">
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-200 text-amber-700 bg-amber-50">Featured</Badge>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-200 text-emerald-700 bg-emerald-50">New Arrival</Badge>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-rose-200 text-rose-700 bg-rose-50 opacity-50">Best Seller</Badge>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Quick Summary */}
                        <SectionCard title="Quick Summary" description="" noPaddingTitle>
                            <div className="space-y-3 text-[13px]">
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5" /> Category</span>
                                    <span className="font-medium text-zinc-900">Abaya</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Collection</span>
                                    <span className="font-medium text-zinc-900">Ramadan Collection</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> SKU</span>
                                    <span className="font-medium text-zinc-900">ABY-NJRN-001</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Base Price</span>
                                    <span className="font-medium text-zinc-900">IDR 450,000</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Sale Price</span>
                                    <span className="font-medium text-zinc-900">IDR 399,000</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Stock (Total)</span>
                                    <span className="font-medium text-zinc-900">57</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-zinc-50">
                                    <span className="text-zinc-500 flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> Primary Images</span>
                                    <span className="font-medium text-zinc-900">1 / 4</span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-6 mt-4 border-t border-zinc-200">
                    <Button variant="outline" className="h-10 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium">
                        Cancel
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-10 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm rounded-lg font-medium">
                            Save as Draft
                        </Button>
                        <Button className="h-10 px-6 bg-[#422d25] hover:bg-[#34231d] text-white shadow-md rounded-lg font-medium transition-all hover:shadow-lg">
                            Publish Product
                        </Button>
                    </div>
                </div>

            </div>
        </>
    );
}

// Subcomponents

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
