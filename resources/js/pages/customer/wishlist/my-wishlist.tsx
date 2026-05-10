import { Link, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { destroy as removeWishlistItem } from '@/actions/App/Http/Controllers/Customer/WishlistController';
import ProfileLayout from '@/layouts/profile-layout';
import { detail, list } from '@/routes';

type WishlistItem = {
    id: number;
    slug: string;
    title: string;
    category: string | null;
    price: number;
    sale_price: number | null;
    image: string | null;
    badge: string | null;
    colors: Array<{
        name: string;
        hex: string;
    }>;
    available_stock: number;
    is_available: boolean;
};

type WishlistSummary = {
    item_count: number;
};

type Props = {
    wishlistItems: WishlistItem[];
    summary: WishlistSummary;
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

export default function MyWishlist({ wishlistItems, summary }: Props) {
    return (
        <ProfileLayout
            title="Wishlist Saya"
            pageTitle="Wishlist Saya"
            subtitle="Simpan item favoritmu sebelum kehabisan."
            activePath="wishlist"
            breadcrumbs={[
                { label: 'Beranda', href: '/' },
                { label: 'Akun Saya', href: '/my-profile' },
                { label: 'Wishlist Saya' },
            ]}
        >
            <div className="min-w-0">
                <div className="mb-6 flex items-end justify-between border-b border-[#EADBD8] pb-4">
                    <div>
                        <p className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-[#8A6B62] uppercase">
                            Item Tersimpan
                        </p>
                        <h2 className="text-[17px] font-medium tracking-wide text-[#332b26]">
                            Koleksi Wishlist
                        </h2>
                    </div>

                    <div className="text-right text-[11px] font-semibold tracking-[0.18em] text-[#8A6B62] uppercase">
                        {summary.item_count} produk tersimpan
                    </div>
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-10 xl:grid-cols-4">
                        {wishlistItems.map((item, index) => (
                            <WishlistTile
                                key={item.id}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md px-6 text-center">
                        <p className="text-sm font-semibold text-[#332b26]">
                            Wishlist masih kosong
                        </p>
                        <p className="mt-2 max-w-sm text-[12px] leading-6 text-[#8A6B62]">
                            Simpan produk favorit dari katalog agar mudah
                            ditemukan kembali.
                        </p>
                        <Link
                            href={list.url()}
                            className="mt-5 rounded-full bg-[#4A2525] px-5 py-2 text-[11px] font-semibold tracking-wider text-white uppercase transition hover:bg-[#B6574B]"
                        >
                            Lihat Produk
                        </Link>
                    </div>
                )}
            </div>
        </ProfileLayout>
    );
}

function FadeInOnScroll({
    children,
    delay = 0,
}: {
    children: ReactNode;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

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
            className={`h-full transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
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

function WishlistTile({ item, index }: { item: WishlistItem; index: number }) {
    const productHref = detail.url({ query: { product: item.slug } });

    const removeItem = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        router.delete(removeWishlistItem.url(item.id), {
            preserveScroll: true,
        });
    };

    return (
        <FadeInOnScroll delay={(index % 12) * 60}>
            <Link
                href={productHref}
                className="group flex h-full cursor-pointer flex-col"
            >
                <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-sm bg-[#F8EDED]">
                    <img
                        src={
                            item.image ??
                            fallbackImages[index % fallbackImages.length]
                        }
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

                    {item.badge && (
                        <div className="absolute top-2 left-2 rounded-sm bg-[#4A2525] px-2 py-1 text-[8px] font-medium tracking-widest text-white uppercase shadow-sm">
                            {item.badge}
                        </div>
                    )}
                    <button
                        type="button"
                        aria-label="Hapus dari wishlist"
                        onClick={removeItem}
                        className="absolute right-2 bottom-2 text-white/90 drop-shadow-md transition-all duration-300 hover:scale-110 hover:text-white"
                    >
                        <Heart
                            size={18}
                            fill="currentColor"
                            strokeWidth={1.5}
                        />
                    </button>
                </div>

                {item.colors.length > 0 && (
                    <div className="mb-2 flex space-x-1.5">
                        {item.colors.map((color) => (
                            <div
                                key={color.hex}
                                className="h-[12px] w-[12px] rounded-full border border-gray-200/60 shadow-sm"
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                )}

                <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#8A6B62] uppercase">
                    {item.category}
                </p>
                <h3 className="mb-1 text-[11px] leading-[1.4] font-semibold text-[#332b26] transition-colors hover:text-[#B6574B]">
                    {item.title}
                </h3>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-[#8A6B62]">
                    <span>{formatPrice(item.sale_price ?? item.price)}</span>
                    {item.sale_price !== null && (
                        <span className="text-[#C4BDB1] line-through">
                            {formatPrice(item.price)}
                        </span>
                    )}
                </div>
            </Link>
        </FadeInOnScroll>
    );
}
