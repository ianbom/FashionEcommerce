import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Home, LayoutGrid, ShoppingBag, ClipboardList, User } from 'lucide-react';

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
        { icon: LayoutGrid, label: 'Categories', href: '/categories', active: url.startsWith('/categories') },
        { icon: ShoppingBag, label: 'Cart', href: '/my-cart', active: url.startsWith('/my-cart'), badge: 3 },
        { icon: ClipboardList, label: 'Orders', href: '/orders', active: url.startsWith('/orders') },
        { icon: User, label: 'Account', href: '/my-profile', active: url.startsWith('/my-profile') },
    ];

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#3C3428] font-sans overflow-x-hidden selection:bg-[#D8D2C4] selection:text-[#3C3428] flex flex-col">
            <Navbar />
            <main className="flex-grow pb-24 md:pb-0 w-full max-w-md mx-auto md:max-w-none bg-[#FAF9F6]">
                {children}
            </main>
            <Toaster />
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-[#FAF9F6] z-50 px-6 py-2 pb-safe border-t border-[#EAE8E3]">
                <div className="flex justify-between items-center h-14">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link 
                                key={index} 
                                href={item.href} 
                                className={`flex flex-col items-center justify-center w-14 transition-colors ${item.active ? 'text-[#8C7A6B]' : 'text-[#A89F91]'}`}
                            >
                                <div className="relative mb-1">
                                    <Icon strokeWidth={item.active ? 2 : 1.5} size={22} className={item.active ? 'fill-[#8C7A6B]/20' : ''} />
                                    {item.badge && (
                                        <span className="absolute -top-1.5 -right-2 bg-[#8C7A6B] text-white text-[9px] font-bold h-[15px] w-[15px] rounded-full flex items-center justify-center border border-[#FAF9F6]">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
