import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Heart,
    Search,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { detail, list } from '@/routes';

type FilterState = {
    search: string;
    category: string;
    collection: string;
    type: string;
    availability: string;
    price: string;
    color: string;
    size: string;
    sort: string;
    order: string;
    per_page: string;
};

type ProductCard = {
    id: number;
    slug: string;
    title: string;
    sku: string | null;
    price: number;
    sale_price: number | null;
    image: string | null;
    badge: string | null;
    category: string | null;
    collection: string | null;
    colors: Array<{
        name: string | null;
        hex: string;
    }>;
    sizes: string[];
    available_stock: number;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedProducts = {
    data: ProductCard[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

type FilterOption = {
    id?: number;
    name?: string | null;
    slug?: string;
    value?: string;
    label?: string;
    hex?: string;
};

type Props = {
    products: PaginatedProducts;
    filters: Omit<FilterState, 'per_page'> & {
        per_page: number;
    };
    options: {
        categories: FilterOption[];
        collections: FilterOption[];
        colors: FilterOption[];
        sizes: string[];
        priceRanges: Array<{ value: string; label: string }>;
        sorts: Array<{ value: string; label: string }>;
    };
};

const defaultFilters: FilterState = {
    search: '',
    category: '',
    collection: '',
    type: 'all',
    availability: 'all',
    price: 'all',
    color: '',
    size: '',
    sort: 'featured',
    order: 'desc',
    per_page: '12',
};

const typeOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'featured', label: 'Featured Products' },
    { value: 'new_arrival', label: 'New Arrival' },
    { value: 'best_seller', label: 'Best Seller' },
    { value: 'discount', label: 'Discount' },
];

const availabilityOptions = [
    { value: 'all', label: 'All' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

const fallbackImages = [
    '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp',
    '/img/ainur-iman-qcNmigFPTQM-unsplash.webp',
    '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp',
    '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp',
    '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp',
];

const formatPrice = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const cleanQuery = (filters: FilterState) =>
    Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
            if (value === '') {
                return false;
            }

            if (key === 'per_page') {
                return value !== defaultFilters.per_page;
            }

            return value !== defaultFilters[key as keyof FilterState];
        }),
    );

const paginationLabel = (label: string) => {
    if (label.includes('Previous')) {
        return <ChevronLeft size={14} />;
    }

    if (label.includes('Next')) {
        return <ChevronRight size={14} />;
    }

    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
};

export default function ListProduct({ products, filters, options }: Props) {
    const initialFilters = useMemo<FilterState>(
        () => ({
            ...filters,
            per_page: String(filters.per_page ?? defaultFilters.per_page),
        }),
        [filters],
    );
    const [form, setForm] = useState<FilterState>(initialFilters);

    const visit = (nextFilters: FilterState) => {
        setForm(nextFilters);
        router.get(list.url(), cleanQuery(nextFilters), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const setFilter = (key: keyof FilterState, value: string) => {
        visit({
            ...form,
            [key]: value,
        });
    };

    const resetFilters = () => {
        visit(defaultFilters);
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        visit(form);
    };

    const activeSummary = [
        filters.category,
        filters.collection,
        filters.type !== 'all' ? filters.type : '',
        filters.availability !== 'all' ? filters.availability : '',
        filters.price !== 'all' ? filters.price : '',
        filters.color,
        filters.size,
        filters.search,
    ].filter(Boolean).length;

    return (
        <ShopLayout>
            <Head title="Products - Aurea Syari" />

            <main className="mx-auto flex max-w-[1500px] flex-col px-4 py-6 md:px-10 md:py-10 lg:flex-row">
                <aside className="mb-8 w-full flex-shrink-0 pr-0 lg:mb-0 lg:w-64 lg:pr-10">
                    <form
                        onSubmit={submitSearch}
                        className="group relative mb-8"
                    >
                        <Search
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-foreground"
                            size={14}
                        />
                        <input
                            type="search"
                            value={form.search}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    search: event.target.value,
                                }))
                            }
                            placeholder="Search products"
                            className="w-full rounded-md border border-border bg-transparent py-2 pr-4 pl-9 text-[11px] tracking-wide transition-all focus:border-ring focus:ring-1 focus:ring-ring/20 focus:outline-none"
                        />
                    </form>

                    <div className="space-y-6 text-secondary-foreground">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold tracking-wide text-foreground">
                                Filters
                            </p>
                            {activeSummary > 0 && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-[10px] font-semibold tracking-wider text-primary uppercase transition hover:text-primary/75"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <FilterSection title="Categories">
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <FilterRadio
                                    label="All Categories"
                                    active={form.category === ''}
                                    onClick={() => setFilter('category', '')}
                                />
                                {options.categories.map((category) => (
                                    <FilterRadio
                                        key={category.id ?? category.slug}
                                        label={
                                            category.name ?? 'Untitled category'
                                        }
                                        active={form.category === category.slug}
                                        onClick={() =>
                                            setFilter(
                                                'category',
                                                category.slug ?? '',
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Collections">
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <FilterRadio
                                    label="All Collections"
                                    active={form.collection === ''}
                                    onClick={() => setFilter('collection', '')}
                                />
                                {options.collections.map((collection) => (
                                    <FilterRadio
                                        key={collection.id ?? collection.slug}
                                        label={
                                            collection.name ??
                                            'Untitled collection'
                                        }
                                        active={
                                            form.collection === collection.slug
                                        }
                                        onClick={() =>
                                            setFilter(
                                                'collection',
                                                collection.slug ?? '',
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Product Type">
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                {typeOptions.map((type) => (
                                    <FilterRadio
                                        key={type.value}
                                        label={type.label}
                                        active={form.type === type.value}
                                        onClick={() =>
                                            setFilter('type', type.value)
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Availability">
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                {availabilityOptions.map((availability) => (
                                    <FilterRadio
                                        key={availability.value}
                                        label={availability.label}
                                        active={
                                            form.availability ===
                                            availability.value
                                        }
                                        onClick={() =>
                                            setFilter(
                                                'availability',
                                                availability.value,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Price">
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <FilterRadio
                                    label="All Prices"
                                    active={form.price === 'all'}
                                    onClick={() => setFilter('price', 'all')}
                                />
                                {options.priceRanges.map((price) => (
                                    <FilterRadio
                                        key={price.value}
                                        label={price.label}
                                        active={form.price === price.value}
                                        onClick={() =>
                                            setFilter('price', price.value)
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Color">
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setFilter('color', '')}
                                    className={`h-5 w-5 rounded-full border bg-white shadow-sm transition ${
                                        form.color === ''
                                            ? 'border-primary ring-2 ring-primary/20'
                                            : 'border-gray-300 hover:scale-110'
                                    }`}
                                    aria-label="All colors"
                                />
                                {options.colors.map((color) => (
                                    <button
                                        key={color.hex ?? color.name ?? 'color'}
                                        type="button"
                                        onClick={() =>
                                            setFilter('color', color.hex ?? '')
                                        }
                                        className={`h-5 w-5 rounded-full border shadow-sm transition ${
                                            form.color === color.hex
                                                ? 'border-primary ring-2 ring-primary/25'
                                                : 'border-white/80 hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: color.hex }}
                                        aria-label={
                                            color.name ?? color.hex ?? 'Color'
                                        }
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        <FilterSection title="Size">
                            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-muted-foreground">
                                <button
                                    type="button"
                                    onClick={() => setFilter('size', '')}
                                    className={`flex h-7 min-w-9 items-center justify-center rounded border px-2 transition-colors ${
                                        form.size === ''
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-card/50 hover:border-secondary-foreground hover:text-secondary-foreground'
                                    }`}
                                >
                                    All
                                </button>
                                {options.sizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setFilter('size', size)}
                                        className={`flex h-7 min-w-9 items-center justify-center rounded border px-2 transition-colors ${
                                            form.size === size
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-input bg-card/50 hover:border-secondary-foreground hover:text-secondary-foreground'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-[17px] font-medium tracking-wide">
                                All Products
                            </h1>
                            <p className="mt-1 text-[11px] tracking-wide text-secondary-foreground">
                                {products.total > 0
                                    ? `Showing ${products.from}-${products.to} of ${products.total} products`
                                    : 'No products match your current filters'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary-foreground">
                            <label className="flex items-center gap-2">
                                <span>sort</span>
                                <select
                                    value={form.sort}
                                    onChange={(event) =>
                                        setFilter('sort', event.target.value)
                                    }
                                    className="rounded-md border border-border bg-background px-3 py-2 font-semibold text-foreground transition outline-none focus:border-ring"
                                >
                                    {options.sorts.map((sort) => (
                                        <option
                                            key={sort.value}
                                            value={sort.value}
                                        >
                                            {sort.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex items-center gap-2">
                                <span>order</span>
                                <select
                                    value={form.order}
                                    onChange={(event) =>
                                        setFilter('order', event.target.value)
                                    }
                                    className="rounded-md border border-border bg-background px-3 py-2 font-semibold text-foreground transition outline-none focus:border-ring"
                                >
                                    <option value="desc">Desc</option>
                                    <option value="asc">Asc</option>
                                </select>
                            </label>
                            <label className="flex items-center gap-2">
                                <span>show</span>
                                <select
                                    value={form.per_page}
                                    onChange={(event) =>
                                        setFilter(
                                            'per_page',
                                            event.target.value,
                                        )
                                    }
                                    className="rounded-md border border-border bg-background px-3 py-2 font-semibold text-foreground transition outline-none focus:border-ring"
                                >
                                    <option value="8">8</option>
                                    <option value="12">12</option>
                                    <option value="16">16</option>
                                    <option value="24">24</option>
                                    <option value="32">32</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    {products.data.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
                            {products.data.map((product, index) => (
                                <Link
                                    href={detail.url({
                                        query: { product: product.slug },
                                    })}
                                    key={product.id}
                                    className="group flex h-full cursor-pointer flex-col"
                                >
                                    <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                                        <img
                                            src={
                                                product.image ??
                                                fallbackImages[
                                                    index %
                                                        fallbackImages.length
                                                ]
                                            }
                                            alt={product.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

                                        {product.badge && (
                                            <div className="absolute top-2 left-2 rounded-sm bg-primary px-2 py-1 text-[8px] font-medium tracking-widest text-primary-foreground uppercase shadow-sm">
                                                {product.badge}
                                            </div>
                                        )}
                                        <div className="absolute right-2 bottom-2 text-white/90 drop-shadow-md transition-colors hover:scale-110 hover:text-white">
                                            <Heart
                                                size={18}
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>

                                    {product.colors.length > 0 && (
                                        <div className="mb-2 flex space-x-1.5">
                                            {product.colors.map((color) => (
                                                <div
                                                    key={color.hex}
                                                    className="h-[12px] w-[12px] rounded-full border border-gray-200/60 shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            color.hex,
                                                    }}
                                                    title={
                                                        color.name ?? color.hex
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="mb-1 text-[11px] leading-[1.4] font-semibold text-foreground transition-colors hover:text-primary">
                                        {product.title}
                                    </h3>

                                    <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-secondary-foreground">
                                        <span>
                                            {formatPrice(
                                                product.sale_price ??
                                                    product.price,
                                            )}
                                        </span>
                                        {product.sale_price !== null && (
                                            <span className="text-muted-foreground line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>

                                    <span className="mt-auto w-full rounded-full border border-input py-2 text-center text-[11px] font-semibold tracking-wider text-secondary-foreground shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95">
                                        {product.available_stock > 0
                                            ? 'Buy'
                                            : 'Sold Out'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-card/40 px-6 text-center">
                            <p className="text-sm font-semibold text-foreground">
                                No products found
                            </p>
                            <p className="mt-2 max-w-sm text-[12px] leading-6 text-secondary-foreground">
                                Try another keyword, choose a different filter,
                                or reset the collection view.
                            </p>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-5 rounded-full bg-primary px-5 py-2 text-[11px] font-semibold tracking-wider text-primary-foreground transition hover:bg-primary/90"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {products.last_page > 1 && (
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                            {products.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[11px] font-semibold transition ${
                                            link.active
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border bg-background text-secondary-foreground hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        {paginationLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="flex h-9 min-w-9 items-center justify-center rounded-full border border-border/60 px-3 text-[11px] text-muted-foreground/60"
                                    >
                                        {paginationLabel(link.label)}
                                    </span>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </main>
        </ShopLayout>
    );
}

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div>
            <div className="mb-4 flex cursor-pointer items-center justify-between text-[11px] font-semibold tracking-wide transition-colors hover:text-foreground">
                <span>{title}</span>
                <ChevronUp size={14} />
            </div>
            {children}
            <hr className="mt-6 border-border" />
        </div>
    );
}

function FilterRadio({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex w-full items-center justify-between gap-3 text-left transition-colors hover:text-foreground"
        >
            <span className="flex items-center gap-3">
                <span
                    className={`flex h-[14px] w-[14px] items-center justify-center rounded-full border transition-colors ${
                        active
                            ? 'border-secondary-foreground'
                            : 'border-input group-hover:border-secondary-foreground'
                    }`}
                >
                    {active && (
                        <span className="h-[6px] w-[6px] rounded-full bg-secondary-foreground" />
                    )}
                </span>
                <span>{label}</span>
            </span>
            <ChevronDown size={14} className="opacity-60" />
        </button>
    );
}
