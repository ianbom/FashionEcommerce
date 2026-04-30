import { Link } from '@inertiajs/react';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-background/98 border-b border-border px-4 md:px-10 py-3 md:py-5 flex items-center justify-between transition-all duration-300 shadow-sm">
            {/* Mobile Menu Icon */}
            <div className="md:hidden">
                <Menu size={20} className="text-secondary-foreground cursor-pointer" />
            </div>
            
            <Link href="/" className="flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-0.5 text-accent">
                    <path d="M7 4V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V4" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                </svg>
                <span className="text-[9px] tracking-[0.3em] font-semibold text-accent">WEBCARE</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-10 text-[10px] font-semibold tracking-[0.15em] text-secondary-foreground">
                <Link href="/list" className="hover:text-primary transition-colors">NEW ARRIVAL</Link>
                <Link href="/list" className="hover:text-primary transition-colors">SHOP ALL</Link>
                <Link href="/list" className="hover:text-primary transition-colors">ABAYA</Link>
                <Link href="/list" className="hover:text-primary transition-colors">KHIMAR</Link>
                <Link href="/list" className="hover:text-primary transition-colors">ACCESSORIES</Link>
                <Link href="/" className="hover:text-primary transition-colors">OUR STORY</Link>
                <Link href="/" className="hover:text-primary transition-colors">OUR JOURNAL</Link>
            </div>
            
            <div className="flex items-center space-x-4 md:space-x-6 text-secondary-foreground">
                <div className="hidden md:flex items-center space-x-2 cursor-pointer group">
                    <div className="flex flex-col w-4 h-3 border border-gray-200 opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="bg-destructive h-1/2 w-full"></div>
                        <div className="bg-white h-1/2 w-full"></div>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider group-hover:text-primary transition-colors">IDR</span>
                </div>
                <Search strokeWidth={1.5} size={18} className="hidden sm:block cursor-pointer hover:text-primary hover:-translate-y-0.5 transition-all" />
                <Link href="/my-profile" aria-label="Open profile">
                    <User strokeWidth={1.5} size={18} className="hidden sm:block cursor-pointer hover:text-primary hover:-translate-y-0.5 transition-all" />
                </Link>
                <Link href="/my-cart" aria-label="Open cart">
                    <ShoppingBag strokeWidth={1.5} size={18} className="cursor-pointer hover:text-primary hover:-translate-y-0.5 transition-all" />
                </Link>
            </div>
        </nav>
    );
}
