import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Box,
    Heart,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    removeCartItem,
    updateCartItemQuantity,
} from '@/actions/App/Http/Controllers/Customer/CartController';
import ShopLayout from '@/layouts/shop-layout';
import { checkout, detail, list } from '@/routes';

type CartItem = {
    id: number;
    product_id: number | null;
    product_slug: string | null;
    title: string;
    color: string | null;
    color_hex: string | null;
    size: string | null;
    image: string | null;
    price: number;
    quantity: number;
    available_stock: number;
    is_available: boolean;
    variant: {
        id: number | null;
        sku: string | null;
    };
    subtotal: number;
};

type CartSummary = {
    item_count: number;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
};

type SuggestedProduct = {
    id: number;
    slug: string;
    title: string;
    price: number;
    image: string | null;
    available_stock: number;
};

type PageProps = {
    cartItems: CartItem[];
    summary: CartSummary;
    suggestedProducts: SuggestedProduct[];
};

const fallbackImages = [
    '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp',
    '/img/ainur-iman-qcNmigFPTQM-unsplash.webp',
    '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp',
    '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp',
    '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp',
];

const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(price)
        .replace('Rp', 'Rp ');

export default function MyCart({
    cartItems,
    summary,
    suggestedProducts,
}: PageProps) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [processingItemId, setProcessingItemId] = useState<number | null>(
        null,
    );
    const [processingAction, setProcessingAction] = useState<
        'update' | 'remove' | null
    >(null);

    const isEmpty = cartItems.length === 0;
    const errorMessage =
        errors.quantity || errors.cart_item || errors.product_variant_id;
    const checkoutHref = useMemo(() => checkout.url(), []);

    const updateQuantity = (item: CartItem, nextQuantity: number) => {
        if (
            processingItemId !== null ||
            nextQuantity < 1 ||
            nextQuantity === item.quantity ||
            nextQuantity > Math.max(1, item.available_stock)
        ) {
            return;
        }

        setProcessingItemId(item.id);
        setProcessingAction('update');

        router.patch(
            updateCartItemQuantity(item.id),
            { quantity: nextQuantity },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setProcessingItemId(null);
                    setProcessingAction(null);
                },
            },
        );
    };

    const removeItem = (item: CartItem) => {
        if (processingItemId !== null) {
            return;
        }

        setProcessingItemId(item.id);
        setProcessingAction('remove');

        router.delete(removeCartItem(item.id), {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setProcessingItemId(null);
                setProcessingAction(null);
            },
        });
    };

    return (
        <ShopLayout>
            <Head title="My Cart - Aurea Syari" />

            <main className="mx-auto min-h-screen max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
                <div className="mb-6 flex items-center space-x-2 text-[10px] font-medium tracking-wide text-[#8A6B62] md:mb-8 md:text-xs">
                    <Link
                        href="/"
                        className="transition-colors hover:text-black"
                    >
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-[#333333]">My Cart</span>
                </div>

                {!isEmpty ? (
                    <>
                        <div className="mb-8 md:mb-10">
                            <h1 className="mb-2 font-serif text-3xl text-[#4A2525] italic md:text-4xl">
                                My Cart
                            </h1>
                            <p className="text-xs text-[#8A6B62] md:text-sm">
                                Review your selected items before checkout.
                            </p>
                            {errorMessage && (
                                <div className="mt-4 rounded-xl border border-[#E7C9C9] bg-[#FFF6F6] px-4 py-3 text-[12px] font-medium text-[#B24B4B]">
                                    {errorMessage}
                                </div>
                            )}
                        </div>

                        <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-10">
                            <div className="flex-1 space-y-4 md:space-y-6">
                                {cartItems.map((item, index) => {
                                    const isUpdating =
                                        processingItemId === item.id &&
                                        processingAction === 'update';
                                    const isRemoving =
                                        processingItemId === item.id &&
                                        processingAction === 'remove';
                                    const itemDisabled =
                                        isUpdating || isRemoving;
                                    const productHref = item.product_slug
                                        ? detail.url({
                                              query: {
                                                  product: item.product_slug,
                                              },
                                          })
                                        : undefined;
                                    const canIncrease =
                                        item.is_available &&
                                        item.quantity <
                                            Math.max(1, item.available_stock);

                                    return (
                                        <div
                                            key={item.id}
                                            className="group animate-fade-in-up relative border-b border-[#E5D8D2] py-6 last:border-b-0"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                            }}
                                        >
                                            <div className="flex items-stretch gap-4 sm:gap-6">
                                                {/* Image */}
                                                {productHref ? (
                                                    <Link
                                                        href={productHref}
                                                        className="relative h-[110px] w-[85px] flex-shrink-0 overflow-hidden rounded-2xl bg-[#F8EDED] sm:h-[140px] sm:w-[110px] shadow-inner"
                                                    >
                                                        <img
                                                            src={
                                                                item.image ??
                                                                fallbackImages[
                                                                    index %
                                                                        fallbackImages.length
                                                                ]
                                                            }
                                                            alt={item.title}
                                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                    </Link>
                                                ) : (
                                                    <div className="relative h-[110px] w-[85px] flex-shrink-0 overflow-hidden rounded-2xl bg-[#F8EDED] sm:h-[140px] sm:w-[110px] shadow-inner">
                                                        <img
                                                            src={
                                                                item.image ??
                                                                fallbackImages[
                                                                    index %
                                                                        fallbackImages.length
                                                                ]
                                                            }
                                                            alt={item.title}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="flex flex-1 flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="pr-2">
                                                                {productHref ? (
                                                                    <Link
                                                                        href={productHref}
                                                                        className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#332b26] transition-colors hover:text-black sm:text-base font-serif"
                                                                    >
                                                                        {item.title}
                                                                    </Link>
                                                                ) : (
                                                                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#332b26] sm:text-base font-serif">
                                                                        {item.title}
                                                                    </h3>
                                                                )}
                                                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-[#8A6B62] sm:mt-2 sm:text-xs">
                                                                    {item.color && (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <span 
                                                                                className="block h-2.5 w-2.5 rounded-full border border-gray-200/60 shadow-sm" 
                                                                                style={{ backgroundColor: item.color_hex || '#ccc' }} 
                                                                            />
                                                                            {item.color}
                                                                        </span>
                                                                    )}
                                                                    {item.size && (
                                                                        <span className="flex items-center gap-1.5">
                                                                            <span className="h-1 w-1 rounded-full bg-[#EADBD8]" />
                                                                            {item.size}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {!item.is_available && (
                                                                    <p className="mt-1.5 text-[10px] font-semibold text-[#B24B4B] sm:text-[11px]">
                                                                        Variant unavailable
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(item)}
                                                                disabled={itemDisabled}
                                                                className="flex-shrink-0 -mt-1 -mr-1 rounded-full p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:opacity-50 active:scale-90"
                                                                aria-label="Remove item"
                                                            >
                                                                <Trash2 size={16} strokeWidth={1.5} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-end justify-between sm:mt-auto">
                                                        <span className="text-[14px] font-bold text-[#4A3B32] sm:text-base tracking-tight">
                                                            {formatPrice(item.subtotal)}
                                                        </span>

                                                        <div className="flex items-center overflow-hidden rounded-full border border-[#F2EFEA] bg-[#FAF9F6] p-0.5 shadow-sm">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                disabled={itemDisabled || item.quantity <= 1}
                                                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B5E55] transition-colors hover:bg-white hover:text-black hover:shadow-sm disabled:bg-transparent disabled:opacity-40 disabled:shadow-none sm:h-8 sm:w-8"
                                                            >
                                                                <Minus size={12} strokeWidth={2.5} />
                                                            </button>
                                                            <span className="w-6 text-center text-[11px] font-bold text-[#4A3B32] sm:w-8 sm:text-xs">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                disabled={itemDisabled || !canIncrease}
                                                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B5E55] transition-colors hover:bg-white hover:text-black hover:shadow-sm disabled:bg-transparent disabled:opacity-40 disabled:shadow-none sm:h-8 sm:w-8"
                                                            >
                                                                <Plus size={12} strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="h-px w-full bg-[#E5D8D2] lg:hidden" />

                            <div className="hidden self-stretch lg:block lg:w-px lg:bg-[#E5D8D2]" />

                            <div className="w-full flex-shrink-0 lg:w-[380px]">
                                <div className="sticky top-24 lg:top-32">
                                    <h2 className="mb-6 font-serif text-xl text-[#333333] tracking-tight md:text-2xl">
                                        Order Summary
                                    </h2>

                                    <div className="mb-6 space-y-4 text-[13px] text-[#4A4A4A]">
                                        <div className="flex items-center justify-between">
                                            <span>
                                                Items ({summary.item_count})
                                            </span>
                                            <span className="font-semibold text-[#333333]">
                                                {formatPrice(summary.subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Shipping estimate</span>
                                            <span className="font-semibold text-[#333333]">
                                                {formatPrice(summary.shipping)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[#C05D5D]">
                                            <span>Discount</span>
                                            <span className="font-semibold">
                                                -{' '}
                                                {formatPrice(summary.discount)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#EADBD8] pt-5 pb-6">
                                        <div className="flex items-end justify-between">
                                            <span className="text-sm font-semibold text-[#333333]">
                                                Total
                                            </span>
                                            <span className="font-serif text-2xl text-[#333333]">
                                                {formatPrice(summary.total)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-6 rounded-lg border border-[#EADBD8] bg-[#FAF9F6] px-4 py-3 text-[12px] text-[#8A6B62]">
                                        Voucher discount can be applied on
                                        checkout after selecting shipping.
                                    </div>

                                    <div className="space-y-4">
                                        <Link
                                            href={checkoutHref}
                                            className="block w-full rounded-lg bg-[#4A2525] py-4 text-center text-[13px] font-bold tracking-wider text-white transition-all hover:bg-[#5F1717] hover:shadow-lg hover:shadow-[#4A2525]/20 active:scale-[0.98]"
                                        >
                                            Proceed to Checkout
                                        </Link>
                                        <div className="text-center">
                                            <Link
                                                href={list.url()}
                                                className="inline-block text-[12px] font-medium text-[#8A6B62] underline underline-offset-4 transition-colors hover:text-black"
                                            >
                                                Continue Shopping
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-4 border-t border-[#EADBD8]/60 pt-6">
                                        <div className="flex items-start space-x-3 text-[11px] text-[#8A6B62]">
                                            <ShieldCheck
                                                size={16}
                                                className="mt-0.5 flex-shrink-0 text-[#C99A8F]"
                                                strokeWidth={1.5}
                                            />
                                            <p>
                                                Secure payment powered by
                                                Midtrans
                                            </p>
                                        </div>
                                        <div className="flex items-start space-x-3 text-[11px] text-[#8A6B62]">
                                            <Box
                                                size={16}
                                                className="mt-0.5 flex-shrink-0 text-[#C99A8F]"
                                                strokeWidth={1.5}
                                            />
                                            <p>
                                                Shipping calculated using
                                                Biteship at checkout
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="pb-safe fixed right-0 bottom-0 left-0 z-40 flex translate-y-0 items-center justify-between bg-[#4A2525] p-4 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-transform lg:hidden">
                            <div>
                                <p className="mb-0.5 text-[10px] font-medium text-white/60">
                                    Total
                                </p>
                                <p className="font-serif text-lg">
                                    {formatPrice(summary.total)}
                                </p>
                            </div>
                            <Link
                                href={checkoutHref}
                                className="rounded-md bg-[#F1E6E2] px-6 py-3 text-xs font-bold tracking-wide text-[#4A2525] transition-colors hover:bg-white active:scale-95"
                            >
                                Checkout ({summary.item_count})
                            </Link>
                        </div> */}
                    </>
                ) : (
                    <div className="animate-fade-in-up flex flex-col items-center justify-center py-20 md:py-32">
                        <div className="relative mb-8 w-40 text-[#EADBD8] drop-shadow-xl md:w-48">
                            <svg
                                viewBox="0 0 200 200"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-full w-full"
                            >
                                <path
                                    d="M50 80L40 180H160L150 80H50Z"
                                    fill="#F1E6E2"
                                    stroke="#C4BDB1"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M75 80V50C75 36.1929 86.1929 25 100 25C113.807 25 125 36.1929 125 50V80"
                                    stroke="#C4BDB1"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M45 150L60 90C65 70 80 60 100 60C120 60 135 70 140 90L155 150"
                                    stroke="white"
                                    strokeOpacity="0.5"
                                    strokeWidth="1"
                                />
                                <path
                                    d="M160 40C160 40 165 42 165 47C165 42 170 40 170 40C170 40 165 38 165 33C165 38 160 40 160 40Z"
                                    fill="#C4BDB1"
                                />
                            </svg>
                        </div>
                        <h2 className="mb-4 font-serif text-3xl text-[#4A2525] italic md:text-4xl">
                            Your cart is empty
                        </h2>
                        <p className="mb-10 max-w-sm text-center text-sm text-[#8A6B62] md:text-base">
                            Looks like you haven&apos;t added anything to your
                            cart yet.
                        </p>
                        <Link
                            href={list.url()}
                            className="rounded-lg bg-[#4A2525] px-8 py-4 text-sm font-bold tracking-wider text-white transition-all hover:-translate-y-1 hover:bg-[#5F1717] hover:shadow-xl active:translate-y-0"
                        >
                            Explore Collection
                        </Link>
                    </div>
                )}

                {!isEmpty && suggestedProducts.length > 0 && (
                    <div className="mt-20 mb-10 md:mt-32 lg:mb-20">
                        <h2 className="relative mb-8 inline-block font-serif text-xl text-[#333333] md:text-2xl">
                            You May Also Like
                            <span className="absolute bottom-[-8px] left-0 h-px w-1/2 bg-[#C4BDB1]" />
                        </h2>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                            {suggestedProducts.map((product, idx) => (
                                <Link
                                    href={detail.url({
                                        query: { product: product.slug },
                                    })}
                                    key={product.id}
                                    className="group animate-fade-in-up flex cursor-pointer flex-col"
                                    style={{
                                        animationDelay: `${(idx + cartItems.length) * 100}ms`,
                                    }}
                                >
                                    <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-[#F8EDED] shadow-sm transition-all duration-500 hover:shadow-lg">
                                        <img
                                            src={
                                                product.image ??
                                                fallbackImages[
                                                    idx % fallbackImages.length
                                                ]
                                            }
                                            alt={product.title}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
                                    </div>
                                    <h3 className="mb-1 truncate text-[12px] font-semibold text-[#333333] transition-colors group-hover:text-black md:text-sm">
                                        {product.title}
                                    </h3>
                                    <p className="mb-4 text-[11px] font-medium text-[#8A6B62] md:text-xs">
                                        {formatPrice(product.price)}
                                    </p>
                                    <span className="flex w-full items-center justify-center rounded-md border border-[#EADBD8] bg-[#FAF9F6] py-2.5 text-[10px] font-bold tracking-wider text-[#4A4A4A] transition-all group-hover:shadow-md hover:border-[#4A2525] hover:bg-[#4A2525] hover:text-white md:py-3 md:text-[11px]">
                                        <ShoppingBag
                                            size={14}
                                            className="mr-2"
                                            strokeWidth={2}
                                        />
                                        View Product
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </ShopLayout>
    );
}
