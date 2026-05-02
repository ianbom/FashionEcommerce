import { Link, usePage } from '@inertiajs/react';
import {
    Home,
    LayoutGrid,
    ShoppingBag,
    ClipboardList,
    User,
} from 'lucide-react';
import type { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

interface ShopLayoutProps {
    children: ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
    const { url } = usePage();

    const navItems = [
        { icon: Home, label: 'Home', href: '/', active: url === '/' },
        {
            icon: LayoutGrid,
            label: 'Categories',
            href: '/categories',
            active: url.startsWith('/categories'),
        },
        {
            icon: ShoppingBag,
            label: 'Cart',
            href: '/my-cart',
            active: url.startsWith('/my-cart'),
            badge: 3,
        },
        {
            icon: ClipboardList,
            label: 'Orders',
            href: '/orders',
            active: url.startsWith('/orders'),
        },
        {
            icon: User,
            label: 'Account',
            href: '/my-profile',
            active: url.startsWith('/my-profile'),
        },
    ];

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAF9F6] font-sans text-[#3C3428] selection:bg-[#D8D2C4] selection:text-[#3C3428]">
            <Navbar />
            <main className="mx-auto w-full max-w-md flex-grow bg-[#FAF9F6] pb-24 md:max-w-none md:pb-0">
                {children}
            </main>
            <Toaster />
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="pb-safe fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[#EAE8E3] bg-[#FAF9F6] px-6 py-2 md:hidden">
                <div className="flex h-14 items-center justify-between">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex w-14 flex-col items-center justify-center transition-colors ${item.active ? 'text-[#8C7A6B]' : 'text-[#A89F91]'}`}
                            >
                                <div className="relative mb-1">
                                    <Icon
                                        strokeWidth={item.active ? 2 : 1.5}
                                        size={22}
                                        className={
                                            item.active
                                                ? 'fill-[#8C7A6B]/20'
                                                : ''
                                        }
                                    />
                                    {item.badge && (
                                        <span className="absolute -top-1.5 -right-2 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-[#FAF9F6] bg-[#8C7A6B] text-[9px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
