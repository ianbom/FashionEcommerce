import { Head, Link } from '@inertiajs/react';
import { Clock, Heart, RotateCcw, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import ShopLayout from '@/layouts/shop-layout';
import { detail, list } from '@/routes';

type ProductCard = {
    id: number;
    slug: string;
    name: string;
    price: number;
    sale_price: number | null;
    label: string | null;
    image: string | null;
    category: string | null;
    collection: string | null;
    colors: Array<{
        name: string | null;
        hex: string;
    }>;
};

type BannerCard = {
    id: number;
    title: string;
    subtitle: string | null;
    image_desktop_url: string;
    image_mobile_url: string | null;
    button_text: string | null;
    button_url: string | null;
} | null;

type CategoryCard = {
    name: string;
    slug: string;
    image_url: string | null;
};

type Props = {
    heroBanners: BannerCard[];
    promoBanner: BannerCard;
    categories: CategoryCard[];
    hajjSeries: ProductCard[];
    wePresent: ProductCard[];
    recentAdditions: ProductCard[];
    mostLoved: ProductCard[];
};

const fallbackImages = [
    '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp',
    '/img/ainur-iman-qcNmigFPTQM-unsplash.webp',
    '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp',
    '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp',
    '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp',
    '/img/khaled-ghareeb-n84s3jgzhKk-unsplash.webp',
    '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp',
    '/img/mina-rad-2O2cXJemDmo-unsplash.webp',
    '/img/monody-le-7YrRbgOPibw-unsplash.webp',
    '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp',
];

const formatPrice = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const productImage = (product: ProductCard | undefined, index: number) =>
    product?.image ?? fallbackImages[index % fallbackImages.length];
const bannerImage = (banner: BannerCard, fallback: string) =>
    banner?.image_desktop_url ?? fallback;

export default function Home({
    heroBanners,
    promoBanner,
    categories,
    hajjSeries,
    wePresent,
    recentAdditions,
    mostLoved,
}: Props) {
    return (
        <ShopLayout>
            <Head title="Beranda - Aurea Syari" />

            <FadeInOnScroll>
                <HeroSlider heroBanners={heroBanners} />
            </FadeInOnScroll>

            {/* Feature Strip */}
            <div className="flex w-full flex-col items-center justify-between border-b border-[#e6d5c8] bg-[#fcfbf9] px-4 py-3.5 text-[10px] font-medium text-[#53362d] md:flex-row md:px-10 md:text-xs">
                <div className="mb-2 flex w-full items-center justify-center gap-4 md:mb-0 md:w-auto md:gap-10">
                    <div className="flex items-center gap-2">
                        <Clock size={16} strokeWidth={1.5} />
                        <span>Dikirim dalam 24 Jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star size={16} strokeWidth={1.5} />
                        <span>Brand Publik Figur, Harga Menghibur</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RotateCcw size={16} strokeWidth={1.5} />
                        <span>Produk Original *</span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <Link href="#" className="hover:underline">
                        Butuh Bantuan? Chat dengan kami
                    </Link>
                </div>
            </div>

            {/* Category Section */}
            <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-10 md:py-16">
                <FadeInOnScroll>
                    <div className="mb-8 text-center md:mb-12">
                        <h2 className="font-serif text-2xl tracking-wider text-[#53362d] uppercase md:text-3xl">
                            Kategori
                        </h2>
                    </div>
                </FadeInOnScroll>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {categories?.map((category, index) => (
                        <FadeInOnScroll key={index} delay={index * 100}>
                            <Link
                                href={`/list?category=${encodeURIComponent(category.slug)}`}
                                className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gray-100"
                            >
                                <img
                                    src={
                                        category.image_url ??
                                        fallbackImages[
                                            index % fallbackImages.length
                                        ]
                                    }
                                    alt={category.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/40" />
                                <span className="relative z-10 font-serif text-lg tracking-wide text-white drop-shadow-md md:text-xl">
                                    {category.name}
                                </span>
                            </Link>
                        </FadeInOnScroll>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-10 md:py-20">
                <SectionTitle
                    title="Seri Haji Itsar 2026"
                    subtitle="Kini Hadir Hangat, Terbungkus Cinta"
                />

                <div className="flex flex-col items-center gap-6 md:gap-8 lg:flex-row">
                    <FadeInOnScroll className="w-full lg:w-[45%]">
                        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-sm">
                            <img
                                src={productImage(hajjSeries[0], 8)}
                                alt={
                                    hajjSeries[0]?.name ?? 'Lifestyle Seri Haji'
                                }
                                className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                            />
                        </div>
                    </FadeInOnScroll>

                    <div className="relative w-full lg:w-[55%]">
                        <div className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
                            {hajjSeries.map((item, index) => (
                                <ProductTile
                                    key={item.id}
                                    product={item}
                                    index={index}
                                    centered
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-10 md:py-16">
                <SectionTitle
                    title="Kami Hadirkan Untukmu..."
                    subtitle="Lebih Banyak Cinta. Tambahan Spesial, Eksklusif Untukmu"
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
                    {wePresent.map((item, index) => (
                        <ProductTile
                            key={item.id}
                            product={item}
                            index={index}
                            button
                        />
                    ))}
                </div>
            </section>

            <section className="bg-white px-4 py-12 md:px-10 md:py-16">
                <div className="mx-auto max-w-[1500px]">
                    <SectionTitle
                        title="Koleksi Terbaru"
                        subtitle="Essential Favoritmu, Kini Hadir dalam Beragam Warna"
                    />

                    <div className="relative">
                        <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-4 md:pb-0 lg:grid-cols-6">
                            {recentAdditions.map((item, index) => (
                                <FadeInOnScroll
                                    key={item.id}
                                    className="min-w-[40%] snap-start sm:min-w-[30%] md:min-w-0"
                                    delay={index * 60}
                                >
                                    <Link
                                        href={detail.url({
                                            query: { product: item.slug },
                                        })}
                                        className="group flex flex-col text-center"
                                    >
                                        <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-sm bg-background">
                                            <img
                                                src={productImage(item, index)}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <h3 className="truncate px-1 text-[9px] font-semibold md:text-[10px]">
                                            {item.name}
                                        </h3>
                                        <p className="mb-2 text-[9px] text-muted-foreground md:text-[10px]">
                                            {formatPrice(
                                                item.sale_price ?? item.price,
                                            )}
                                        </p>
                                        <div className="flex justify-center gap-1.5">
                                            {item.colors
                                                .slice(0, 3)
                                                .map((color) => (
                                                    <span
                                                        key={color.hex}
                                                        className="h-2.5 w-2.5 rounded-full border border-gray-200 md:h-3 md:w-3"
                                                        style={{
                                                            backgroundColor:
                                                                color.hex,
                                                        }}
                                                        title={
                                                            color.name ??
                                                            color.hex
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    </Link>
                                </FadeInOnScroll>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-10 md:py-20">
                <SectionTitle
                    title="Most Loved Essentials"
                    subtitle="Classics And Verified By Many, To Be Your Next Favorites"
                />

                <div className="relative">
                    <div className="hide-scrollbar relative flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-4">
                        {mostLoved.map((item, index) => (
                            <ProductTile
                                key={item.id}
                                product={item}
                                index={index}
                                button
                                wide
                            />
                        ))}
                    </div>
                </div>
            </section>

            <FadeInOnScroll>
                <section className="relative mt-6 mb-12 h-[250px] w-full overflow-hidden md:mt-10 md:mb-20 md:h-[400px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${bannerImage(promoBanner, '/img/sarah-khan-R7p66Oj8ZOQ-unsplash.webp')}')`,
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Link
                            href={promoBanner?.button_url ?? list.url()}
                            className="rounded-sm border border-white px-5 py-2 text-[9px] font-bold tracking-widest text-white uppercase backdrop-blur-sm transition-colors hover:bg-white hover:text-black md:px-6 md:text-[10px]"
                        >
                            {promoBanner?.button_text ?? 'Discover'}
                        </Link>
                    </div>
                </section>
            </FadeInOnScroll>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `,
                }}
            />
        </ShopLayout>
    );
}

function HeroSlider({ heroBanners }: { heroBanners: BannerCard[] }) {
    const images =
        heroBanners && heroBanners.length > 0
            ? heroBanners.map((banner) =>
                  bannerImage(
                      banner,
                      '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp',
                  ),
              )
            : [
                  '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp',
                  '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp',
                  '/img/ainur-iman-qcNmigFPTQM-unsplash.webp',
              ];

    const sliderRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToSlide = (index: number) => {
        const slider = sliderRef.current;

        if (!slider) {
            return;
        }

        slider.scrollTo({
            behavior: 'smooth',
            left: slider.clientWidth * index,
        });
        setCurrentIndex(index);
    };

    const updateCurrentSlide = () => {
        const slider = sliderRef.current;

        if (!slider) {
            return;
        }

        setCurrentIndex(Math.round(slider.scrollLeft / slider.clientWidth));
    };

    const startDrag = (event: PointerEvent<HTMLDivElement>) => {
        const slider = sliderRef.current;

        if (!slider) {
            return;
        }

        isDraggingRef.current = true;
        dragStartXRef.current = event.clientX;
        dragScrollLeftRef.current = slider.scrollLeft;
        slider.setPointerCapture(event.pointerId);
    };

    const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
        const slider = sliderRef.current;

        if (!slider || !isDraggingRef.current) {
            return;
        }

        event.preventDefault();
        slider.scrollLeft =
            dragScrollLeftRef.current - (event.clientX - dragStartXRef.current);
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
        const slider = sliderRef.current;

        if (!slider || !isDraggingRef.current) {
            return;
        }

        isDraggingRef.current = false;
        slider.releasePointerCapture(event.pointerId);
        updateCurrentSlide();
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            goToSlide(nextIndex);
        }, 5000);

        return () => clearInterval(timer);
    }, [currentIndex, images.length]);

    return (
        <section className="relative h-[60vh] w-full overflow-hidden md:h-[85vh]">
            <div
                ref={sliderRef}
                onScroll={updateCurrentSlide}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={endDrag}
                className="hide-scrollbar flex h-full cursor-grab snap-x snap-mandatory overflow-x-auto scroll-smooth select-none active:cursor-grabbing"
            >
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="relative h-full min-w-full snap-start"
                    >
                        <img
                            src={img}
                            alt={`Hero Banner ${index + 1}`}
                            draggable={false}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                ))}
            </div>

            {/* Pagination Indicators */}
            <div className="absolute right-0 bottom-8 left-0 z-20 flex justify-center gap-3">
                {images.map((_, index) => (
                    <span
                        key={index}
                        className={`h-0.5 transition-all duration-300 ${
                            index === currentIndex
                                ? 'w-10 bg-white'
                                : 'w-6 bg-white/50'
                        }`}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </section>
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

function SectionTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-2 font-serif text-xl text-primary italic md:text-3xl">
                {title}
            </h2>
            <p className="text-[10px] tracking-[0.1em] text-muted-foreground uppercase md:text-xs">
                {subtitle}
            </p>
        </div>
    );
}

function ProductTile({
    product,
    index,
    button = false,
    centered = false,
    wide = false,
}: {
    product: ProductCard;
    index: number;
    button?: boolean;
    centered?: boolean;
    wide?: boolean;
}) {
    return (
        <FadeInOnScroll
            className={`${centered ? 'min-w-[45%] sm:min-w-[30%]' : ''} ${
                wide ? 'min-w-[65%] sm:min-w-[45%]' : ''
            } snap-start md:min-w-0`}
            delay={index * 60}
        >
            <Link
                href={detail.url({ query: { product: product.slug } })}
                className={`group flex cursor-pointer flex-col ${centered ? 'text-center' : ''}`}
            >
                <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-sm">
                    {product.label && (
                        <span
                            className={`absolute top-2 left-2 z-10 px-2 py-1 text-[8px] font-bold tracking-widest uppercase ${
                                product.label.includes('%')
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-background/90 text-secondary-foreground'
                            }`}
                        >
                            {product.label}
                        </span>
                    )}
                    <img
                        src={productImage(product, index)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100">
                        <Heart
                            className="text-white drop-shadow-md"
                            size={20}
                        />
                    </div>
                </div>
                <div className={centered ? 'px-1 text-center' : 'px-1'}>
                    <h3 className="mb-1 truncate text-[10px] font-semibold md:text-xs">
                        {product.name}
                    </h3>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground md:mb-3 md:text-xs">
                        <span>
                            {formatPrice(product.sale_price ?? product.price)}
                        </span>
                        {product.sale_price !== null && (
                            <span className="line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                    {button ? (
                        <span className="block w-full rounded-sm bg-primary py-2 text-center text-[9px] font-bold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90 md:text-[10px]">
                            Buy
                        </span>
                    ) : (
                        <span className="border-b border-foreground pb-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors hover:border-primary hover:text-primary md:text-[10px]">
                            Buy
                        </span>
                    )}
                </div>
            </Link>
        </FadeInOnScroll>
    );
}
