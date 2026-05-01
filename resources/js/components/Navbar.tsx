import { Link } from '@inertiajs/react';
import { Search, User, ShoppingBag, Menu, Heart } from 'lucide-react';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md px-4 md:px-10 py-4 flex items-center justify-between transition-all duration-300">
            {/* Mobile View */}
            <div className="md:hidden flex items-center justify-between w-full">
                <Link href="/" className="text-2xl font-serif text-[#5A4F43]">
                    Auréa Syar'i
                </Link>
                <div className="flex items-center space-x-4 text-[#5A4F43]">
                    <Search strokeWidth={1.5} size={22} className="cursor-pointer" />
                    <Heart strokeWidth={1.5} size={22} className="cursor-pointer" />
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag strokeWidth={1.5} size={22} className="cursor-pointer" />
                        </Link>
                        <span className="absolute -top-1.5 -right-1.5 bg-[#8C7A6B] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            3
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop View (Keeping existing structure but restyled) */}
            <div className="hidden md:flex items-center justify-between w-full">
                <Link href="/" className="flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300">
                    <span className="text-xl font-serif text-[#5A4F43]">Auréa Syar'i</span>
                </Link>
                
                <div className="flex items-center space-x-10 text-[11px] font-semibold tracking-widest text-[#8C8578]">
                    <Link href="/list" className="hover:text-[#5A4F43] transition-colors">NEW ARRIVAL</Link>
                    <Link href="/list" className="hover:text-[#5A4F43] transition-colors">SHOP ALL</Link>
                    <Link href="/list" className="hover:text-[#5A4F43] transition-colors">ABAYA</Link>
                    <Link href="/list" className="hover:text-[#5A4F43] transition-colors">KHIMAR</Link>
                    <Link href="/list" className="hover:text-[#5A4F43] transition-colors">ACCESSORIES</Link>
                </div>
                
                <div className="flex items-center space-x-6 text-[#5A4F43]">
                    <Search strokeWidth={1.5} size={20} className="cursor-pointer hover:text-[#8C7A6B] transition-all" />
                    <Link href="/my-profile" aria-label="Open profile">
                        <User strokeWidth={1.5} size={20} className="cursor-pointer hover:text-[#8C7A6B] transition-all" />
                    </Link>
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag strokeWidth={1.5} size={20} className="cursor-pointer hover:text-[#8C7A6B] transition-all" />
                        </Link>
                        <span className="absolute -top-1.5 -right-1.5 bg-[#8C7A6B] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                            3
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
