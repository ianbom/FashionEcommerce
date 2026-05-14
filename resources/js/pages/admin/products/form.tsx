import { Head, Link, useForm } from '@inertiajs/react';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Highlighter,
    Image as ImageIcon,
    Pencil,
    Plus,
    Trash2,
    X,
    Info,
    GripVertical,
    AlertTriangle,
    Layers,
    Tag,
    DollarSign,
    Package,
    Star,
    Sparkles,
    TrendingUp,
    LayoutGrid,
    Eraser,
    Heading2,
    Italic,
    List,
    ListOrdered,
    Pilcrow,
    Redo2,
    Underline as UnderlineIcon,
    Undo2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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
type ProductVariantPayload = {
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
type ProductVariantRow = ProductVariantPayload & {
    image: File | null;
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
type Product = Omit<ProductFormData, 'images' | 'variants'> & {
    id: number;
    images: ProductImagePayload[];
    variants: ProductVariantPayload[];
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
    image: null,
    is_active: true,
});

function SectionCard({
    title,
    description,
    children,
    icon,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-100 px-6 py-4">
                {icon && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function FieldRow({
    children,
    cols = 1,
}: {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
}) {
    const gridClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4',
    }[cols];

    return <div className={`grid ${gridClass} gap-4`}>{children}</div>;
}

function FieldGroup({
    label,
    hint,
    required,
    error,
    children,
    charCount,
    maxChar,
}: {
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
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </Label>
                {maxChar !== undefined && (
                    <span
                        className={`text-[11px] tabular-nums ${(charCount ?? 0) > maxChar * 0.9 ? 'text-amber-500' : 'text-zinc-400'}`}
                    >
                        {charCount ?? 0}/{maxChar}
                    </span>
                )}
            </div>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-[11px] text-zinc-400">{hint}</p>
            )}
        </div>
    );
}

function ProductDescriptionEditor({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (html: string) => void;
    error?: string;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'rounded bg-amber-100 px-0.5 text-zinc-950',
                },
            }),
            Placeholder.configure({
                placeholder: 'Detailed product description...',
            }),
            Underline,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'min-h-[200px] px-4 py-3 text-sm leading-6 text-zinc-900 outline-none',
            },
        },
        immediatelyRender: false,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    const editorState = useEditorState({
        editor,
        selector: ({ editor }) => ({
            canRedo: editor?.can().chain().focus().redo().run() ?? false,
            canUndo: editor?.can().chain().focus().undo().run() ?? false,
            isBold: editor?.isActive('bold') ?? false,
            isBulletList: editor?.isActive('bulletList') ?? false,
            isHeading2: editor?.isActive('heading', { level: 2 }) ?? false,
            isHighlight: editor?.isActive('highlight') ?? false,
            isItalic: editor?.isActive('italic') ?? false,
            isOrderedList: editor?.isActive('orderedList') ?? false,
            isParagraph: editor?.isActive('paragraph') ?? false,
            isUnderline: editor?.isActive('underline') ?? false,
        }),
    });
    const state = editorState ?? {
        canRedo: false,
        canUndo: false,
        isBold: false,
        isBulletList: false,
        isHeading2: false,
        isHighlight: false,
        isItalic: false,
        isOrderedList: false,
        isParagraph: false,
        isUnderline: false,
    };

    useEffect(() => {
        if (!editor || editor.isFocused) {
            return;
        }

        if ((value || '') !== editor.getHTML()) {
            editor.commands.setContent(value || '<p></p>', {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    const toolbar = [
        {
            label: 'Undo',
            icon: Undo2,
            active: false,
            disabled: !state.canUndo,
            action: () => editor?.chain().focus().undo().run(),
        },
        {
            label: 'Redo',
            icon: Redo2,
            active: false,
            disabled: !state.canRedo,
            action: () => editor?.chain().focus().redo().run(),
        },
        {
            label: 'Paragraph',
            icon: Pilcrow,
            active: state.isParagraph,
            disabled: !editor,
            action: () => editor?.chain().focus().setParagraph().run(),
        },
        {
            label: 'Heading',
            icon: Heading2,
            active: state.isHeading2,
            disabled: !editor,
            action: () =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            label: 'Bold',
            icon: Bold,
            active: state.isBold,
            disabled: !editor?.can().chain().focus().toggleBold().run(),
            action: () => editor?.chain().focus().toggleBold().run(),
        },
        {
            label: 'Italic',
            icon: Italic,
            active: state.isItalic,
            disabled: !editor?.can().chain().focus().toggleItalic().run(),
            action: () => editor?.chain().focus().toggleItalic().run(),
        },
        {
            label: 'Underline',
            icon: UnderlineIcon,
            active: state.isUnderline,
            disabled: !editor?.can().chain().focus().toggleUnderline().run(),
            action: () => editor?.chain().focus().toggleUnderline().run(),
        },
        {
            label: 'Highlight',
            icon: Highlighter,
            active: state.isHighlight,
            disabled: !editor?.can().chain().focus().toggleHighlight().run(),
            action: () => editor?.chain().focus().toggleHighlight().run(),
        },
        {
            label: 'Bullet list',
            icon: List,
            active: state.isBulletList,
            disabled: !editor?.can().chain().focus().toggleBulletList().run(),
            action: () => editor?.chain().focus().toggleBulletList().run(),
        },
        {
            label: 'Ordered list',
            icon: ListOrdered,
            active: state.isOrderedList,
            disabled: !editor?.can().chain().focus().toggleOrderedList().run(),
            action: () => editor?.chain().focus().toggleOrderedList().run(),
        },
        {
            label: 'Clear formatting',
            icon: Eraser,
            active: false,
            disabled: !editor,
            action: () => editor?.chain().focus().unsetAllMarks().clearNodes().run(),
        },
    ];

    return (
        <div
            className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-colors ${
                error
                    ? 'border-red-300 ring-1 ring-red-200'
                    : 'border-zinc-200 focus-within:border-[#7F2020] focus-within:ring-1 focus-within:ring-[#7F2020]'
            }`}
        >
            <div className="flex flex-wrap gap-1 border-b border-zinc-100 bg-zinc-50 px-2 py-2">
                {toolbar.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.label}
                            type="button"
                            title={item.label}
                            aria-pressed={item.active}
                            disabled={item.disabled}
                            onClick={item.action}
                            className={`inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                item.active
                                    ? 'bg-[#7F2020] text-white'
                                    : 'text-zinc-600 hover:bg-white hover:text-zinc-900'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    );
                })}
            </div>
            <EditorContent editor={editor} />
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
            variants: product?.variants?.length
                ? product.variants.map((variant) => ({
                      ...variant,
                      image: null,
                  }))
                : [],
        });

    const fieldError = (key: string) =>
        (errors as Record<string, string | undefined>)[key];

    // Local blob previews — never sent to server, never stored in image_url
    const [previews, setPreviews] = useState<(string | null)[]>(() =>
        (product?.images ?? [{ image_url: null }]).map(
            (img) => img.image_url ?? null,
        ),
    );
    const [variantModalOpen, setVariantModalOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<
        number | null
    >(null);
    const [variantDraft, setVariantDraft] = useState<ProductVariantRow>(
        blankVariant(),
    );
    const [variantDraftPreview, setVariantDraftPreview] = useState<
        string | null
    >(null);

    // Revoke old blob URLs on unmount to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
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

    const openVariantModal = (index: number | null = null) => {
        setEditingVariantIndex(index);
        const draft = index === null ? blankVariant() : { ...data.variants[index] };
        setVariantDraft(draft);
        setVariantDraftPreview(draft.image_url || null);
        setVariantModalOpen(true);
    };

    const closeVariantModal = () => {
        if (variantDraftPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(variantDraftPreview);
        }

        setVariantModalOpen(false);
        setEditingVariantIndex(null);
        setVariantDraft(blankVariant());
        setVariantDraftPreview(null);
    };

    const saveVariantDraft = () => {
        const draft = { ...variantDraft };

        if (editingVariantIndex === null) {
            setData('variants', [...data.variants, draft]);
        } else {
            const next = [...data.variants];
            next[editingVariantIndex] = draft;
            setData('variants', next);
        }

        setVariantModalOpen(false);
        setEditingVariantIndex(null);
        setVariantDraft(blankVariant());
        setVariantDraftPreview(null);
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

    const variantsCount = data.variants.filter((v) => v.sku).length;
    // Preview: use blob URL if new file selected, else fall back to stored image_url
    const getPreview = (index: number): string | null =>
        previews[index] ?? data.images[index]?.image_url ?? null;
    const primaryIndex = data.images.findIndex((i) => i.is_primary);
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
                <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                        <div className="flex h-14 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={
                                        isEdit
                                            ? `/admin/products/${product?.id}`
                                            : '/admin/products'
                                    }
                                    className="text-zinc-400 transition-colors hover:text-zinc-700"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                </Link>
                                <div className="h-5 w-px bg-zinc-200" />
                                <div>
                                    <h1 className="text-sm font-semibold text-zinc-900">
                                        {isEdit
                                            ? `Edit: ${product?.name ?? 'Product'}`
                                            : 'Create Product'}
                                    </h1>
                                    <p className="hidden text-[11px] text-zinc-400 sm:block">
                                        {isEdit
                                            ? 'Update product details, images, and variants'
                                            : 'Fill in details to create a new product'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={`border-0 text-[11px] font-medium capitalize ${statusColors[data.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                                >
                                    {data.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
                            {/* ── Main Column ── */}
                            <div className="flex flex-col gap-5">
                                {/* 1. Basic Information */}
                                <SectionCard
                                    title="Basic Information"
                                    description="Essential details about your product"
                                    icon={
                                        <Tag className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <div className="space-y-4">
                                        <FieldRow cols={2}>
                                            <FieldGroup
                                                label="Product Name"
                                                required
                                                error={errors.name}
                                            >
                                                <Input
                                                    value={data.name}
                                                    onChange={(e) => {
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        );

                                                        if (!isEdit) {
                                                            setData(
                                                                'slug',
                                                                slugify(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                    placeholder="e.g. Gamis Syar'i Pita"
                                                    className="h-9 border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                            <FieldGroup
                                                label="SKU"
                                                required
                                                error={errors.sku}
                                                hint="Unique product identifier"
                                            >
                                                <Input
                                                    value={data.sku}
                                                    onChange={(e) =>
                                                        setData(
                                                            'sku',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. GMS-001"
                                                    className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                        </FieldRow>

                                        <FieldGroup
                                            label="URL Slug"
                                            required
                                            error={errors.slug}
                                            hint="Used in the product URL — lowercase letters, numbers, hyphens only"
                                        >
                                            <div className="flex gap-2">
                                                <Input
                                                    value={data.slug}
                                                    onChange={(e) =>
                                                        setData(
                                                            'slug',
                                                            slugify(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="e.g. gamis-syari-pita"
                                                    className="h-9 flex-1 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 shrink-0 border-zinc-200 px-3 text-xs"
                                                    onClick={() =>
                                                        setData(
                                                            'slug',
                                                            slugify(data.name),
                                                        )
                                                    }
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                        </FieldGroup>

                                        <FieldRow cols={2}>
                                            <FieldGroup
                                                label="Category"
                                                error={errors.category_id}
                                            >
                                                <select
                                                    value={data.category_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            'category_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#7F2020] focus:ring-1 focus:ring-[#7F2020] focus:outline-none"
                                                >
                                                    <option value="">
                                                        No category
                                                    </option>
                                                    {options.categories.map(
                                                        (c) => (
                                                            <option
                                                                key={c.id}
                                                                value={c.id}
                                                            >
                                                                {c.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </FieldGroup>
                                            <FieldGroup
                                                label="Collection"
                                                error={errors.collection_id}
                                            >
                                                <select
                                                    value={data.collection_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            'collection_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#7F2020] focus:ring-1 focus:ring-[#7F2020] focus:outline-none"
                                                >
                                                    <option value="">
                                                        No collection
                                                    </option>
                                                    {options.collections.map(
                                                        (c) => (
                                                            <option
                                                                key={c.id}
                                                                value={c.id}
                                                            >
                                                                {c.name}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                            </FieldGroup>
                                        </FieldRow>

                                        <FieldGroup
                                            label="Short Description"
                                            required
                                            error={errors.short_description}
                                            charCount={
                                                data.short_description?.length
                                            }
                                            maxChar={160}
                                        >
                                            <Input
                                                value={data.short_description}
                                                onChange={(e) =>
                                                    setData(
                                                        'short_description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Brief product summary for listings"
                                                className="h-9 border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>

                                        <FieldGroup
                                            label="Description"
                                            required
                                            error={errors.description}
                                        >
                                            <ProductDescriptionEditor
                                                value={data.description}
                                                onChange={(html) =>
                                                    setData(
                                                        'description',
                                                        html,
                                                    )
                                                }
                                                error={errors.description}
                                            />
                                        </FieldGroup>
                                    </div>
                                </SectionCard>

                                {/* 2. Material & Care */}
                                <SectionCard
                                    title="Material & Care"
                                    description="Material composition and care instructions"
                                    icon={
                                        <Info className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <FieldRow cols={2}>
                                        <FieldGroup
                                            label="Material"
                                            required
                                            error={errors.material}
                                            hint="e.g. 100% Premium Voile, Linen"
                                        >
                                            <Textarea
                                                value={data.material}
                                                onChange={(e) =>
                                                    setData(
                                                        'material',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Describe material composition..."
                                                className="min-h-[90px] resize-y border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Care Instruction"
                                            required
                                            error={errors.care_instruction}
                                            hint="e.g. Hand wash cold, do not bleach"
                                        >
                                            <Textarea
                                                value={data.care_instruction}
                                                onChange={(e) =>
                                                    setData(
                                                        'care_instruction',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Washing and care instructions..."
                                                className="min-h-[90px] resize-y border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                    </FieldRow>
                                </SectionCard>

                                {/* 3. Pricing */}
                                <SectionCard
                                    title="Pricing"
                                    description="Set base and sale prices (IDR)"
                                    icon={
                                        <DollarSign className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-4">
                                            <FieldGroup
                                                label="Base Price (IDR)"
                                                required
                                                error={errors.base_price}
                                            >
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={data.base_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'base_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0"
                                                    className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                            <FieldGroup
                                                label="Sale Price (IDR)"
                                                error={errors.sale_price}
                                                hint="Must be lower than or equal to base price"
                                            >
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={data.sale_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'sale_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Leave empty for no discount"
                                                    className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                        </div>

                                        {/* Pricing Summary */}
                                        <div className="flex flex-col justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-4">
                                            <p className="mb-3 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
                                                Price Summary
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-zinc-500">
                                                        Base
                                                    </span>
                                                    <span className="font-mono text-zinc-900">
                                                        IDR{' '}
                                                        {Number(
                                                            data.base_price ||
                                                                0,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-zinc-500">
                                                        Sale
                                                    </span>
                                                    <span className="font-mono text-zinc-900">
                                                        IDR{' '}
                                                        {Number(
                                                            data.sale_price ||
                                                                0,
                                                        ).toLocaleString(
                                                            'id-ID',
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-2 border-t border-dashed border-zinc-200 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-zinc-900">
                                                            Final
                                                        </span>
                                                        <span className="font-mono text-base font-bold text-[#7F2020]">
                                                            IDR{' '}
                                                            {Number(
                                                                data.sale_price ||
                                                                    data.base_price ||
                                                                    0,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {data.sale_price &&
                                                    Number(data.sale_price) <
                                                        Number(
                                                            data.base_price,
                                                        ) && (
                                                        <div className="mt-1 flex items-center gap-1.5">
                                                            <Badge className="border-0 bg-emerald-100 text-[10px] font-medium text-emerald-700">
                                                                {Math.round(
                                                                    (1 -
                                                                        Number(
                                                                            data.sale_price,
                                                                        ) /
                                                                            Number(
                                                                                data.base_price,
                                                                            )) *
                                                                        100,
                                                                )}
                                                                % OFF
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
                                    icon={
                                        <Package className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <FieldRow cols={4}>
                                        <FieldGroup
                                            label="Weight (g)"
                                            required
                                            error={errors.weight}
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.weight}
                                                onChange={(e) =>
                                                    setData(
                                                        'weight',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Length (cm)"
                                            required
                                            error={errors.length}
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.length}
                                                onChange={(e) =>
                                                    setData(
                                                        'length',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Width (cm)"
                                            required
                                            error={errors.width}
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.width}
                                                onChange={(e) =>
                                                    setData(
                                                        'width',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                        <FieldGroup
                                            label="Height (cm)"
                                            required
                                            error={errors.height}
                                        >
                                            <Input
                                                type="number"
                                                min="0"
                                                value={data.height}
                                                onChange={(e) =>
                                                    setData(
                                                        'height',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                                className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                            />
                                        </FieldGroup>
                                    </FieldRow>
                                </SectionCard>

                                {/* 5. Product Images */}
                                <SectionCard
                                    title="Product Images"
                                    description="Upload high-quality product photos (recommended: 800×1067px)"
                                    icon={
                                        <ImageIcon className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                        {data.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                                                    image.is_primary
                                                        ? 'border-[#7F2020] ring-2 ring-[#7F2020]/20'
                                                        : 'border-zinc-200 hover:border-zinc-300'
                                                }`}
                                            >
                                                {/* Image area */}
                                                <div className="relative flex aspect-[3/4] items-center justify-center bg-zinc-50">
                                                    {getPreview(index) ? (
                                                        <img
                                                            src={
                                                                getPreview(
                                                                    index,
                                                                )!
                                                            }
                                                            className="h-full w-full object-cover"
                                                            alt={image.alt_text}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-zinc-300">
                                                            <ImageIcon className="h-7 w-7" />
                                                            <span className="text-[10px]">
                                                                Click to upload
                                                            </span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 cursor-pointer opacity-0"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target
                                                                    .files?.[0] ??
                                                                null;
                                                            // Store File object for upload — do NOT touch image_url
                                                            updateImage(
                                                                index,
                                                                'image',
                                                                file,
                                                            );
                                                            // Preview via blob URL (local only, never sent to server)
                                                            const next = [
                                                                ...previews,
                                                            ];

                                                            if (
                                                                next[index] &&
                                                                next[
                                                                    index
                                                                ]!.startsWith(
                                                                    'blob:',
                                                                )
                                                            ) {
                                                                URL.revokeObjectURL(
                                                                    next[
                                                                        index
                                                                    ]!,
                                                                );
                                                            }

                                                            next[index] = file
                                                                ? URL.createObjectURL(
                                                                      file,
                                                                  )
                                                                : null;
                                                            setPreviews(next);
                                                        }}
                                                    />
                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (
                                                                previews[
                                                                    index
                                                                ]?.startsWith(
                                                                    'blob:',
                                                                )
                                                            ) {
                                                                URL.revokeObjectURL(
                                                                    previews[
                                                                        index
                                                                    ]!,
                                                                );
                                                            }

                                                            setData(
                                                                'images',
                                                                data.images.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                ),
                                                            );
                                                            setPreviews(
                                                                previews.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                ),
                                                            );
                                                        }}
                                                        className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-500 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:border-red-200 hover:text-red-500"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                    {/* Primary badge */}
                                                    {image.is_primary && (
                                                        <div className="absolute bottom-1.5 left-1.5 z-10 rounded bg-[#7F2020] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                                                            Primary
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Controls */}
                                                <div className="space-y-1 border-t border-zinc-100 bg-white px-2 py-1.5">
                                                    <input
                                                        type="text"
                                                        value={image.alt_text}
                                                        onChange={(e) =>
                                                            updateImage(
                                                                index,
                                                                'alt_text',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Alt text"
                                                        className="w-full rounded border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-300 focus:ring-0"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <label className="flex cursor-pointer items-center gap-1">
                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    image.is_primary
                                                                }
                                                                onChange={() =>
                                                                    setPrimaryImage(
                                                                        index,
                                                                    )
                                                                }
                                                                className="h-3 w-3 accent-[#7F2020]"
                                                            />
                                                            <span className="text-[10px] text-zinc-500">
                                                                Primary
                                                            </span>
                                                        </label>
                                                        <div className="flex items-center gap-0.5">
                                                            <span className="text-[10px] text-zinc-400">
                                                                Order:
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={
                                                                    image.sort_order
                                                                }
                                                                onChange={(e) =>
                                                                    updateImage(
                                                                        index,
                                                                        'sort_order',
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="w-8 rounded border border-zinc-100 bg-zinc-50 py-0 text-center text-[10px] focus:border-zinc-300 focus:ring-0"
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
                                                setData('images', [
                                                    ...data.images,
                                                    blankImage(),
                                                ]);
                                                setPreviews([
                                                    ...previews,
                                                    null,
                                                ]);
                                            }}
                                            className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-600"
                                        >
                                            <Plus className="h-6 w-6" />
                                            <span className="text-[11px] font-medium">
                                                Add Image
                                            </span>
                                        </button>
                                    </div>
                                    {fieldError('images') && (
                                        <p className="mt-3 flex items-center gap-1 text-[11px] text-red-500">
                                            <AlertTriangle className="h-3 w-3" />
                                            {fieldError('images')}
                                        </p>
                                    )}
                                </SectionCard>

                                {/* 6. Product Variants */}
                                <SectionCard
                                    title="Product Variants"
                                    description="Add size/color combinations with individual stock and pricing"
                                    icon={
                                        <Layers className="h-4 w-4 text-zinc-500" />
                                    }
                                >
                                    <div className="overflow-hidden rounded-lg border border-zinc-200">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[760px] text-xs">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 bg-zinc-50">
                                                        <th className="w-8 px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500"></th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500">
                                                            Variant SKU
                                                        </th>
                                                        <th className="px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500">
                                                            Color Name
                                                        </th>
                                                        <th className="w-20 px-3 py-2.5 text-left text-[11px] font-medium text-zinc-500">
                                                            Size
                                                        </th>
                                                        <th className="w-16 px-3 py-2.5 text-center text-[11px] font-medium text-zinc-500">
                                                            Image
                                                        </th>
                                                        <th className="w-24 px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500">
                                                            Price Add.
                                                        </th>
                                                        <th className="w-20 px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500">
                                                            Stock
                                                        </th>
                                                        <th className="w-20 px-3 py-2.5 text-right text-[11px] font-medium text-zinc-500">
                                                            Reserved
                                                        </th>
                                                        <th className="w-16 px-3 py-2.5 text-center text-[11px] font-medium text-zinc-500">
                                                            Active
                                                        </th>
                                                        <th className="w-20 px-3 py-2.5 text-center text-[11px] font-medium text-zinc-500">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 bg-white">
                                                    {data.variants.map(
                                                        (variant, index) => (
                                                            <tr
                                                                key={index}
                                                                className="group transition-colors hover:bg-zinc-50/60"
                                                            >
                                                                <td className="px-3 py-2 text-center">
                                                                    <GripVertical className="h-3.5 w-3.5 cursor-grab text-zinc-300" />
                                                                </td>
                                                                <td className="px-3 py-2 font-mono text-xs text-zinc-700">
                                                                    {variant.sku || (
                                                                        <span className="text-zinc-300">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="h-3.5 w-3.5 rounded-full border border-zinc-200"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    variant.color_hex ||
                                                                                    '#ffffff',
                                                                            }}
                                                                        />
                                                                        <span className="text-zinc-700">
                                                                            {variant.color_name ||
                                                                                '—'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                                                                        {variant.size || '—'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {variant.image_url ? (
                                                                        <img
                                                                            src={
                                                                                variant.image_url
                                                                            }
                                                                            alt={
                                                                                variant.sku
                                                                            }
                                                                            className="mx-auto h-8 w-8 rounded border border-zinc-200 object-cover"
                                                                        />
                                                                    ) : (
                                                                        <ImageIcon className="mx-auto h-4 w-4 text-zinc-300" />
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-zinc-700">
                                                                    {Number(
                                                                        variant.additional_price ||
                                                                            0,
                                                                    ).toLocaleString(
                                                                        'id-ID',
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-zinc-700">
                                                                    {variant.stock}
                                                                </td>
                                                                <td className="px-3 py-2 text-right font-mono text-zinc-500">
                                                                    {variant.reserved_stock}
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <Switch
                                                                        checked={
                                                                            variant.is_active
                                                                        }
                                                                        onCheckedChange={(
                                                                            v,
                                                                        ) =>
                                                                            updateVariant(
                                                                                index,
                                                                                'is_active',
                                                                                v,
                                                                            )
                                                                        }
                                                                        className="scale-[0.8] data-[state=checked]:bg-[#7F2020]"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <div className="flex justify-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openVariantModal(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="flex h-6 w-6 items-center justify-center rounded text-zinc-300 transition-all hover:bg-zinc-100 hover:text-zinc-700"
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setData(
                                                                                    'variants',
                                                                                    data.variants.filter(
                                                                                        (
                                                                                            _,
                                                                                            i,
                                                                                        ) =>
                                                                                            i !==
                                                                                            index,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            className="flex h-6 w-6 items-center justify-center rounded text-zinc-300 transition-all hover:bg-red-50 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                    {data.variants.length ===
                                                        0 && (
                                                        <tr>
                                                            <td
                                                                colSpan={10}
                                                                className="px-3 py-8 text-center text-xs text-zinc-400"
                                                            >
                                                                No variants yet.
                                                                Click Add
                                                                Variant to
                                                                create one.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50 px-3 py-2.5">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openVariantModal()}
                                                className="h-7 gap-1.5 border-zinc-200 bg-white text-xs text-zinc-700"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add Variant
                                            </Button>
                                            <span className="text-[11px] text-zinc-400">
                                                {variantsCount} variant
                                                {variantsCount !== 1
                                                    ? 's'
                                                    : ''}{' '}
                                                with SKU
                                            </span>
                                        </div>
                                    </div>
                                    {fieldError('variants') && (
                                        <p className="mt-2 flex items-center gap-1 text-[11px] text-red-500">
                                            <AlertTriangle className="h-3 w-3" />
                                            {fieldError('variants')}
                                        </p>
                                    )}
                                </SectionCard>

                                {/* 7. SEO Metadata */}
                                {/* <SectionCard
                                    title="SEO Metadata"
                                    description="Optimize your product for search engines"
                                    icon={
                                        <svg
                                            className="h-4 w-4 text-zinc-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                            />
                                        </svg>
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="space-y-4">
                                            <FieldGroup
                                                label="Meta Title"
                                                error={errors.meta_title}
                                                hint="Recommended: 50–60 characters"
                                                charCount={
                                                    data.meta_title?.length
                                                }
                                                maxChar={60}
                                            >
                                                <Input
                                                    value={data.meta_title}
                                                    onChange={(e) =>
                                                        setData(
                                                            'meta_title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        data.name ||
                                                        'Product title for search results'
                                                    }
                                                    className="h-9 border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                            <FieldGroup
                                                label="Meta Description"
                                                error={errors.meta_description}
                                                hint="Recommended: 120–160 characters"
                                                charCount={
                                                    data.meta_description
                                                        ?.length
                                                }
                                                maxChar={160}
                                            >
                                                <Textarea
                                                    value={
                                                        data.meta_description
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'meta_description',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={
                                                        data.short_description ||
                                                        'Brief description for search results...'
                                                    }
                                                    className="min-h-[80px] resize-y border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                                />
                                            </FieldGroup>
                                        </div>

                                      
                                        <div>
                                            <p className="mb-2 text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
                                                Search Preview
                                            </p>
                                            <div className="rounded-lg border border-zinc-200 bg-white p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                                                        <svg
                                                            className="h-3 w-3 text-zinc-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="truncate text-[11px] text-zinc-500">
                                                        aureasyari.com › product
                                                        ›{' '}
                                                        {data.slug ||
                                                            'product-slug'}
                                                    </span>
                                                </div>
                                                <h3 className="mb-1 line-clamp-1 text-base leading-tight font-medium text-[#1a0dab]">
                                                    {data.meta_title ||
                                                        data.name ||
                                                        'Product Title'}{' '}
                                                    — Auréa Syar'i
                                                </h3>
                                                <p className="line-clamp-2 text-xs leading-relaxed text-[#4d5156]">
                                                    {data.meta_description ||
                                                        data.short_description ||
                                                        'Product description will appear here in search engine results.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard> */}

                                {/* Form Actions (bottom) */}
                                <div className="flex items-center justify-between pt-2 pb-8">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-10 border-zinc-200 px-5 text-zinc-600 hover:bg-zinc-50"
                                    >
                                        <Link
                                            href={
                                                isEdit
                                                    ? `/admin/products/${product?.id}`
                                                    : '/admin/products'
                                            }
                                        >
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
                                            className="h-10 bg-[#7F2020] px-6 font-medium text-white shadow-sm hover:bg-[#5F1717]"
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <svg
                                                        className="h-3.5 w-3.5 animate-spin"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v8H4z"
                                                        />
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : isEdit ? (
                                                'Save Changes'
                                            ) : (
                                                'Save Product'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Sidebar ── */}
                            <div className="flex flex-col gap-4 xl:sticky xl:top-[57px]">
                                {/* Publishing */}
                                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <div className="border-b border-zinc-100 px-5 py-4">
                                        <h3 className="text-sm font-semibold text-zinc-900">
                                            Publishing
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-zinc-500">
                                            Control product visibility
                                        </p>
                                    </div>
                                    <div className="space-y-4 p-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-zinc-700">
                                                Status{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <select
                                                value={data.status}
                                                onChange={(e) =>
                                                    setData(
                                                        'status',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-[#7F2020] focus:ring-1 focus:ring-[#7F2020] focus:outline-none"
                                            >
                                                {options.statuses.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            s.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.status && (
                                                <p className="text-[11px] text-red-500">
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-[11px] text-zinc-500">
                                            <p>
                                                <span className="font-semibold text-zinc-700">
                                                    Draft
                                                </span>{' '}
                                                — Not visible to customers
                                            </p>
                                            <p>
                                                <span className="font-semibold text-zinc-700">
                                                    Published
                                                </span>{' '}
                                                — Live and visible in store
                                            </p>
                                            <p>
                                                <span className="font-semibold text-zinc-700">
                                                    Archived
                                                </span>{' '}
                                                — Hidden and unavailable
                                            </p>
                                        </div>

                                        <div className="space-y-3 border-t border-zinc-100 pt-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Star
                                                        className={`h-4 w-4 ${data.is_featured ? 'text-amber-500' : 'text-zinc-300'}`}
                                                    />
                                                    <Label
                                                        htmlFor="is_featured"
                                                        className="cursor-pointer text-xs text-zinc-700"
                                                    >
                                                        Featured
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id="is_featured"
                                                    checked={data.is_featured}
                                                    onCheckedChange={(v) =>
                                                        setData(
                                                            'is_featured',
                                                            v,
                                                        )
                                                    }
                                                    className="scale-90 data-[state=checked]:bg-[#7F2020]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles
                                                        className={`h-4 w-4 ${data.is_new_arrival ? 'text-emerald-500' : 'text-zinc-300'}`}
                                                    />
                                                    <Label
                                                        htmlFor="is_new_arrival"
                                                        className="cursor-pointer text-xs text-zinc-700"
                                                    >
                                                        New Arrival
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id="is_new_arrival"
                                                    checked={
                                                        data.is_new_arrival
                                                    }
                                                    onCheckedChange={(v) =>
                                                        setData(
                                                            'is_new_arrival',
                                                            v,
                                                        )
                                                    }
                                                    className="scale-90 data-[state=checked]:bg-[#7F2020]"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp
                                                        className={`h-4 w-4 ${data.is_best_seller ? 'text-rose-500' : 'text-zinc-300'}`}
                                                    />
                                                    <Label
                                                        htmlFor="is_best_seller"
                                                        className="cursor-pointer text-xs text-zinc-700"
                                                    >
                                                        Best Seller
                                                    </Label>
                                                </div>
                                                <Switch
                                                    id="is_best_seller"
                                                    checked={
                                                        data.is_best_seller
                                                    }
                                                    onCheckedChange={(v) =>
                                                        setData(
                                                            'is_best_seller',
                                                            v,
                                                        )
                                                    }
                                                    className="scale-90 data-[state=checked]:bg-[#7F2020]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Preview */}
                                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <div className="border-b border-zinc-100 px-5 py-4">
                                        <h3 className="text-sm font-semibold text-zinc-900">
                                            Preview
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-zinc-500">
                                            How it appears in the store
                                        </p>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex gap-3">
                                            <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                                                {primaryPreview ? (
                                                    <img
                                                        src={primaryPreview}
                                                        className="h-full w-full object-cover"
                                                        alt="Preview"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-5 w-5 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="mb-0.5 line-clamp-2 text-sm leading-tight font-semibold text-zinc-900">
                                                    {data.name || (
                                                        <span className="text-zinc-300">
                                                            Product Name
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="mb-1.5 text-[11px] text-zinc-400">
                                                    {options.categories.find(
                                                        (c) =>
                                                            c.id.toString() ===
                                                            data.category_id.toString(),
                                                    )?.name || 'No Category'}
                                                </p>
                                                <div>
                                                    {data.sale_price ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs text-zinc-400 line-through">
                                                                IDR{' '}
                                                                {Number(
                                                                    data.base_price ||
                                                                        0,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                            <span className="text-sm font-bold text-[#7F2020]">
                                                                IDR{' '}
                                                                {Number(
                                                                    data.sale_price,
                                                                ).toLocaleString(
                                                                    'id-ID',
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-bold text-zinc-900">
                                                            IDR{' '}
                                                            {Number(
                                                                data.base_price ||
                                                                    0,
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {data.is_featured && (
                                                        <Badge className="border-0 bg-amber-100 px-1.5 py-0 text-[9px] text-amber-700">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {data.is_new_arrival && (
                                                        <Badge className="border-0 bg-emerald-100 px-1.5 py-0 text-[9px] text-emerald-700">
                                                            New
                                                        </Badge>
                                                    )}
                                                    {data.is_best_seller && (
                                                        <Badge className="border-0 bg-rose-100 px-1.5 py-0 text-[9px] text-rose-700">
                                                            Best Seller
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Summary */}
                                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                                    <div className="border-b border-zinc-100 px-5 py-4">
                                        <h3 className="text-sm font-semibold text-zinc-900">
                                            Summary
                                        </h3>
                                    </div>
                                    <div className="space-y-0 p-5">
                                        {[
                                            {
                                                icon: (
                                                    <LayoutGrid className="h-3.5 w-3.5" />
                                                ),
                                                label: 'Category',
                                                value:
                                                    options.categories.find(
                                                        (c) =>
                                                            c.id.toString() ===
                                                            data.category_id.toString(),
                                                    )?.name || '—',
                                            },
                                            {
                                                icon: (
                                                    <Layers className="h-3.5 w-3.5" />
                                                ),
                                                label: 'Collection',
                                                value:
                                                    options.collections.find(
                                                        (c) =>
                                                            c.id.toString() ===
                                                            data.collection_id.toString(),
                                                    )?.name || '—',
                                            },
                                            {
                                                icon: (
                                                    <Tag className="h-3.5 w-3.5" />
                                                ),
                                                label: 'SKU',
                                                value: data.sku || '—',
                                            },
                                            {
                                                icon: (
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                ),
                                                label: 'Base Price',
                                                value: data.base_price
                                                    ? `IDR ${Number(data.base_price).toLocaleString('id-ID')}`
                                                    : '—',
                                            },
                                            {
                                                icon: (
                                                    <Package className="h-3.5 w-3.5" />
                                                ),
                                                label: 'Variants',
                                                value: `${variantsCount} with SKU`,
                                            },
                                            {
                                                icon: (
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                ),
                                                label: 'Images',
                                                value: `${data.images.filter((i) => i.image || i.image_url).length} uploaded`,
                                            },
                                        ].map(({ icon, label, value }) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between border-b border-zinc-50 py-2 last:border-0"
                                            >
                                                <span className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                    {icon}
                                                    {label}
                                                </span>
                                                <span className="max-w-[120px] truncate text-right text-[11px] font-medium text-zinc-700">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Save actions (sidebar) */}
                                <div className="flex flex-col gap-2">
                                    {/* <Button
                                        type="submit"
                                        form="product-form"
                                        className="w-full h-10 bg-[#7F2020] hover:bg-[#5F1717] text-white font-medium shadow-sm"
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

            {variantModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
                        if (event.target === event.currentTarget) {
                            closeVariantModal();
                        }
                    }}
                >
                    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-900">
                                    {editingVariantIndex === null
                                        ? 'Add Variant'
                                        : 'Edit Variant'}
                                </h2>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                    Input size, color, stock, price, and image file.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeVariantModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-5">
                            <FieldRow cols={2}>
                                <FieldGroup label="Variant SKU" required>
                                    <Input
                                        value={variantDraft.sku}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                sku: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. GMS-001-S"
                                        className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Size">
                                    <Input
                                        value={variantDraft.size}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                size: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. S, M, L, XL"
                                        className="h-9 border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                            </FieldRow>

                            <FieldRow cols={2}>
                                <FieldGroup label="Color Name">
                                    <Input
                                        value={variantDraft.color_name}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                color_name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Black"
                                        className="h-9 border-zinc-200 text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Color Hex">
                                    <div className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 shadow-sm focus-within:border-[#7F2020] focus-within:ring-1 focus-within:ring-[#7F2020]">
                                        <input
                                            type="color"
                                            value={
                                                variantDraft.color_hex ||
                                                '#000000'
                                            }
                                            onChange={(e) =>
                                                setVariantDraft({
                                                    ...variantDraft,
                                                    color_hex: e.target.value,
                                                })
                                            }
                                            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                                        />
                                        <input
                                            type="text"
                                            value={
                                                variantDraft.color_hex ||
                                                '#000000'
                                            }
                                            onChange={(e) =>
                                                setVariantDraft({
                                                    ...variantDraft,
                                                    color_hex: e.target.value,
                                                })
                                            }
                                            className="h-full flex-1 border-0 bg-transparent p-0 font-mono text-sm text-zinc-700 focus:ring-0"
                                        />
                                    </div>
                                </FieldGroup>
                            </FieldRow>

                            <FieldRow cols={3}>
                                <FieldGroup label="Price Addition">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variantDraft.additional_price}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                additional_price:
                                                    e.target.value,
                                            })
                                        }
                                        className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Stock">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variantDraft.stock}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                stock: e.target.value,
                                            })
                                        }
                                        className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                                <FieldGroup label="Reserved">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={variantDraft.reserved_stock}
                                        onChange={(e) =>
                                            setVariantDraft({
                                                ...variantDraft,
                                                reserved_stock:
                                                    e.target.value,
                                            })
                                        }
                                        className="h-9 border-zinc-200 font-mono text-sm focus:border-[#7F2020] focus:ring-[#7F2020]"
                                    />
                                </FieldGroup>
                            </FieldRow>

                            <FieldGroup
                                label="Variant Image"
                                hint="Stored in Laravel public storage. JPG, PNG, WEBP up to 4MB."
                            >
                                <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                                        {variantDraftPreview ? (
                                            <img
                                                src={variantDraftPreview}
                                                alt="Variant preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0] ??
                                                    null;

                                                if (
                                                    variantDraftPreview?.startsWith(
                                                        'blob:',
                                                    )
                                                ) {
                                                    URL.revokeObjectURL(
                                                        variantDraftPreview,
                                                    );
                                                }

                                                setVariantDraft({
                                                    ...variantDraft,
                                                    image: file,
                                                });
                                                setVariantDraftPreview(
                                                    file
                                                        ? URL.createObjectURL(
                                                              file,
                                                          )
                                                        : variantDraft.image_url ||
                                                              null,
                                                );
                                            }}
                                            className="h-9 border-zinc-200 bg-white text-sm file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:text-zinc-700 hover:file:bg-zinc-200"
                                        />
                                        {variantDraft.image_url && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        variantDraftPreview?.startsWith(
                                                            'blob:',
                                                        )
                                                    ) {
                                                        URL.revokeObjectURL(
                                                            variantDraftPreview,
                                                        );
                                                    }

                                                    setVariantDraft({
                                                        ...variantDraft,
                                                        image: null,
                                                        image_url: '',
                                                    });
                                                    setVariantDraftPreview(null);
                                                }}
                                                className="text-xs font-medium text-red-500 hover:text-red-600"
                                            >
                                                Remove current image
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </FieldGroup>

                            <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                                <Label className="cursor-pointer text-xs font-medium text-zinc-700">
                                    Active Variant
                                </Label>
                                <Switch
                                    checked={variantDraft.is_active}
                                    onCheckedChange={(value) =>
                                        setVariantDraft({
                                            ...variantDraft,
                                            is_active: value,
                                        })
                                    }
                                    className="scale-90 data-[state=checked]:bg-[#7F2020]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeVariantModal}
                                className="h-9 border-zinc-200 px-4 text-xs text-zinc-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={saveVariantDraft}
                                className="h-9 bg-[#7F2020] px-5 text-xs font-medium text-white hover:bg-[#5F1717]"
                            >
                                {editingVariantIndex === null
                                    ? 'Add Variant'
                                    : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
