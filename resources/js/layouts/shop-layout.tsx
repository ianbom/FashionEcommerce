import { Link, usePage } from '@inertiajs/react';
import { Home, LayoutGrid, User } from 'lucide-react';
import type { ReactNode } from 'react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

interface ShopLayoutProps {
    children: ReactNode;
}

type SharedShopProps = {
    shop?: {
        cart_count?: number;
        featured_collections?: Array<{
            id: number;
            name: string;
            slug: string;
        }>;
    };
};

export default function ShopLayout({ children }: ShopLayoutProps) {
    const { url, props } = usePage<SharedShopProps>();
    const cartCount = props.shop?.cart_count ?? 0;
    const featuredCollections = props.shop?.featured_collections ?? [];

    const navItems = [
        { icon: Home, label: 'Home', href: '/', active: url === '/' },
        {
            icon: LayoutGrid,
            label: 'Shop',
            href: '/list',
            active: url.startsWith('/list'),
        },
        {
            icon: User,
            label: 'Account',
            href: '/my-profile',
            active: url.startsWith('/my-profile'),
        },
    ];

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAF9F6] font-sans text-[#4A2525] selection:bg-[#EADBD8] selection:text-[#4A2525]">
            <Navbar cartCount={cartCount} collections={featuredCollections} />
            <main className="mx-auto w-full max-w-md flex-grow bg-[#FAF9F6] pb-24 md:max-w-none md:pb-0">
                {children}
            </main>
            <Toaster />
            <div className="hidden md:block">
                <Footer />
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="pb-safe fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[#EADBD8] bg-[#FAF9F6] px-6 py-2 md:hidden">
                <div className="flex h-14 items-center justify-between">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex w-14 flex-col items-center justify-center transition-colors ${item.active ? 'text-[#7F2020]' : 'text-[#C99A8F]'}`}
                            >
                                <div className="relative mb-1">
                                    <Icon
                                        strokeWidth={item.active ? 2 : 1.5}
                                        size={22}
                                        className={
                                            item.active
                                                ? 'fill-[#7F2020]/20'
                                                : ''
                                        }
                                    />
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
