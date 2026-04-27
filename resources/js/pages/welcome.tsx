import React from 'react';
import { Head } from '@inertiajs/react';
import { Search, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';

const products = [
    {
        id: 1,
        title: "Sport Ortega Skirt Pants (LIMITED) - Moov 2026",
        price: "Rp 589.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg",
        colors: [],
    },
    {
        id: 2,
        title: "Sport Gemma Khimar - Moov 2026",
        price: "Rp 469.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg",
        colors: [],
    },
    {
        id: 3,
        title: "Athleisure Adora Abaya - Moov 2026",
        price: "Rp 869.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg",
        colors: [],
    },
    {
        id: 4,
        title: "Athleisure Delik Tunic (LIMITED) - Moov 2026",
        price: "Rp 639.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg",
        colors: [],
    },
    {
        id: 5,
        title: "Athleisure Beau Skirt (LIMITED) - Moov 2026",
        price: "Rp 559.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg",
        colors: [],
    },
    {
        id: 6,
        title: "Caspia Side Khimar (Simar) - COMFORT Series",
        price: "Rp 349.000",
        badge: "RESTOCKED",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/khaled-ghareeb-n84s3jgzhKk-unsplash.jpg",
        colors: [],
    },
    {
        id: 7,
        title: "Caspia Side Khimar (Simar) - Raya Edition",
        price: "Rp 389.000",
        badge: "RESTOCKED",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.jpg",
        colors: [],
    },
    {
        id: 8,
        title: "Kafah Khimar",
        price: "Rp 349.000",
        badge: "RESTOCKED",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/mina-rad-2O2cXJemDmo-unsplash.jpg",
        colors: [],
    },
    {
        id: 9,
        title: "Marrakech Jardin Abaya - Jardin de Flores",
        price: "Rp 1.099.000",
        badge: "",
        image: "/img/monody-le-7YrRbgOPibw-unsplash.jpg",
        colors: ["bg-black", "bg-[#F174B8]", "bg-[#815C42]"],
    },
    {
        id: 10,
        title: "The Granada Jardin Set - Jardin de Flores",
        price: "Rp 1.349.000",
        badge: "",
        image: "/img/omar-elsharawy-gFHBofW3ncQ-unsplash.jpg",
        colors: [],
    },
    {
        id: 11,
        title: "Mila Jardin Women Abaya - Jardin de Flores",
        price: "Rp 989.000",
        badge: "",
        image: "/img/sajimon-sahadevan-AWC94dVpTPc-unsplash.jpg",
        colors: ["bg-[#182A45]", "bg-[#E6D4CB]", "bg-[#F174B8]", "bg-[#815C42]", "bg-[#3B3B3B]"],
    },
    {
        id: 12,
        title: "Abaya (Abaya Cargo)",
        price: "Rp 729.000",
        badge: "",
        image: "/img/sarah-khan-R7p66Oj8ZOQ-unsplash.jpg",
        colors: [],
    },
    {
        id: 13,
        title: "Mila Jardin Kid Abaya - Jardin de Flores",
        price: "Rp 599.000",
        badge: "",
        image: "/img/shedrack-salami-DRjeesi2kFM-unsplash.jpg",
        colors: ["bg-[#F174B8]", "bg-[#E6D4CB]", "bg-[#182A45]"],
    },
    {
        id: 14,
        title: "Bella Kid Khimar - Jardin de Flores",
        price: "Rp 149.000",
        badge: "",
        image: "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg",
        colors: ["bg-[#F174B8]", "bg-[#8CA2A8]", "bg-[#E6D4CB]"],
    },
    {
        id: 15,
        title: "Hugo Jardin Kids Shirts - Jardin de Flores",
        price: "Rp 349.000",
        badge: "",
        image: "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg",
        colors: [],
    },
    {
        id: 16,
        title: "Hugo Jardin Men's Shirt - Jardin de Flores",
        price: "Rp 469.000",
        badge: "",
        image: "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg",
        colors: ["bg-[#182A45]", "bg-[#E6D4CB]"],
    },
    {
        id: 17,
        title: "Defect of Caspia COMFORT Series",
        price: "Rp 309.000",
        badge: "NEW",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg",
        colors: [],
    },
    {
        id: 18,
        title: "Miriam Abaya",
        price: "Rp 999.000",
        badge: "NEW",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg",
        colors: [],
    },
    {
        id: 19,
        title: "Casa Ocean Abaya",
        price: "Rp 869.000",
        badge: "NEW",
        badgeColor: "bg-[#453f35]",
        image: "/img/khaled-ghareeb-n84s3jgzhKk-unsplash.jpg",
        colors: [],
    },
    {
        id: 20,
        title: "Shanum Abaya",
        price: "Rp 1.499.000",
        badge: "NEW",
        badgeColor: "bg-[#a3a38d]",
        image: "/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.jpg",
        colors: [],
    }
];

export default function Welcome() {
    return (
        <AppLayout>
            <Head title="Products - Webcare" />

            {/* Main Content */}
            <main className="max-w-[1500px] mx-auto px-4 md:px-10 py-6 md:py-10 flex flex-col lg:flex-row">
                {/* Sidebar */}
                <aside className="w-full lg:w-60 flex-shrink-0 pr-0 lg:pr-10 mb-8 lg:mb-0">
                    {/* Search */}
                    <div className="relative mb-8 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="w-full pl-9 pr-4 py-2 bg-transparent border border-[#EAE8E3] rounded-md text-[11px] tracking-wide focus:outline-none focus:border-[#A89F91] focus:ring-1 focus:ring-[#A89F91]/20 transition-all"
                        />
                    </div>

                    {/* Filter Sections */}
                    <div className="space-y-6 text-[#4A4A4A]">
                        {/* Categories */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Categories</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="space-y-3.5 text-[11px] tracking-wide ml-3">
                                <div className="flex items-center justify-between cursor-pointer hover:text-black transition-colors">
                                    <span>ABAYA</span>
                                    <ChevronDown size={14} />
                                </div>
                                <div className="flex items-center justify-between cursor-pointer hover:text-black transition-colors">
                                    <span>KHIMAR</span>
                                    <ChevronDown size={14} />
                                </div>
                                <div className="flex items-center justify-between cursor-pointer hover:text-black transition-colors">
                                    <span>ACCESSORIES</span>
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                        <hr className="border-[#EAE8E3]" />

                        {/* Product Type */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Product Type</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#4A4A4A] flex items-center justify-center transition-colors">
                                        <div className="w-[6px] h-[6px] rounded-full bg-[#4A4A4A]"></div>
                                    </div>
                                    <span className="group-hover:text-black transition-colors">All Products</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Featured Products</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Discount</span>
                                </label>
                            </div>
                        </div>
                        <hr className="border-[#EAE8E3]" />

                        {/* Availability */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Availability</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#4A4A4A] flex items-center justify-center transition-colors">
                                        <div className="w-[6px] h-[6px] rounded-full bg-[#4A4A4A]"></div>
                                    </div>
                                    <span className="group-hover:text-black transition-colors">All</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">In Stock</span>
                                </label>
                            </div>
                        </div>
                        <hr className="border-[#EAE8E3]" />

                        {/* Price */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Price</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="space-y-3.5 text-[11px] tracking-wide">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Under Rp 410,000</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Rp Rp 410,000 - Rp 830,000</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Rp Rp 830,000 - Rp 1,200,000</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className="w-[14px] h-[14px] rounded-full border border-[#D1CEC7] group-hover:border-[#4A4A4A] transition-colors"></div>
                                    <span className="group-hover:text-black transition-colors">Rp 1,200,000 +</span>
                                </label>
                            </div>
                        </div>
                        <hr className="border-[#EAE8E3]" />

                        {/* Color */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Color</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#182A45] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#3B3B3B] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#815C42] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#E6D4CB] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#4EBFDB] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                                <div className="w-5 h-5 rounded-full bg-[#F174B8] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                            </div>
                        </div>
                        <hr className="border-[#EAE8E3]" />

                        {/* Size */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] tracking-wide font-semibold mb-4 cursor-pointer hover:text-black transition-colors">
                                <span>Size</span>
                                <ChevronUp size={14} />
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-500">
                                <div className="w-9 h-7 border border-[#D1CEC7] rounded flex items-center justify-center cursor-pointer hover:border-[#4A4A4A] hover:text-[#4A4A4A] transition-colors bg-white/50">XS</div>
                                <div className="w-9 h-7 border border-[#D1CEC7] rounded flex items-center justify-center cursor-pointer hover:border-[#4A4A4A] hover:text-[#4A4A4A] transition-colors bg-white/50">S</div>
                                <div className="w-9 h-7 border border-[#D1CEC7] rounded flex items-center justify-center cursor-pointer hover:border-[#4A4A4A] hover:text-[#4A4A4A] transition-colors bg-white/50">M</div>
                                <div className="w-9 h-7 border border-[#D1CEC7] rounded flex items-center justify-center cursor-pointer hover:border-[#4A4A4A] hover:text-[#4A4A4A] transition-colors bg-white/50">L</div>
                                <div className="w-9 h-7 border border-[#D1CEC7] rounded flex items-center justify-center cursor-pointer hover:border-[#4A4A4A] hover:text-[#4A4A4A] transition-colors bg-white/50">XL</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Product Grid */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-6 pb-2 border-b border-transparent">
                        <h1 className="text-[17px] font-medium tracking-wide">All Products</h1>
                        <div className="flex items-center text-[11px] text-[#4A4A4A] cursor-pointer group tracking-wide">
                            <span>sort : <span className="font-semibold text-black group-hover:text-gray-600 transition-colors ml-1">Featured</span></span>
                            <ChevronDown size={14} className="ml-1" />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-5 gap-y-6 md:gap-y-10">
                        {products.map((product) => (
                            <div key={product.id} className="flex flex-col h-full group cursor-pointer">
                                {/* Image Container */}
                                <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-sm bg-gray-100">
                                    <img 
                                        src={product.image} 
                                        alt={product.title} 
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                                    />
                                    {/* Overlay Gradient for anti-gravity feeling */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none"></div>

                                    {/* Badge */}
                                    {product.badge && (
                                        <div className={`absolute top-2 left-2 ${product.badgeColor} text-white text-[8px] font-medium tracking-widest px-2 py-1 uppercase rounded-sm shadow-sm`}>
                                            {product.badge}
                                        </div>
                                    )}
                                    {/* Heart Icon */}
                                    <div className="absolute bottom-2 right-2 text-white/90 hover:text-white transition-colors hover:scale-110 drop-shadow-md">
                                        <Heart size={18} strokeWidth={1.5} />
                                    </div>
                                </div>
                                
                                {/* Color Swatches */}
                                {product.colors && product.colors.length > 0 && (
                                    <div className="flex space-x-1.5 mb-2">
                                        {product.colors.map((color, idx) => (
                                            <div key={idx} className={`w-[12px] h-[12px] rounded-full ${color} border border-gray-200/60 shadow-sm`}></div>
                                        ))}
                                    </div>
                                )}

                                {/* Title */}
                                <h3 className="text-[11px] text-[#333333] font-semibold leading-[1.4] mb-1 hover:text-black transition-colors">
                                    {product.title}
                                </h3>

                                {/* Price */}
                                <div className="text-[11px] text-[#4A4A4A] mb-4">
                                    {product.price}
                                </div>

                                {/* Buy Button */}
                                <button className="mt-auto w-full border border-[#D1CEC7] rounded-full py-2 text-[11px] font-semibold text-[#4A4A4A] tracking-wider hover:bg-[#4A4A4A] hover:text-white hover:border-[#4A4A4A] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95">
                                    Buy
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}
