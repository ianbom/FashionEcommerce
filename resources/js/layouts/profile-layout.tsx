import { Head, Link } from '@inertiajs/react';
import {
    User,
    ShoppingBag,
    MapPin,
    Bell,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

const SIDEBAR_NAV = [
    {
        id: 'my-profile',
        href: '/my-profile',
        label: 'Profile Settings',
        mobileLabel: 'Profile',
        icon: User,
    },
    {
        id: 'list-order',
        href: '/my-order',
        label: 'My Orders',
        mobileLabel: 'Orders',
        icon: ShoppingBag,
    },
    {
        id: 'address',
        href: '/address',
        label: 'Address Book',
        mobileLabel: 'Address',
        icon: MapPin,
    },
    {
        id: 'notifications',
        href: '/notifications',
        label: 'Notifications',
        mobileLabel: 'Alerts',
        icon: Bell,
    },
];

interface Breadcrumb {
    label: string;
    href?: string;
}

interface ProfileLayoutProps {
    children: React.ReactNode;
    title: React.ReactNode | string;
    pageTitle: string; // Used for <Head>
    subtitle: string;
    activePath: string; // Should match one of the SIDEBAR_NAV ids
    breadcrumbs: Breadcrumb[];
}

export default function ProfileLayout({
    children,
    title,
    pageTitle,
    subtitle,
    activePath,
    breadcrumbs,
}: ProfileLayoutProps) {
    return (
        <ShopLayout>
            <Head title={`${pageTitle} - Webcare`} />

            {/* --- Hero / Header Section --- */}
            <div className="relative flex h-[200px] w-full items-center overflow-hidden bg-[#EADBD8] md:h-[280px]">
                {/* Background Image / Pattern */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/img/ike-ellyana-2F70bGqQVa4-unsplash.webp"
                        alt="Hero Background"
                        className="h-full w-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent"></div>
                </div>

                <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-16">
                    <div className="mb-4 flex items-center space-x-2 text-[10px] font-medium tracking-wide text-[#8A6B62] md:text-xs">
                        {breadcrumbs.map((bc, idx) => (
                            <React.Fragment key={idx}>
                                {bc.href ? (
                                    <>
                                        <Link
                                            href={bc.href}
                                            className="transition-colors hover:text-black"
                                        >
                                            {bc.label}
                                        </Link>
                                        <span>/</span>
                                    </>
                                ) : (
                                    <span className="text-[#333333]">
                                        {bc.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <h1 className="mb-2 font-serif text-3xl text-[#4A2525] italic md:text-4xl lg:text-5xl">
                        {title}
                    </h1>
                    <p className="text-xs text-[#8A6B62] md:text-sm">
                        {subtitle}
                    </p>
                </div>
            </div>

            <main className="relative z-20 mx-auto -mt-10 min-h-screen max-w-[1440px] bg-[#FAF9F6] px-6 py-8 md:px-12 md:py-12 lg:px-16">
                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* --- Sidebar (Desktop) / Horizontal Nav (Mobile) --- */}
                    <div className="w-full flex-shrink-0 lg:w-[240px]">
                        {/* Mobile Horizontal Nav */}
                        <div className="hide-scrollbar mb-6 flex space-x-2 overflow-x-auto pb-2 lg:hidden">
                            {SIDEBAR_NAV.slice(0, 4).map((item) => {
                                const Icon = item.icon;
                                const isActive = item.id === activePath;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`flex min-w-[80px] flex-col items-center justify-center rounded-xl border p-3 ${isActive ? 'border-[#B6574B] bg-[#FAF8F5] text-[#4A2525] shadow-sm' : 'border-[#EADBD8] bg-white text-[#8A6B62] hover:border-[#C4BDB1]'}`}
                                    >
                                        <Icon size={20} className="mb-2" />
                                        <span className="text-[10px] font-semibold">
                                            {item.mobileLabel || item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop Sidebar Nav */}
                        <div className="mb-6 hidden rounded-2xl border border-[#EADBD8] bg-white/60 p-3 shadow-sm backdrop-blur-md lg:block">
                            {SIDEBAR_NAV.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.id === activePath;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`mb-1 flex items-center space-x-3 rounded-xl px-4 py-3 transition-all ${isActive ? 'bg-[#F1E6E2] font-semibold text-[#4A2525]' : 'text-[#8A6B62] hover:bg-[#F8EDED] hover:text-[#4A2525]'}`}
                                    >
                                        <Icon
                                            size={18}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        <span className="text-[13px]">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                            <div className="mx-2 my-2 h-px bg-[#EADBD8]"></div>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-[#8A6B62] transition-all hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut size={18} />
                                <span className="text-[13px]">Logout</span>
                            </Link>
                        </div>

                        {/* Need Help Card (Desktop) */}
                        <div className="hidden flex-col overflow-hidden rounded-2xl border border-[#EADBD8] bg-white shadow-sm lg:flex">
                            <div className="relative h-40 bg-[#F8EDED]">
                                <img
                                    src="/img/hasan-almasi-_X2UAmIcpko-unsplash.webp"
                                    alt="Support"
                                    className="h-full w-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                            <div className="relative z-10 -mt-6 p-5 pt-0">
                                <h3 className="mb-2 font-serif text-lg text-[#4A2525]">
                                    Need Help?
                                </h3>
                                <p className="mb-4 text-[11px] text-[#8A6B62]">
                                    We're here to assist you with any questions.
                                </p>
                                <Link
                                    href="/notifications"
                                    className="flex w-full items-center justify-between rounded-md bg-[#F1E6E2] px-4 py-2.5 text-[11px] font-bold text-[#4A2525] transition-colors hover:bg-[#DFD8CC]"
                                >
                                    Contact Us <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* --- Main Content Area --- */}
                    <div className="w-full max-w-full flex-1 space-y-6 overflow-hidden">
                        {children}
                    </div>
                </div>
            </main>
        </ShopLayout>
    );
}
