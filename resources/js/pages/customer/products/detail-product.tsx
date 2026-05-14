import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ChevronRight,
    Heart,
    MessageCircle,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { addProductVariantToCart as addProductVariantToCartRoute } from '@/actions/App/Http/Controllers/Customer/CartController';
import {
    destroyProduct as removeWishlistProduct,
    store as addWishlistItem,
} from '@/actions/App/Http/Controllers/Customer/WishlistController';
import HTMLConvert from '@/components/HTMLConvert';
import ShopLayout from '@/layouts/shop-layout';
import { cart, detail, list } from '@/routes';

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
    is_wishlisted: boolean;
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
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted);
    const [isWishlistProcessing, setIsWishlistProcessing] = useState(false);
    const [stockAlert, setStockAlert] = useState<string | null>(null);
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
    const availableStock =
        selectedVariant?.available_stock ?? product.available_stock;
    const maxQuantity = Math.max(1, availableStock);
    const isAvailable = product.available_stock > 0 && availableStock > 0;
    const productDescription = product.description || product.short_description;
    const normalizeCartError = (message?: string) => {
        if (!message) {
            return null;
        }

        const normalized = message.toLowerCase();

        if (
            normalized.includes('stok tersedia hanya') ||
            normalized.includes('stok tidak mencukupi') ||
            normalized.includes('insufficient stock')
        ) {
            return message.startsWith('Stok')
                ? message
                : 'Stok tidak mencukupi untuk jumlah yang dipilih.';
        }

        if (
            normalized.includes('belum tersedia untuk dibeli') ||
            normalized.includes('variant')
        ) {
            return 'Varian produk ini belum tersedia untuk dibeli.';
        }

        return message;
    };
    const validateCartAction = () => {
        if (!selectedVariant || !isAvailable) {
            setStockAlert('Varian produk ini belum tersedia untuk dibeli.');

            return false;
        }

        if (quantity > availableStock) {
            setStockAlert(`Stok tersedia hanya ${availableStock} pcs.`);

            return false;
        }

        setStockAlert(null);

        return true;
    };
    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
        setStockAlert(null);
    };
    const increaseQuantity = () => {
        setQuantity((current) => Math.min(maxQuantity, current + 1));

        if (quantity >= availableStock) {
            setStockAlert(`Stok tersedia hanya ${availableStock} pcs.`);
        } else {
            setStockAlert(null);
        }
    };
    const addProductVariantToCart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (cartForm.processing || !validateCartAction() || !selectedVariant) {
            return;
        }

        cartForm.submit(addProductVariantToCartRoute(selectedVariant.id), {
            preserveScroll: true,
            onError: () => {
                setStockAlert(
                    normalizeCartError(
                        cartForm.errors.quantity ||
                            cartForm.errors.product_variant_id,
                    ),
                );
            },
        });
    };
    const buyItNow = () => {
        if (cartForm.processing || !validateCartAction() || !selectedVariant) {
            return;
        }

        cartForm.submit(addProductVariantToCartRoute(selectedVariant.id), {
            preserveScroll: true,
            onSuccess: () => router.visit(cart.url()),
            onError: () => {
                setStockAlert(
                    normalizeCartError(
                        cartForm.errors.quantity ||
                            cartForm.errors.product_variant_id,
                    ),
                );
            },
        });
    };
    const toggleWishlist = () => {
        if (isWishlistProcessing) {
            return;
        }

        setIsWishlistProcessing(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => setIsWishlisted((current) => !current),
            onFinish: () => setIsWishlistProcessing(false),
        };

        if (isWishlisted) {
            router.delete(removeWishlistProduct.url(product.id), options);

            return;
        }

        router.post(addWishlistItem.url(product.id), {}, options);
    };

    useEffect(() => {
        setSelectedVariantId(initialVariant?.id ?? null);
        setIsWishlisted(product.is_wishlisted);
    }, [initialVariant?.id, product.id]);

    useEffect(() => {
        setQuantity((current) => Math.min(current, maxQuantity));
    }, [maxQuantity]);

    useEffect(() => {
        if (quantity <= availableStock) {
            setStockAlert(null);
        }
    }, [availableStock, quantity]);

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
                <FadeInOnScroll>
                    <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] tracking-wide text-secondary-foreground">
                        <Link
                            href={list.url()}
                            className="transition hover:text-primary"
                        >
                            Produk
                        </Link>
                        <ChevronRight size={13} />
                        {product.category && (
                            <>
                                <Link
                                    href={list.url({
                                        query: {
                                            category: product.category_slug,
                                        },
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
                </FadeInOnScroll>

                <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-16">
                    <FadeInOnScroll className="w-full lg:col-span-6">
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
                    </FadeInOnScroll>

                    <FadeInOnScroll
                        className="w-full max-w-full pl-0 lg:col-span-6 lg:max-w-[600px] lg:pl-4"
                        delay={120}
                    >
                        <div className="mb-5 flex flex-wrap gap-2">
                            <span className="rounded-sm border border-border bg-secondary px-2 py-1 text-[10px] font-semibold tracking-wider text-secondary-foreground uppercase">
                                {isAvailable ? 'Tersedia' : 'Habis'}
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
                                <button
                                    type="button"
                                    onClick={toggleWishlist}
                                    disabled={isWishlistProcessing}
                                    className="cursor-pointer text-gray-400 transition-colors hover:scale-110 hover:text-primary active:scale-95 disabled:cursor-default disabled:text-primary"
                                    aria-label={
                                        isWishlisted
                                            ? 'Hapus produk dari wishlist'
                                            : 'Tambah produk ke wishlist'
                                    }
                                >
                                    <Heart
                                        size={20}
                                        fill={
                                            isWishlisted
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                        strokeWidth={1.5}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 flex items-center justify-between rounded-md border border-border bg-secondary/70 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <ShoppingBag size={18} strokeWidth={1.7} />
                                </div>
                                <div>
                                    <p className="mb-0.5 text-[11px] font-semibold tracking-wide text-foreground">
                                        Lengkapi pesanan dengan checkout aman
                                    </p>
                                    <p className="text-[10px] tracking-wide text-muted-foreground">
                                        Pilih varian dan jumlah sebelum membeli
                                    </p>
                                </div>
                            </div>
                            <ShieldCheck
                                size={16}
                                className="text-muted-foreground"
                            />
                        </div>

                        {colors.length > 0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 text-[11px] font-semibold tracking-wide text-foreground">
                                    Warna
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
                                        const isColorOutOfStock =
                                            !variants.some(
                                                (candidate) =>
                                                    candidate.color_name ===
                                                        variant.color_name &&
                                                    candidate.available_stock >
                                                        0,
                                            );

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
                                                            : isColorOutOfStock
                                                              ? 'border-dashed border-border'
                                                              : 'border-transparent group-hover:border-border'
                                                    }`}
                                                >
                                                    <img
                                                        src={variantImage}
                                                        className={`h-full w-full rounded-sm object-cover ${
                                                            isColorOutOfStock
                                                                ? 'opacity-55 grayscale-[45%]'
                                                                : ''
                                                        }`}
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
                                                            : isColorOutOfStock
                                                              ? 'text-muted-foreground/60'
                                                              : 'text-muted-foreground group-hover:text-primary'
                                                    }`}
                                                >
                                                    {variant.color_name ??
                                                        variant.color_hex ??
                                                        'Warna'}
                                                </span>
                                                {isColorOutOfStock && (
                                                    <span className="mt-1 rounded-full border border-border px-1.5 py-0.5 text-[8px] font-semibold tracking-wider text-muted-foreground uppercase">
                                                        Habis
                                                    </span>
                                                )}
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
                                        Ukuran
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="group flex items-center text-accent transition-colors hover:text-primary"
                                    >
                                        <span className="text-[10px] font-medium tracking-wide">
                                            Panduan Ukuran
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className="ml-1 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {sizes.map((size) => {
                                        const sizeVariant =
                                            variants.find(
                                                (variant) =>
                                                    variant.size === size &&
                                                    variant.color_name ===
                                                        selectedColor,
                                            ) ??
                                            variants.find(
                                                (variant) =>
                                                    variant.size === size,
                                            );
                                        const isSizeOutOfStock =
                                            (sizeVariant?.available_stock ??
                                                0) <= 0;

                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVariantId(
                                                        sizeVariant?.id ??
                                                            initialVariant?.id ??
                                                            null,
                                                    );
                                                }}
                                                className={`rounded-md border px-7 py-2.5 text-[11px] font-semibold tracking-wide transition-all ${
                                                    selectedSize === size
                                                        ? 'border-primary text-primary shadow-sm hover:bg-secondary'
                                                        : isSizeOutOfStock
                                                          ? 'border-dashed border-border bg-muted/30 text-muted-foreground/60 hover:border-primary/60 hover:text-primary'
                                                          : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                <span>{size}</span>
                                                {isSizeOutOfStock && (
                                                    <span className="ml-2 text-[9px] font-semibold tracking-wider uppercase">
                                                        Habis
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-10">
                            <div className="mb-2 flex w-max items-center rounded-md border border-border bg-card shadow-sm">
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
                                    disabled={
                                        !isAvailable ||
                                        quantity >= availableStock
                                    }
                                    className="flex h-9 w-10 items-center justify-center rounded-r-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus size={14} strokeWidth={2} />
                                </button>
                            </div>
                            <p className="mb-6 text-[11px] text-muted-foreground">
                                Stok tersedia: {Math.max(0, availableStock)} pcs
                            </p>

                            <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
                                <form
                                    onSubmit={addProductVariantToCart}
                                    className="min-w-0"
                                >
                                    <button
                                        type="submit"
                                        disabled={
                                            !isAvailable ||
                                            !selectedVariant ||
                                            cartForm.processing
                                        }
                                        className={`flex min-h-12 w-full items-center justify-center rounded-full border border-input px-3 py-3.5 text-center text-[10px] font-bold tracking-widest text-secondary-foreground uppercase transition-all active:scale-[0.99] sm:text-[11px] ${
                                            isAvailable &&
                                            selectedVariant &&
                                            !cartForm.processing
                                                ? 'hover:bg-secondary hover:shadow-md'
                                                : 'cursor-not-allowed opacity-50'
                                        }`}
                                    >
                                        {cartForm.processing
                                            ? 'Menambahkan...'
                                            : 'Tambah ke Keranjang'}
                                    </button>
                                </form>
                                <button
                                    type="button"
                                    onClick={buyItNow}
                                    disabled={
                                        !isAvailable ||
                                        !selectedVariant ||
                                        cartForm.processing
                                    }
                                    className={`flex min-h-12 w-full min-w-0 items-center justify-center rounded-full bg-primary px-3 py-3.5 text-center text-[10px] font-bold tracking-widest text-primary-foreground uppercase transition-all active:scale-[0.99] sm:text-[11px] ${
                                        isAvailable &&
                                        selectedVariant &&
                                        !cartForm.processing
                                            ? 'hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20'
                                            : 'cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    {cartForm.processing
                                        ? 'Menambahkan...'
                                        : 'Beli Sekarang'}
                                </button>
                            </div>

                            {(stockAlert ||
                                cartForm.errors.quantity ||
                                cartForm.errors.product_variant_id) && (
                                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-[11px] font-medium text-red-700">
                                    <AlertCircle
                                        size={16}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <span>
                                        {stockAlert ||
                                            normalizeCartError(
                                                cartForm.errors.quantity ||
                                                    cartForm.errors
                                                        .product_variant_id,
                                            )}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mb-8 space-y-5 border-t border-border pt-8 text-[11px] leading-[1.9] font-medium tracking-wide text-secondary-foreground">
                            {productDescription ? (
                                <HTMLConvert html={productDescription} />
                            ) : (
                                <p>
                                    {product.title} dirancang untuk menemani
                                    gaya modest sehari-hari dengan detail yang
                                    rapi dan nyaman dipakai.
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
                                            Perawatan:
                                        </span>{' '}
                                        {product.care_instruction}
                                    </p>
                                )}
                                {product.weight !== null && (
                                    <p>
                                        <span className="font-bold text-foreground">
                                            Berat:
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
                            Hubungi Dukungan
                        </button>
                    </FadeInOnScroll>
                </div>

                <ProductRail
                    title="Mungkin Kamu Suka"
                    products={relatedProducts}
                />
                <ProductRail
                    title="Baru Dilihat"
                    products={recentProducts}
                    compact
                />
            </main>

            {isSizeGuideOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Size guide"
                    onClick={() => setIsSizeGuideOpen(false)}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-sm bg-background shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.24em] text-foreground uppercase">
                                    Panduan Ukuran
                                </p>
                                <p className="mt-1 text-[10px] tracking-wide text-muted-foreground">
                                    Gunakan panduan ukuran sebelum memilih size.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSizeGuideOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                                aria-label="Tutup panduan ukuran"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="max-h-[calc(90vh-74px)] overflow-auto bg-muted/30 p-3">
                            <img
                                src="/size-guide.webp"
                                alt="Size guide"
                                className="mx-auto h-auto w-full max-w-full rounded-sm object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}

function FadeInOnScroll({
    children,
    className = '',
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
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
        <FadeInOnScroll className={compact ? 'mt-20' : 'mt-28'}>
            <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-[13px] font-bold tracking-wider text-foreground">
                    {title}
                </h2>
            </div>
            <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-6">
                {products.map((product, index) => (
                    <FadeInOnScroll
                        key={product.id}
                        className="max-w-[170px] min-w-[170px]"
                        delay={index * 60}
                    >
                        <Link
                            href={detail.url({
                                query: { product: product.slug },
                            })}
                            className="group flex cursor-pointer flex-col transition-transform duration-300 hover:-translate-y-1"
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
                                {formatPrice(
                                    product.sale_price ?? product.price,
                                )}
                            </p>
                        </Link>
                    </FadeInOnScroll>
                ))}
            </div>
        </FadeInOnScroll>
    );
}
