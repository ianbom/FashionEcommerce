import { Head, Link, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    Minus,
    Plus,
    ShoppingBag,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { addProductVariantToCart as addProductVariantToCartRoute } from '@/actions/App/Http/Controllers/Customer/CartController';
import ShopLayout from '@/layouts/shop-layout';
import { checkout, detail, list } from '@/routes';

type Variant = {
    id: number;
    sku: string | null;
    color_name: string | null;
    color_hex: string | null;
    size: string | null;
    additional_price: number;
    stock: number;
    reserved_stock: number;
    available_stock: number;
    image_url: string | null;
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
    category_slug: string | null;
    collection: string | null;
    collection_slug: string | null;
    colors: Array<{
        name: string | null;
        hex: string;
    }>;
    sizes: string[];
    available_stock: number;
};

type ProductDetail = ProductCard & {
    short_description: string | null;
    description: string | null;
    material: string | null;
    care_instruction: string | null;
    weight: number | null;
    dimensions: {
        length: number | null;
        width: number | null;
        height: number | null;
    };
    images: Array<{
        url: string;
        alt: string;
    }>;
    variants: Variant[];
};

type Props = {
    product: ProductDetail;
    relatedProducts: ProductCard[];
    recentProducts: ProductCard[];
};

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

const uniqueValues = (values: Array<string | null>) =>
    Array.from(new Set(values.filter(Boolean))) as string[];

export default function DetailProduct({
    product,
    relatedProducts,
    recentProducts,
}: Props) {
    return (
        <DetailProductContent
            key={product.id}
            product={product}
            relatedProducts={relatedProducts}
            recentProducts={recentProducts}
        />
    );
}

function DetailProductContent({
    product,
    relatedProducts,
    recentProducts,
}: Props) {
    const variants = useMemo(
        () =>
            [...product.variants].sort((left, right) => {
                const leftAvailable = left.available_stock > 0 ? 1 : 0;
                const rightAvailable = right.available_stock > 0 ? 1 : 0;

                if (leftAvailable !== rightAvailable) {
                    return rightAvailable - leftAvailable;
                }

                return left.id - right.id;
            }),
        [product.variants],
    );
    const gallery = useMemo(() => {
        const images = product.images.length > 0 ? product.images : [];

        if (images.length > 0) {
            return images;
        }

        return [
            {
                url: product.image ?? fallbackImages[0],
                alt: product.title,
            },
        ];
    }, [product]);

    const colors = useMemo(
        () =>
            variants
                .filter((variant) => variant.color_name || variant.color_hex)
                .filter(
                    (variant, index, variants) =>
                        variants.findIndex(
                            (candidate) =>
                                candidate.color_name === variant.color_name &&
                                candidate.color_hex === variant.color_hex,
                        ) === index,
                ),
        [variants],
    );
    const initialVariant = useMemo(
        () =>
            variants.find((variant) => variant.available_stock > 0) ??
            variants[0],
        [variants],
    );
    const [mainImage, setMainImage] = useState(
        gallery[0]?.url ?? fallbackImages[0],
    );
    const [selectedVariantId, setSelectedVariantId] = useState(
        initialVariant?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);
    const cartForm = useForm<{
        quantity: number;
        product_variant_id?: number;
    }>({
        quantity: 1,
    });

    const selectedVariant = useMemo(
        () =>
            variants.find((variant) => variant.id === selectedVariantId) ??
            initialVariant,
        [initialVariant, selectedVariantId, variants],
    );
    const selectedColor = selectedVariant?.color_name ?? '';
    const selectedSize = selectedVariant?.size ?? '';
    const sizes = useMemo(
        () =>
            uniqueValues(
                variants
                    .filter(
                        (variant) =>
                            selectedColor === '' ||
                            variant.color_name === selectedColor,
                    )
                    .map((variant) => variant.size),
            ),
        [selectedColor, variants],
    );

    const currentPrice =
        (product.sale_price ?? product.price) +
        (selectedVariant?.additional_price ?? 0);
    const basePrice = product.price + (selectedVariant?.additional_price ?? 0);
    const maxQuantity = Math.max(
        1,
        selectedVariant?.available_stock ?? product.available_stock,
    );
    const isAvailable =
        product.available_stock > 0 &&
        (selectedVariant?.available_stock ?? product.available_stock) > 0;
    const productDescription = product.description || product.short_description;
    const checkoutHref = checkout.url({
        query: {
            product: product.slug,
            variant: selectedVariant?.id,
            quantity,
        },
    });

    const decreaseQuantity = () =>
        setQuantity((current) => Math.max(1, current - 1));
    const increaseQuantity = () =>
        setQuantity((current) => Math.min(maxQuantity, current + 1));
    const addProductVariantToCart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedVariant || !isAvailable || cartForm.processing) {
            return;
        }

        cartForm.submit(addProductVariantToCartRoute(selectedVariant.id), {
            preserveScroll: true,
        });
    };

    useEffect(() => {
        setSelectedVariantId(initialVariant?.id ?? null);
    }, [initialVariant?.id, product.id]);

    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity));
    }, [maxQuantity]);

    useEffect(() => {
        cartForm.setData('quantity', quantity);
    }, [quantity]);

    useEffect(() => {
        if (!selectedVariant) {
            return;
        }

        const nextImage =
            selectedVariant.image_url ??
            gallery.find((image) => image.url === mainImage)?.url ??
            gallery[0]?.url ??
            fallbackImages[0];

        setMainImage(nextImage);
    }, [gallery, selectedVariant?.id]);

    return (
        <ShopLayout>
            <Head title={`${product.title} - Aurea Syari`} />

            <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-10 md:py-10">
                <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-secondary-foreground">
                    <Link
                        href={list.url()}
                        className="transition hover:text-primary"
                    >
                        Products
                    </Link>
                    <ChevronRight size={13} />
                    {product.category && (
                        <>
                            <Link
                                href={list.url({
                                    query: { category: product.category_slug },
                                })}
                                className="transition hover:text-primary"
                            >
                                {product.category}
                            </Link>
                            <ChevronRight size={13} />
                        </>
                    )}
                    <span className="font-semibold text-foreground">
                        {product.title}
                    </span>
                </div>

                <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-16">
                    <div className="w-full lg:col-span-6">
                        <div className="group relative mb-3 aspect-[3/4] cursor-zoom-in overflow-hidden rounded-sm bg-muted">
                            <img
                                src={mainImage}
                                alt={product.title}
                                className="h-full w-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-[1.03]"
                                decoding="async"
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-5 gap-3">
                            {gallery.map((image, index) => (
                                <button
                                    key={`${image.url}-${index}`}
                                    type="button"
                                    onClick={() => setMainImage(image.url)}
                                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-sm transition-all ${
                                        mainImage === image.url
                                            ? 'border border-primary opacity-100'
                                            : 'border border-transparent opacity-60 hover:opacity-100 hover:shadow-md'
                                    }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    {mainImage === image.url && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <span className="h-2 w-2 rounded-full bg-white shadow" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full max-w-full pl-0 lg:col-span-6 lg:max-w-[600px] lg:pl-4">
                        <div className="mb-5 flex flex-wrap gap-2">
                            <span className="rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold tracking-wider text-secondary-foreground uppercase">
                                {isAvailable ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {product.badge && (
                                <span className="rounded-sm bg-primary px-2 py-1 text-[10px] font-semibold tracking-wider text-primary-foreground uppercase">
                                    {product.badge}
                                </span>
                            )}
                            {product.collection && (
                                <span className="rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold tracking-wider text-secondary-foreground uppercase">
                                    {product.collection}
                                </span>
                            )}
                        </div>

                        <div className="mb-6">
                            <h1 className="mb-3 text-xl font-semibold tracking-wide text-foreground">
                                {product.title}
                            </h1>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold tracking-wide text-secondary-foreground">
                                        {formatPrice(currentPrice)}
                                    </span>
                                    {product.sale_price !== null && (
                                        <span className="text-[12px] text-muted-foreground line-through">
                                            {formatPrice(basePrice)}
                                        </span>
                                    )}
                                </div>
                                <Heart
                                    size={20}
                                    className="cursor-pointer text-gray-400 transition-colors hover:scale-110 hover:text-primary active:scale-95"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <div className="mb-8 flex cursor-pointer items-center justify-between rounded-md border border-border bg-secondary/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <ShoppingBag size={18} strokeWidth={1.7} />
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[11px] font-semibold tracking-wide text-foreground">
                                        Complete your order with secure checkout
                                    </p>
                                    <p className="text-[10px] tracking-wide text-muted-foreground">
                                        Select variant and quantity before
                                        buying
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                size={16}
                                className="text-muted-foreground"
                            />
                        </div>

                        {colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 text-[11px] font-semibold tracking-wide text-foreground">
                                    Color
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {colors.map((variant) => {
                                        const variantImage =
                                            variant.image_url ??
                                            product.image ??
                                            gallery[0]?.url ??
                                            fallbackImages[0];
                                        const isSelected =
                                            selectedColor ===
                                            (variant.color_name ?? '');

                                        return (
                                            <button
                                                key={`${variant.color_name}-${variant.color_hex}`}
                                                type="button"
                                                onClick={() => {
                                                    const nextVariant =
                                                        variants.find(
                                                            (candidate) =>
                                                                candidate.color_name ===
                                                                    (variant.color_name ??
                                                                        '') &&
                                                                candidate.size ===
                                                                    selectedSize,
                                                        ) ??
                                                        variants.find(
                                                            (candidate) =>
                                                                candidate.color_name ===
                                                                (variant.color_name ??
                                                                    ''),
                                                        ) ??
                                                        initialVariant;

                                                    setSelectedVariantId(
                                                        nextVariant?.id ?? null,
                                                    );
                                                    setMainImage(variantImage);
                                                }}
                                                className="group flex cursor-pointer flex-col items-center transition-transform hover:-translate-y-1"
                                            >
                                                <span
                                                    className={`mb-2 h-[65px] w-[50px] overflow-hidden rounded-sm border p-0.5 transition-all ${
                                                        isSelected
                                                            ? 'border-primary'
                                                            : 'border-transparent group-hover:border-border'
                                                    }`}
                                                >
                                                    <img
                                                        src={variantImage}
                                                        className="h-full w-full rounded-sm object-cover"
                                                        alt={
                                                            variant.color_name ??
                                                            product.title
                                                        }
                                                    />
                                                </span>
                                                <span
                                                    className={`text-[9px] font-medium ${
                                                        isSelected
                                                            ? 'text-primary'
                                                            : 'text-muted-foreground group-hover:text-primary'
                                                    }`}
                                                >
                                                    {variant.color_name ??
                                                        variant.color_hex ??
                                                        'Color'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {sizes.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-[11px] font-semibold tracking-wide text-foreground">
                                        Size
                                    </h3>
                                    <Link
                                        href={list.url()}
                                        className="group flex items-center text-accent transition-colors hover:text-primary"
                                    >
                                        <span className="text-[10px] font-medium tracking-wide">
                                            Size Guide
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className="ml-1 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                const nextVariant =
                                                    variants.find(
                                                        (variant) =>
                                                            variant.size ===
                                                                size &&
                                                            variant.color_name ===
                                                                selectedColor,
                                                    ) ??
                                                    variants.find(
                                                        (variant) =>
                                                            variant.size ===
                                                            size,
                                                    ) ??
                                                    initialVariant;

                                                setSelectedVariantId(
                                                    nextVariant?.id ?? null,
                                                );
                                            }}
                                            className={`rounded-md border px-7 py-2.5 text-[11px] font-semibold tracking-wide transition-all ${
                                                selectedSize === size
                                                    ? 'border-primary text-primary shadow-sm hover:bg-secondary'
                                                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-10">
                            <div className="mb-6 flex w-max items-center rounded-md border border-border bg-card shadow-sm">
                                <button
                                    type="button"
                                    onClick={decreaseQuantity}
                                    className="flex h-9 w-10 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <Minus size={14} strokeWidth={2} />
                                </button>
                                <span className="w-10 text-center text-[12px] font-semibold text-foreground">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={increaseQuantity}
                                    className="flex h-9 w-10 items-center justify-center rounded-r-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                                >
                                    <Plus size={14} strokeWidth={2} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <form onSubmit={addProductVariantToCart}>
                                    <button
                                        type="submit"
                                        disabled={
                                            !isAvailable ||
                                            !selectedVariant ||
                                            cartForm.processing
                                        }
                                        className={`w-full rounded-full border border-input py-3.5 text-center text-[11px] font-bold tracking-widest text-secondary-foreground transition-all active:scale-[0.99] ${
                                            isAvailable &&
                                            selectedVariant &&
                                            !cartForm.processing
                                                ? 'hover:bg-secondary hover:shadow-md'
                                                : 'cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {cartForm.processing
                                            ? 'Adding...'
                                            : 'Add to Cart'}
                                    </button>
                                    {(cartForm.errors.quantity ||
                                        cartForm.errors.product_variant_id) && (
                                        <p className="mt-2 text-center text-[11px] font-medium text-destructive">
                                            {cartForm.errors.quantity ||
                                                cartForm.errors
                                                    .product_variant_id}
                                        </p>
                                    )}
                                </form>
                                <Link
                                    href={checkoutHref}
                                    className={`w-full rounded-full bg-primary py-3.5 text-center text-[11px] font-bold tracking-widest text-primary-foreground transition-all active:scale-[0.99] ${
                                        isAvailable
                                            ? 'hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20'
                                            : 'pointer-events-none opacity-50'
                                    }`}
                                >
                                    Buy It Now
                                </Link>
                            </div>
                        </div>

                        <div className="mb-8 space-y-5 border-t border-border pt-8 text-[11px] leading-[1.9] font-medium tracking-wide text-secondary-foreground">
                            {productDescription ? (
                                productDescription
                                    .split(/\r?\n/)
                                    .map((paragraph, index) => (
                                        <p key={`${paragraph}-${index}`}>
                                            {paragraph}
                                        </p>
                                    ))
                            ) : (
                                <p>
                                    {product.title} is crafted for modest
                                    everyday styling with refined details and
                                    comfortable wear.
                                </p>
                            )}

                            <div className="space-y-1">
                                {product.material && (
                                    <p>
                                        <span className="font-bold text-foreground">
                                            Material:
                                        </span>{' '}
                                        {product.material}
                                    </p>
                                )}
                                {product.care_instruction && (
                                    <p>
                                        <span className="font-bold text-foreground">
                                            Care:
                                        </span>{' '}
                                        {product.care_instruction}
                                    </p>
                                )}
                                {product.weight !== null && (
                                    <p>
                                        <span className="font-bold text-foreground">
                                            Weight:
                                        </span>{' '}
                                        {product.weight} gram
                                    </p>
                                )}
                            </div>
                        </div>

                        <button className="flex w-full items-center justify-center rounded-full border border-input py-3.5 text-[11px] font-bold tracking-wide text-secondary-foreground transition-colors hover:bg-secondary hover:shadow-sm active:scale-[0.99]">
                            <MessageCircle
                                size={16}
                                className="mr-2"
                                strokeWidth={2}
                            />{' '}
                            Message Support
                        </button>
                    </div>
                </div>

                <ProductRail
                    title="You Might Also Like"
                    products={relatedProducts}
                />
                <ProductRail
                    title="Recent Viewed"
                    products={recentProducts}
                    compact
                />
            </main>
        </ShopLayout>
    );
}

function ProductRail({
    title,
    products,
    compact = false,
}: {
    title: string;
    products: ProductCard[];
    compact?: boolean;
}) {
    if (products.length === 0) {
        return null;
    }

    return (
        <div className={compact ? 'mt-20' : 'mt-28'}>
            <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-[13px] font-bold tracking-wider text-foreground">
                    {title}
                </h2>
                {!compact && (
                    <div className="flex gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-6">
                {products.map((product, index) => (
                    <Link
                        href={detail.url({ query: { product: product.slug } })}
                        key={product.id}
                        className="group flex max-w-[170px] min-w-[170px] cursor-pointer flex-col transition-transform duration-300 hover:-translate-y-1"
                    >
                        <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-sm bg-muted shadow-sm transition-shadow group-hover:shadow-md">
                            <img
                                src={
                                    product.image ??
                                    fallbackImages[
                                        index % fallbackImages.length
                                    ]
                                }
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                alt={product.title}
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                            <div className="absolute right-2 bottom-2 rounded-full bg-card/90 p-2 text-foreground shadow transition-all hover:scale-110 hover:bg-card">
                                <ShoppingBag size={14} strokeWidth={2} />
                            </div>
                        </div>
                        <h3 className="mb-1.5 line-clamp-2 text-[11px] leading-[1.4] font-bold tracking-wide text-foreground transition-colors group-hover:text-primary">
                            {product.title}
                        </h3>
                        <p className="mt-auto text-[11px] font-medium text-secondary-foreground">
                            {formatPrice(product.sale_price ?? product.price)}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
