import React from 'react';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#FAF9F6]/98 border-b border-[#EAE8E3] px-4 md:px-10 py-3 md:py-5 flex items-center justify-between transition-all duration-300 shadow-sm">
            {/* Mobile Menu Icon */}
            <div className="md:hidden">
                <Menu size={20} className="text-[#4A4A4A] cursor-pointer" />
            </div>
            
            <div className="flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-0.5">
                    <path d="M7 4V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V4" stroke="#A89F91" strokeWidth="1.2"/>
                    <circle cx="12" cy="12" r="1.5" fill="#A89F91"/>
                </svg>
                <span className="text-[9px] tracking-[0.3em] font-semibold text-[#A89F91]">WEBCARE</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-10 text-[10px] font-semibold tracking-[0.15em] text-[#4A4A4A]">
                <a href="#" className="hover:text-black transition-colors">NEW ARRIVAL</a>
                <a href="#" className="hover:text-black transition-colors">SHOP ALL</a>
                <a href="#" className="hover:text-black transition-colors">ABAYA</a>
                <a href="#" className="hover:text-black transition-colors">KHIMAR</a>
                <a href="#" className="hover:text-black transition-colors">ACCESSORIES</a>
                <a href="#" className="hover:text-black transition-colors">OUR STORY</a>
                <a href="#" className="hover:text-black transition-colors">OUR JOURNAL</a>
            </div>
            
            <div className="flex items-center space-x-4 md:space-x-6 text-[#4A4A4A]">
                <div className="hidden md:flex items-center space-x-2 cursor-pointer group">
                    <div className="flex flex-col w-4 h-3 border border-gray-200 opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#E62B28] h-1/2 w-full"></div>
                        <div className="bg-white h-1/2 w-full"></div>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider group-hover:text-black transition-colors">IDR</span>
                </div>
                <Search strokeWidth={1.5} size={18} className="hidden sm:block cursor-pointer hover:text-black hover:-translate-y-0.5 transition-all" />
                <User strokeWidth={1.5} size={18} className="hidden sm:block cursor-pointer hover:text-black hover:-translate-y-0.5 transition-all" />
                <ShoppingBag strokeWidth={1.5} size={18} className="cursor-pointer hover:text-black hover:-translate-y-0.5 transition-all" />
            </div>
        </nav>
    );
}
