import { Link } from '@inertiajs/react';
import { Search, User, ShoppingBag, Menu, Heart } from 'lucide-react';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#FAF9F6]/90 px-4 py-4 backdrop-blur-md transition-all duration-300 md:px-10">
            {/* Mobile View */}
            <div className="flex w-full items-center justify-between md:hidden">
                <Link href="/" className="font-serif text-2xl text-[#5A4F43]">
                    Auréa Syar'i
                </Link>
                <div className="flex items-center space-x-4 text-[#5A4F43]">
                    <Search
                        strokeWidth={1.5}
                        size={22}
                        className="cursor-pointer"
                    />
                    <Heart
                        strokeWidth={1.5}
                        size={22}
                        className="cursor-pointer"
                    />
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag
                                strokeWidth={1.5}
                                size={22}
                                className="cursor-pointer"
                            />
                        </Link>
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8C7A6B] text-[10px] font-bold text-white">
                            3
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop View (Keeping existing structure but restyled) */}
            <div className="hidden w-full items-center justify-between md:flex">
                <Link
                    href="/"
                    className="flex transform cursor-pointer flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
                >
                    <span className="font-serif text-xl text-[#5A4F43]">
                        Auréa Syar'i
                    </span>
                </Link>

                <div className="flex items-center space-x-10 text-[11px] font-semibold tracking-widest text-[#8C8578]">
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        NEW ARRIVAL
                    </Link>
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        SHOP ALL
                    </Link>
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        ABAYA
                    </Link>
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        KHIMAR
                    </Link>
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        ACCESSORIES
                    </Link>
                </div>

                <div className="flex items-center space-x-6 text-[#5A4F43]">
                    <Search
                        strokeWidth={1.5}
                        size={20}
                        className="cursor-pointer transition-all hover:text-[#8C7A6B]"
                    />
                    <Link href="/my-profile" aria-label="Open profile">
                        <User
                            strokeWidth={1.5}
                            size={20}
                            className="cursor-pointer transition-all hover:text-[#8C7A6B]"
                        />
                    </Link>
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag
                                strokeWidth={1.5}
                                size={20}
                                className="cursor-pointer transition-all hover:text-[#8C7A6B]"
                            />
                        </Link>
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8C7A6B] text-[10px] font-bold text-white">
                            3
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
