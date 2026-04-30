import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Trash2, Heart, Plus, Minus, ShoppingBag, ShieldCheck, Box } from 'lucide-react';
import ShopLayout from '@/Layouts/shop-layout';

// Dummy Data
const initialCartItems = [
    {
        id: 1,
        title: "Najran Piping Lace Abaya",
        color: "Off White",
        size: "M",
        price: 699000,
        quantity: 1,
        image: "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg",
    },
    {
        id: 2,
        title: "Kufah Khimar",
        color: "Off White",
        size: "M",
        price: 249000,
        quantity: 1,
        image: "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg",
    },
    {
        id: 3,
        title: "Sila Scarf",
        color: "Off White",
        size: "Standard",
        price: 179000,
        quantity: 1,
        image: "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg",
    }
];

const suggestedProducts = [
    { id: 1, title: "Zahra Khimar", price: "Rp 249.000", image: "/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg" },
    { id: 2, title: "Luthfah Abaya", price: "Rp 729.000", image: "/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg" },
    { id: 3, title: "Amani Scarf", price: "Rp 189.000", image: "/img/khaled-ghareeb-n84s3jgzhKk-unsplash.jpg" },
    { id: 4, title: "Madinah Abaya", price: "Rp 749.000", image: "/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.jpg" },
];

export default function MyCart() {
    const [cartItems, setCartItems] = useState(initialCartItems);

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('Rp', 'Rp ');
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 18000;
    const discount = 50000;
    const total = subtotal + shipping - discount;

    const isEmpty = cartItems.length === 0;

    return (
        <ShopLayout>
            <Head title="My Cart - Webcare" />

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 bg-[#FAF9F6] min-h-screen">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-[10px] md:text-xs text-[#8C8578] mb-6 md:mb-8 font-medium tracking-wide">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-[#333333]">My Cart</span>
                </div>

                {!isEmpty ? (
                    <>
                        <div className="mb-8 md:mb-10">
                            <h1 className="text-3xl md:text-4xl font-serif italic text-[#3C3428] mb-2">My Cart</h1>
                            <p className="text-xs md:text-sm text-[#8C8578]">Review your selected items before checkout.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative">
                            {/* Left Column: Cart Items */}
                            <div className="flex-1 space-y-4 md:space-y-6">
                                {cartItems.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-[#EAE8E3]/60 bg-white/40 backdrop-blur-sm hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500 ease-out animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Product Image */}
                                        <div className="w-full sm:w-[120px] lg:w-[140px] aspect-[4/5] overflow-hidden rounded-lg bg-[#F5F2E6] flex-shrink-0 relative group cursor-pointer">
                                            <img 
                                                src={item.image} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none"></div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start">
                                                <div className="pr-4">
                                                    <h3 className="text-sm md:text-base font-semibold text-[#333333] mb-1 group-hover:text-black cursor-pointer transition-colors line-clamp-2 md:line-clamp-1">{item.title}</h3>
                                                    <div className="text-[11px] md:text-xs text-[#8C8578] space-y-0.5">
                                                        <p>Color: {item.color}</p>
                                                        <p>Size: {item.size}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={18} strokeWidth={1.5} />
                                                </button>
                                            </div>

                                            {/* Mobile Layout Adjustment: Price up top for mobile, bottom for desktop */}
                                            <div className="hidden sm:block mt-2 mb-4">
                                                <span className="text-[13px] text-[#4A4A4A] font-medium">{formatPrice(item.price)}</span>
                                            </div>

                                            <div className="flex flex-wrap sm:flex-nowrap justify-between items-center mt-4 sm:mt-auto gap-4">
                                                {/* Wishlist */}
                                                <button className="flex items-center text-[11px] font-medium text-[#8C8578] hover:text-black transition-colors group">
                                                    <Heart size={14} className="mr-1.5 group-hover:fill-red-50 group-hover:text-red-500 transition-colors" strokeWidth={1.5} /> 
                                                    <span className="underline underline-offset-2">Move to Wishlist</span>
                                                </button>

                                                {/* Quantity & Subtotal */}
                                                <div className="flex items-center space-x-6 ml-auto sm:ml-0">
                                                    <div className="flex items-center border border-[#EAE8E3] rounded-md overflow-hidden bg-white/80 shadow-sm">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center text-[#4A4A4A] hover:bg-[#F5F2E6] hover:text-black transition-colors"
                                                        >
                                                            <Minus size={14} strokeWidth={2} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-semibold text-[#333333]">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-[#4A4A4A] hover:bg-[#F5F2E6] hover:text-black transition-colors"
                                                        >
                                                            <Plus size={14} strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                    <span className="text-sm font-bold text-[#333333] min-w-[90px] text-right">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="w-full lg:w-[380px] flex-shrink-0">
                                <div className="bg-white rounded-2xl border border-[#EAE8E3]/80 p-6 md:p-8 shadow-xl shadow-black/5 sticky top-24 lg:top-32">
                                    <h2 className="text-xl md:text-2xl font-serif italic text-[#3C3428] mb-6">Order Summary</h2>
                                    
                                    <div className="space-y-4 text-[13px] text-[#4A4A4A] mb-6">
                                        <div className="flex justify-between items-center">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-[#333333]">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Shipping estimate</span>
                                            <span className="font-semibold text-[#333333]">{formatPrice(shipping)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#C05D5D]">
                                            <span>Discount</span>
                                            <span className="font-semibold">- {formatPrice(discount)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#EAE8E3] pt-5 pb-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-semibold text-[#333333]">Total</span>
                                            <span className="text-2xl font-serif text-[#333333]">{formatPrice(total)}</span>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className="flex space-x-2 mb-6">
                                        <input 
                                            type="text" 
                                            placeholder="Enter promo code" 
                                            className="flex-1 px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE8E3] rounded-md text-[12px] focus:outline-none focus:border-[#C4BDB1] focus:ring-1 focus:ring-[#C4BDB1] transition-all"
                                        />
                                        <button className="px-5 py-2.5 bg-[#EAE4D9] text-[#4A4A4A] text-[12px] font-semibold rounded-md hover:bg-[#DFD8CC] hover:text-black transition-colors">
                                            Apply
                                        </button>
                                    </div>

                                    {/* Checkout Buttons */}
                                    <div className="space-y-4">
                                        <button className="w-full py-4 rounded-lg bg-[#3C3428] text-white text-[13px] font-bold tracking-wider hover:bg-[#2D261C] hover:shadow-lg hover:shadow-[#3C3428]/20 transition-all active:scale-[0.98]">
                                            Proceed to Checkout
                                        </button>
                                        <div className="text-center">
                                            <Link href="/" className="inline-block text-[12px] text-[#8C8578] font-medium underline underline-offset-4 hover:text-black transition-colors">
                                                Continue Shopping
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="mt-8 space-y-4 pt-6 border-t border-[#EAE8E3]/60">
                                        <div className="flex items-start space-x-3 text-[11px] text-[#8C8578]">
                                            <ShieldCheck size={16} className="text-[#A89F91] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                            <p>Secure payment powered by Midtrans</p>
                                        </div>
                                        <div className="flex items-start space-x-3 text-[11px] text-[#8C8578]">
                                            <Box size={16} className="text-[#A89F91] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                            <p>Shipping calculated using Biteship at checkout</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Floating Checkout Footer (Visible only on very small screens if desired) 
                            This replicates the MyCart-mobile.png floating bottom bar. */}
                        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#3C3428] text-white p-4 pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-40 transform translate-y-0 transition-transform">
                            <div>
                                <p className="text-[10px] text-white/60 mb-0.5 font-medium">Total</p>
                                <p className="text-lg font-serif">{formatPrice(total)}</p>
                            </div>
                            <button className="px-6 py-3 bg-[#EAE4D9] text-[#3C3428] rounded-md text-xs font-bold tracking-wide hover:bg-white transition-colors active:scale-95">
                                Checkout ({cartItems.length})
                            </button>
                        </div>
                    </>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 animate-fade-in-up">
                        <div className="w-40 md:w-48 mb-8 text-[#D8D2C4] relative">
                            {/* Simple Shopping Bag SVG Illustration to match design vibe */}
                            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                                <path d="M50 80L40 180H160L150 80H50Z" fill="#EAE4D9" stroke="#C4BDB1" strokeWidth="2" strokeLinejoin="round"/>
                                <path d="M75 80V50C75 36.1929 86.1929 25 100 25C113.807 25 125 36.1929 125 50V80" stroke="#C4BDB1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M45 150L60 90C65 70 80 60 100 60C120 60 135 70 140 90L155 150" stroke="white" strokeOpacity="0.5" strokeWidth="1"/>
                                {/* Subtle sparkle */}
                                <path d="M160 40C160 40 165 42 165 47C165 42 170 40 170 40C170 40 165 38 165 33C165 38 160 40 160 40Z" fill="#C4BDB1"/>
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif italic text-[#3C3428] mb-4">Your cart is empty</h2>
                        <p className="text-sm md:text-base text-[#8C8578] mb-10 text-center max-w-sm">Looks like you haven't added anything to your cart yet.</p>
                        <Link href="/" className="px-8 py-4 bg-[#3C3428] text-white text-sm font-bold tracking-wider rounded-lg hover:bg-[#2D261C] hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0">
                            Explore Collection
                        </Link>
                    </div>
                )}

                {/* You May Also Like */}
                {!isEmpty && (
                    <div className="mt-20 md:mt-32 mb-10 lg:mb-20">
                        <h2 className="text-xl md:text-2xl font-serif text-[#333333] mb-8 relative inline-block">
                            You May Also Like
                            <span className="absolute -bottom-2 left-0 w-1/2 h-px bg-[#C4BDB1]"></span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {suggestedProducts.map((product, idx) => (
                                <div 
                                    key={product.id} 
                                    className="flex flex-col group cursor-pointer animate-fade-in-up"
                                    style={{ animationDelay: `${(idx + cartItems.length) * 100}ms` }}
                                >
                                    <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-[#F5F2E6] shadow-sm hover:shadow-lg transition-all duration-500">
                                        <img 
                                            src={product.image} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                            loading="lazy" 
                                            decoding="async" 
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none"></div>
                                    </div>
                                    <h3 className="text-[12px] md:text-sm font-semibold text-[#333333] mb-1 group-hover:text-black transition-colors truncate">{product.title}</h3>
                                    <p className="text-[11px] md:text-xs text-[#8C8578] mb-4 font-medium">{product.price}</p>
                                    <button className="w-full py-2.5 md:py-3 border border-[#EAE8E3] bg-[#FAF9F6] text-[#4A4A4A] text-[10px] md:text-[11px] font-bold tracking-wider rounded-md hover:bg-[#3C3428] hover:text-white hover:border-[#3C3428] transition-all flex items-center justify-center group-hover:shadow-md">
                                        <ShoppingBag size={14} className="mr-2" strokeWidth={2} />
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </ShopLayout>
    );
}
