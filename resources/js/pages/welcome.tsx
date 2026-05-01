import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
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

type JournalPost = {
    id: number;
    title: string;
    slug: string;
    type: string;
    date: string | null;
};

type Props = {
    heroBanner: BannerCard;
    promoBanner: BannerCard;
    hajjSeries: ProductCard[];
    wePresent: ProductCard[];
    recentAdditions: ProductCard[];
    mostLoved: ProductCard[];
    journalPosts: JournalPost[];
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
    heroBanner,
    promoBanner,
    hajjSeries,
    wePresent,
    recentAdditions,
    mostLoved,
    journalPosts,
}: Props) {
    return (
        <ShopLayout>
            <Head title="Home - Aurea Syari" />

            <section className="group relative h-[60vh] w-full overflow-hidden md:h-[85vh]">
                <img
                    src={bannerImage(
                        heroBanner,
                        '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp',
                    )}
                    alt={heroBanner?.title ?? 'Aurea Syari'}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-primary-foreground">
                    <h1 className="mb-2 text-4xl leading-none font-bold tracking-tight drop-shadow-lg sm:text-5xl md:mb-4 md:text-7xl lg:text-[100px]">
                        {heroBanner?.title ?? (
                            <>
                                NOW <br /> LAUNCHING
                            </>
                        )}
                    </h1>
                    <div className="animate-fade-in-up mt-2 md:mt-4">
                        <h2 className="mb-1 font-serif text-3xl tracking-wide text-muted italic sm:text-4xl md:mb-2 md:text-6xl">
                            {heroBanner?.subtitle ?? 'Moov'}
                        </h2>
                        <Link
                            href={heroBanner?.button_url ?? list.url()}
                            className="text-[8px] font-medium tracking-[0.2em] uppercase drop-shadow-md transition hover:text-white/80 sm:text-[10px] md:text-xs"
                        >
                            {heroBanner?.button_text ?? 'sport & athleisure'}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1500px] px-4 py-12 md:px-10 md:py-20">
                <SectionTitle
                    title="Itsar Hajj Series 2026"
                    subtitle="Now Served Warmly, Wrapped With Love"
                />

                <div className="flex flex-col items-center gap-6 md:gap-8 lg:flex-row">
                    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-sm lg:w-[45%]">
                        <img
                            src={productImage(hajjSeries[0], 8)}
                            alt={hajjSeries[0]?.name ?? 'Hajj Series Lifestyle'}
                            className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                    </div>

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
                    title="We Present to You..."
                    subtitle="More Love. A Special Addition, Exclusively For You"
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
                        title="Recent Addition"
                        subtitle="Your Beloved Essentials, Now in Colors"
                    />

                    <div className="relative">
                        <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-4 md:pb-0 lg:grid-cols-6">
                            {recentAdditions.map((item, index) => (
                                <Link
                                    href={detail.url({
                                        query: { product: item.slug },
                                    })}
                                    key={item.id}
                                    className="group flex min-w-[40%] snap-start flex-col text-center sm:min-w-[30%] md:min-w-0"
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
                                                        color.name ?? color.hex
                                                    }
                                                />
                                            ))}
                                    </div>
                                </Link>
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

            <section className="mx-auto mb-10 max-w-[1500px] px-4 py-10 md:mb-20 md:px-10">
                <div className="mb-6 md:mb-8">
                    <h2 className="text-lg font-bold tracking-wider text-primary md:text-xl">
                        Our Journal
                    </h2>
                </div>

                <div className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-6 md:pb-0 lg:grid-cols-4">
                    {journalPosts.map((post, index) => (
                        <article
                            key={post.id}
                            className="group flex min-w-[75%] cursor-pointer snap-start flex-col sm:min-w-[45%] md:min-w-0"
                        >
                            <div className="relative mb-3 aspect-video overflow-hidden rounded-sm md:mb-4">
                                <img
                                    src={
                                        fallbackImages[
                                            (index + 5) % fallbackImages.length
                                        ]
                                    }
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-between px-1">
                                <div>
                                    <p className="mb-1.5 text-[9px] tracking-wider text-muted-foreground uppercase md:mb-2 md:text-[10px]">
                                        {post.date ?? post.type}
                                    </p>
                                    <h3 className="mb-3 line-clamp-3 text-[11px] leading-relaxed font-semibold transition-colors group-hover:text-primary md:mb-4 md:text-xs">
                                        {post.title}
                                    </h3>
                                </div>
                                <div className="mt-auto">
                                    <span className="rounded-full border border-border px-3 py-1 text-[9px] font-bold tracking-wider uppercase transition-colors group-hover:border-foreground md:px-4 md:py-1.5 md:text-[10px]">
                                        Continue Reading
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

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
        <Link
            href={detail.url({ query: { product: product.slug } })}
            className={`group flex cursor-pointer flex-col ${centered ? 'min-w-[45%] text-center sm:min-w-[30%]' : ''} ${
                wide ? 'min-w-[65%] sm:min-w-[45%]' : ''
            } snap-start md:min-w-0`}
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
                    <Heart className="text-white drop-shadow-md" size={20} />
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
    );
}
