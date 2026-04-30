import { Head } from '@inertiajs/react';
import { Heart, ChevronRight, ChevronLeft, Minus, Plus, MessageCircle, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import ShopLayout from '@/layouts/shop-layout';
const thumbnails = [
    "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg",
    "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg",
    "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg",
    "/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg",
    "/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg",
    "/img/khaled-ghareeb-n84s3jgzhKk-unsplash.jpg",
    "/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.jpg",
    "/img/mina-rad-2O2cXJemDmo-unsplash.jpg",
    "/img/monody-le-7YrRbgOPibw-unsplash.jpg",
    "/img/omar-elsharawy-gFHBofW3ncQ-unsplash.jpg"
];

const relatedProducts = [
    { title: "Athleisure Delik Tunic (LIMITED) - Moov 2026", price: "Rp 639.000", image: "/img/sajimon-sahadevan-AWC94dVpTPc-unsplash.jpg" },
    { title: "Kafah Khimar", price: "Rp 349.000", image: "/img/sarah-khan-R7p66Oj8ZOQ-unsplash.jpg" },
    { title: "Caspia Side Khimar (Simar) - Raya Edition", price: "Rp 389.000", image: "/img/shedrack-salami-DRjeesi2kFM-unsplash.jpg" },
    { title: "Hugo Jardin Men's Shirt - Jardin de Flores", price: "Rp 469.000", image: "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg" },
    { title: "Athleisure Adora Abaya - Moov 2026", price: "Rp 869.000", image: "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg" },
    { title: "Marrakech Jardin Abaya - Jardin de Flores", price: "Rp 1.099.000", image: "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg" },
    { title: "The Granada Jardin Set - Jardin de Flores", price: "Rp 1.349.000", image: "/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg" }
];

const recentProducts = [
    { title: "Sport Gemma Khimar - Moov 2026", price: "Rp 469.000", image: "/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg" }
];

export default function Detail() {
    const [mainImage, setMainImage] = useState(thumbnails[0]);

    return (
        <ShopLayout>
            <Head title="Sport Ortega Skirt Pants - Webcare" />


            {/* Main Content */}
            <main className="max-w-[1500px] mx-auto px-4 md:px-10 py-6 md:py-10">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* Left Column: Images */}
                    <div className="w-full lg:col-span-6">
                        <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-sm group cursor-zoom-in">
                            <img 
                                src={mainImage} 
                                alt="Main Product" 
                                className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-[1.03]"
                                decoding="async"
                            />
                            {/* Watermark/Logo on image */}
                            {/* <div className="absolute bottom-6 right-6 text-white/90 italic tracking-widest text-lg opacity-80 pointer-events-none drop-shadow-md">
                                I T S A R.
                            </div> */}
                        </div>
                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3 mt-3">
                            {thumbnails.map((thumb, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setMainImage(thumb)}
                                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-sm ${mainImage === thumb ? 'opacity-100 border border-black/10' : 'opacity-60 hover:opacity-100 hover:shadow-md transition-all'}`}
                                >
                                    <img src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                    {mainImage === thumb && (
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                            <div className="text-white">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full lg:col-span-6 pl-0 lg:pl-4 max-w-full lg:max-w-[600px]">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            <span className="border border-border bg-secondary text-[10px] font-semibold px-2 py-1 tracking-wider uppercase rounded-sm text-secondary-foreground">In Stock</span>
                            <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 tracking-wider uppercase rounded-sm">New</span>
                            <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 tracking-wider uppercase rounded-sm">NEW ARRIVAL</span>
                            <span className="border border-border bg-secondary text-[10px] font-semibold px-2 py-1 tracking-wider uppercase rounded-sm text-secondary-foreground">Moov - Sport & Athleisure</span>
                        </div>

                        {/* Title & Price */}
                        <div className="mb-6">
                            <h1 className="text-xl font-semibold tracking-wide text-foreground mb-3">Sport Ortega Skirt Pants (LIMITED) - Moov 2026</h1>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold tracking-wide text-secondary-foreground">Rp 589.000</span>
                                <Heart size={20} className="text-gray-400 cursor-pointer hover:text-black transition-colors hover:scale-110 active:scale-95" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Discount Banner */}
                        <div className="flex items-center justify-between border border-border bg-secondary/70 p-4 rounded-md mb-8 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <div className="flex items-center space-x-3">
                                <div className="text-accent">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                                        <path d="M4 12c1.1 0 2-.9 2-2s-.9-2-2-2M20 12c-1.1 0-2-.9-2-2s.9-2 2-2M4 12c1.1 0 2 .9 2 2s-.9 2-2 2M20 12c-1.1 0-2 .9-2 2s.9-2 2 2" />
                                        <line x1="12" y1="8" x2="12" y2="16" strokeDasharray="2 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-[11px] tracking-wide mb-0.5">You have 1 Discount available</p>
                                    <p className="text-gray-500 text-[10px] tracking-wide">Use a coupon now for even better deals</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </div>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <h3 className="text-[11px] font-semibold tracking-wide text-foreground mb-3">Color</h3>
                            <div className="flex space-x-4">
                                <div onClick={() => setMainImage(thumbnails[0])} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div className={`w-[50px] h-[65px] border ${mainImage === thumbnails[0] ? 'border-primary' : 'border-transparent group-hover:border-border'} p-0.5 rounded-sm overflow-hidden mb-2 transition-all`}>
                                        <img src={thumbnails[0]} className="w-full h-full object-cover rounded-sm" alt="Ash Grey" />
                                    </div>
                                    <span className={`text-[9px] font-medium ${mainImage === thumbnails[0] ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>Ash Grey</span>
                                </div>
                                <div onClick={() => setMainImage(thumbnails[2])} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div className={`w-[50px] h-[65px] border ${mainImage === thumbnails[2] ? 'border-primary' : 'border-transparent group-hover:border-border'} p-0.5 rounded-sm overflow-hidden mb-2 transition-all`}>
                                        <img src={thumbnails[2]} className="w-full h-full object-cover rounded-sm" alt="Dark Navy" />
                                    </div>
                                    <span className={`text-[9px] font-medium ${mainImage === thumbnails[2] ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>Dark Navy</span>
                                </div>
                                <div onClick={() => setMainImage(thumbnails[4])} className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div className={`w-[50px] h-[65px] border ${mainImage === thumbnails[4] ? 'border-primary' : 'border-transparent group-hover:border-border'} p-0.5 rounded-sm overflow-hidden mb-2 transition-all`}>
                                        <img src={thumbnails[4]} className="w-full h-full object-cover rounded-sm" alt="Taupe" />
                                    </div>
                                    <span className={`text-[9px] font-medium ${mainImage === thumbnails[4] ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>Taupe</span>
                                </div>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[11px] font-semibold tracking-wide text-foreground">Size</h3>
                                <div className="flex items-center text-accent hover:text-primary cursor-pointer transition-colors group">
                                    <span className="text-[10px] font-medium tracking-wide">Size Guide</span>
                                    <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button className="border border-primary text-primary px-7 py-2.5 rounded-md text-[11px] font-semibold tracking-wide shadow-sm hover:bg-secondary transition-all">
                                    SM
                                </button>
                                <button className="border border-border text-muted-foreground px-7 py-2.5 rounded-md text-[11px] font-semibold tracking-wide hover:border-primary hover:text-primary transition-all">
                                    LXL
                                </button>
                            </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="mb-10">
                            <div className="flex items-center border border-border rounded-md w-max bg-card mb-6 shadow-sm">
                                <button className="w-10 h-9 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-l-md transition-colors">
                                    <Minus size={14} strokeWidth={2} />
                                </button>
                                <span className="w-10 text-center text-[12px] font-semibold text-foreground">1</span>
                                <button className="w-10 h-9 flex items-center justify-center text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-r-md transition-colors">
                                    <Plus size={14} strokeWidth={2} />
                                </button>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <button className="w-full py-3.5 rounded-full border border-input text-[11px] font-bold tracking-widest text-secondary-foreground hover:bg-secondary hover:shadow-md transition-all active:scale-[0.99]">
                                    Add to Cart
                                </button>
                                <button className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold tracking-widest hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all active:scale-[0.99]">
                                    Buy It Now
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="text-[11px] leading-[1.9] text-secondary-foreground tracking-wide border-t border-border pt-8 mb-8 space-y-5 font-medium">
                            <p>
                                <span className="font-bold">Ortega Skirt Pants — Confident in Every Movement.</span>
                            </p>
                            <p>
                                Introducing Ortega Skirt Pants, where <span className="italic">performance meets modest coverage</span>. Designed for active days and intentional movement, Ortega is your go-to piece for comfort, flexibility, and confidence — without ever compromising syar'i values.
                            </p>
                            <p>
                                Crafted from <span className="font-bold">Axtura</span>, a lightweight nylon-spandex blend with a dry-fit feel. Ortega offers breathable comfort with a soft stretch that moves effortlessly with your body. Designed with built-in inner pants, it ensures full coverage and ease — so you can move freely, securely, and confidently throughout the day.
                            </p>
                            <p>
                                Perfect for sport, active routines, or everyday wear, Ortega blends functionality with a clean, modern silhouette.
                            </p>
                            <div>
                                <p>Available in three versatile shades:</p>
                                <p><span className="font-bold text-foreground">Ash Grey</span> — cool, minimal, and modern</p>
                                <p><span className="font-bold text-foreground">Dark Navy</span> — deep, strong, and timeless</p>
                                <p><span className="font-bold text-foreground">Taupe</span> — soft, neutral for effortless pairing</p>
                            </div>
                            <p>A piece for every step, every stretch, and every movement you own with confidence.</p>
                            <div>
                                <p>Made from Axtura (Nylon-Spandex Blend)</p>
                                <p>Lightweight | Breathable | Active Comfort</p>
                                <p>Built-in Inner Pants For Coverage & Ease</p>
                            </div>
                            <div>
                                <p className="font-bold text-foreground">Available in Size SM, LXL</p>
                                <p>Panduan ukuran (size guide) silahkan klik button</p>
                                <p className="italic">*Size tolerance: ±1-2 cm</p>
                            </div>
                            <div className="space-y-1">
                                <p className="italic text-muted-foreground">**We've done our best to capture the true color, though slight differences may occur due to lighting and screen display variations.</p>
                                <p className="italic text-muted-foreground">**No exchange, no refund selain bagi kesalahan penerimaan barang - please create an unboxing video clear just in case. Tanpa Video Unboxing maka kami belum bisa menerima retur dan refundnya.</p>
                                <p className="font-bold text-foreground">YuksakillA 🤍</p>
                            </div>
                        </div>

                        {/* Message Button */}
                        <button className="w-full py-3.5 rounded-full border border-input text-[11px] font-bold tracking-wide text-secondary-foreground hover:bg-secondary transition-colors flex items-center justify-center hover:shadow-sm active:scale-[0.99]">
                            <MessageCircle size={16} className="mr-2" strokeWidth={2} /> Message Itsar! Sport?
                        </button>
                    </div>
                </div>

                {/* You Might Also Like */}
                <div className="mt-28">
                    <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                        <h2 className="text-[13px] font-bold tracking-wider text-foreground">You Might Also Like</h2>
                        <div className="flex space-x-2">
                            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"><ChevronLeft size={16} /></button>
                            <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                    <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide">
                        {relatedProducts.map((product, idx) => (
                            <div key={idx} className="min-w-[170px] max-w-[170px] group cursor-pointer flex flex-col hover:-translate-y-1 transition-transform duration-300">
                                <div className="relative aspect-[3/4] mb-3 rounded-sm overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={product.title} loading="lazy" decoding="async" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none"></div>
                                    <div className="absolute bottom-2 right-2 bg-card/90 p-2 rounded-full shadow hover:bg-card hover:scale-110 transition-all text-foreground">
                                        <ShoppingBag size={14} strokeWidth={2} />
                                    </div>
                                </div>
                                <h3 className="text-[11px] font-bold tracking-wide leading-[1.4] mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.title}</h3>
                                <p className="text-[11px] text-secondary-foreground mt-auto font-medium">{product.price}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Viewed */}
                <div className="mt-20">
                    <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                        <h2 className="text-[13px] font-bold tracking-wider text-foreground">Recent Viewed</h2>
                    </div>
                    <div className="flex space-x-5">
                        {recentProducts.map((product, idx) => (
                            <div key={idx} className="min-w-[170px] max-w-[170px] group cursor-pointer flex flex-col hover:-translate-y-1 transition-transform duration-300">
                                <div className="relative aspect-[3/4] mb-3 rounded-sm overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={product.title} loading="lazy" decoding="async" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none"></div>
                                    <div className="absolute bottom-2 right-2 bg-card/90 p-2 rounded-full shadow hover:bg-card hover:scale-110 transition-all text-foreground">
                                        <ShoppingBag size={14} strokeWidth={2} />
                                    </div>
                                </div>
                                <h3 className="text-[11px] font-bold tracking-wide leading-[1.4] mb-1.5 text-foreground group-hover:text-primary transition-colors line-clamp-2">{product.title}</h3>
                                <p className="text-[11px] text-secondary-foreground mt-auto font-medium">{product.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

        </ShopLayout>
    );
}
