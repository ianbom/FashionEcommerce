import { Head } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

// --- DATA DUMMY --- //
const hajjSeries = [
    { id: 1, name: 'Adwa Prayer Set', price: 'Rp 455.000', label: 'NEW', image: '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp' },
    { id: 2, name: 'Safa Basic Gamis', price: 'Rp 325.000', label: '', image: '/img/ainur-iman-qcNmigFPTQM-unsplash.webp' },
    { id: 3, name: 'Tariq Khimar', price: 'Rp 145.000', label: 'RESTOCK', image: '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp' },
];

const wePresent = [
    { id: 1, name: 'Tunik Qaysaa - Nude', price: 'Rp 265.000', label: '10%', image: '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp' },
    { id: 2, name: 'Abaya Fatima - Brown', price: 'Rp 450.000', label: '15%', image: '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp' },
    { id: 3, name: 'Khimar Aisha - Grey', price: 'Rp 185.000', label: '20%', image: '/img/khaled-ghareeb-n84s3jgzhKk-unsplash.webp' },
    { id: 4, name: 'Setelan Rayya - Blue', price: 'Rp 385.000', label: '5%', image: '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp' },
    { id: 5, name: 'Gamis Maryam - Purple', price: 'Rp 420.000', label: '10%', image: '/img/mina-rad-2O2cXJemDmo-unsplash.webp' },
];

const recentAdditions = [
    { id: 1, name: 'Sport Ortega Skirt - Olive', price: 'Rp 255.000', image: '/img/monody-le-7YrRbgOPibw-unsplash.webp' },
    { id: 2, name: 'Lova Active Tunic - Sand', price: 'Rp 285.000', image: '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp' },
    { id: 3, name: 'Daily Sport Khimar - Navy', price: 'Rp 165.000', image: '/img/sajimon-sahadevan-AWC94dVpTPc-unsplash.webp' },
    { id: 4, name: 'Airy Jogger Pants - Black', price: 'Rp 210.000', image: '/img/sarah-khan-R7p66Oj8ZOQ-unsplash.webpp' },
    { id: 5, name: 'Moov Jacket - Blue', price: 'Rp 345.000', image: '/img/shedrack-salami-DRjeesi2kFM-unsplash.webp' },
    { id: 6, name: 'Basic Sport Hijab - White', price: 'Rp 125.000', image: '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp' },
];

const mostLoved = [
    { id: 1, name: 'Daily Khimar Emerald', price: 'Rp 155.000', label: 'RESTOCK', image: '/img/ainur-iman-qcNmigFPTQM-unsplash.webp' },
    { id: 2, name: 'Basic Abaya Maroon', price: 'Rp 375.000', label: '', image: '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp' },
    { id: 3, name: 'Signature Silk Scarves', price: 'Rp 225.000', label: 'PRE ORDER', image: '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp' },
    { id: 4, name: 'Pleated Skirt Nude', price: 'Rp 295.000', label: '', image: '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp' },
];

const journalPosts = [
    { id: 1, title: 'Your Spark : Elegance Woven into Every Moment "The Identity"', date: 'Mar 15, 2026', image: '/img/khaled-ghareeb-n84s3jgzhKk-unsplash.webp' },
    { id: 2, title: 'Your Spark: The Journey of Grace and Heritage - From Indonesia to Paris', date: 'Mar 10, 2026', image: '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp' },
    { id: 3, title: 'Hajj & Umrah: Every Corner of Your Home is a Field of Rewards', date: 'Feb 28, 2026', image: '/img/mina-rad-2O2cXJemDmo-unsplash.webp' },
    { id: 4, title: 'Urban Modesty: A Collaboration between Itsar x Rumah Ayu', date: 'Feb 15, 2026', image: '/img/monody-le-7YrRbgOPibw-unsplash.webp' },
];

export default function Home() {
    return (
        <ShopLayout>
            <Head title="Home - Webcare" />

            {/* HERO SECTION */}
            <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden group">
                <img
                    src="/img/omar-elsharawy-gFHBofW3ncQ-unsplash.webp"
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20"></div> {/* Overlay */}

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-primary-foreground px-4">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-bold tracking-tight leading-none mb-2 md:mb-4 drop-shadow-lg">
                        NOW <br /> LAUNCHING
                    </h1>
                    <div className="mt-2 md:mt-4 animate-fade-in-up">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif italic mb-1 md:mb-2 tracking-wide text-muted">Moov</h2>
                        <p className="text-[8px] sm:text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase drop-shadow-md">
                            sport & athleisure
                        </p>
                    </div>
                </div>
            </section>

            {/* ITSAR HAJJ SERIES 2026 */}
            <section className="py-12 md:py-20 px-4 md:px-10 max-w-[1500px] mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-3xl font-serif italic text-primary mb-2">Itsar Hajj Series 2026</h2>
                    <p className="text-[10px] md:text-xs tracking-[0.1em] text-muted-foreground uppercase">Now Served Warmly, Wrapped With Love</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center">
                    {/* Left Big Image */}
                    <div className="w-full lg:w-[45%] relative aspect-[4/3] overflow-hidden group rounded-sm">
                        <img
                            src="/img/sajimon-sahadevan-AWC94dVpTPc-unsplash.webp"
                            alt="Hajj Series Lifestyle"
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                        />
                    </div>

                    {/* Right Carousel/Grid */}
                    <div className="w-full lg:w-[55%] relative">
                        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
                            {hajjSeries.map(item => (
                                <div key={item.id} className="min-w-[45%] sm:min-w-[30%] md:min-w-0 snap-start flex flex-col group cursor-pointer">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3">
                                        {item.label && (
                                            <span className="absolute top-2 left-2 z-10 bg-background/90 px-2 py-1 text-[8px] font-bold tracking-widest uppercase">
                                                {item.label}
                                            </span>
                                        )}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Heart className="text-white drop-shadow-md" size={20} />
                                        </div>
                                    </div>
                                    <div className="text-center px-1">
                                        <h3 className="text-xs font-semibold mb-1 truncate">{item.name}</h3>
                                        <p className="text-[10px] md:text-xs text-muted-foreground mb-3">{item.price}</p>
                                        <button className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors">
                                            Buy
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Custom scrollbar styles for webkit */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .hide-scrollbar::-webkit-scrollbar { display: none; }
                            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                        `}} />
                    </div>
                </div>
            </section>

            {/* WE PRESENT TO YOU */}
            <section className="py-12 md:py-16 px-4 md:px-10 max-w-[1500px] mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-3xl font-serif italic text-primary mb-2">We Present to You...</h2>
                    <p className="text-[10px] md:text-xs tracking-[0.1em] text-muted-foreground uppercase">More Love. A Special Addition, Exclusively For You</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                    {wePresent.map(item => (
                        <div key={item.id} className="flex flex-col group cursor-pointer">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3">
                                {item.label && (
                                    <span className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground px-2 py-0.5 text-[8px] font-bold tracking-widest">
                                        {item.label}
                                    </span>
                                )}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="px-1">
                                <h3 className="text-[10px] md:text-xs font-semibold mb-1 truncate">{item.name}</h3>
                                <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">{item.price}</p>
                                <button className="w-full py-2 bg-primary text-primary-foreground text-[9px] md:text-[10px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors rounded-sm">
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* RECENT ADDITION */}
            <section className="py-12 md:py-16 px-4 md:px-10 bg-white">
                <div className="max-w-[1500px] mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-xl md:text-3xl font-serif italic text-primary mb-2">Recent Addition</h2>
                        <p className="text-[10px] md:text-xs tracking-[0.1em] text-muted-foreground uppercase">Your Beloved Essentials, Now in Colors</p>
                    </div>

                    <div className="relative">
                        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 md:gap-4 pb-4 md:grid md:grid-cols-3 lg:grid-cols-6 md:pb-0">
                            {recentAdditions.map(item => (
                                <div key={item.id} className="min-w-[40%] sm:min-w-[30%] md:min-w-0 snap-start flex flex-col group cursor-pointer text-center">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3 bg-background">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <h3 className="text-[9px] md:text-[10px] font-semibold mb-1 truncate px-1">{item.name}</h3>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground mb-2">{item.price}</p>
                                    <div className="flex justify-center space-x-1.5">
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#1e293b] border border-gray-200"></div>
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#991b1b] border border-gray-200"></div>
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#e2e8f0] border border-gray-200"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* MOST LOVED ESSENTIALS */}
            <section className="py-12 md:py-20 px-4 md:px-10 max-w-[1500px] mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-xl md:text-3xl font-serif italic text-primary mb-2">Most Loved Essentials</h2>
                    <p className="text-[10px] md:text-xs tracking-[0.1em] text-muted-foreground uppercase">Classics And Verified By Many, To Be Your Next Favorites</p>
                </div>

                <div className="relative">
                    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 w-full relative">
                        {mostLoved.map(item => (
                            <div key={item.id} className="min-w-[65%] sm:min-w-[45%] md:min-w-0 snap-start flex flex-col group cursor-pointer">
                                <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-3 md:mb-4">
                                    {item.label && (
                                        <span className="absolute top-2 left-2 z-10 bg-background text-secondary-foreground px-2 py-1 text-[8px] font-bold tracking-widest uppercase">
                                            {item.label}
                                        </span>
                                    )}
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart className="text-white drop-shadow-md" size={18} />
                                    </div>
                                </div>
                                <div className="px-1">
                                    <h3 className="text-[10px] md:text-xs font-semibold mb-1 truncate">{item.name}</h3>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mb-2 md:mb-3">{item.price}</p>
                                    <button className="w-full py-2.5 bg-primary text-primary-foreground text-[9px] md:text-[10px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors rounded-sm">
                                        Buy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BANNER SECTION */}
            <section className="w-full mt-6 md:mt-10 mb-12 md:mb-20 overflow-hidden relative h-[250px] md:h-[400px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/img/sarah-khan-R7p66Oj8ZOQ-unsplash.webp')" }}></div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <button className="px-5 py-2 md:px-6 md:py-2 border border-white text-white text-[9px] md:text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors backdrop-blur-sm rounded-sm">
                        Discover
                    </button>
                </div>
            </section>

            {/* OUR JOURNAL */}
            <section className="py-10 px-4 md:px-10 max-w-[1500px] mx-auto mb-10 md:mb-20">
                <div className="mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-primary tracking-wider">Our Journal</h2>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0">
                    {journalPosts.map(post => (
                        <div key={post.id} className="min-w-[75%] sm:min-w-[45%] md:min-w-0 snap-start flex flex-col group cursor-pointer">
                            <div className="relative aspect-[16/9] overflow-hidden rounded-sm mb-3 md:mb-4">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between px-1">
                                <div>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground mb-1.5 md:mb-2 uppercase tracking-wider">{post.date}</p>
                                    <h3 className="text-[11px] md:text-xs font-semibold mb-3 md:mb-4 leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
                                        {post.title}
                                    </h3>
                                </div>
                                <div className="mt-auto">
                                    <button className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider border border-border px-3 py-1 md:px-4 md:py-1.5 rounded-full hover:border-foreground transition-colors">
                                        Continue Reading
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </ShopLayout>
    );
}

