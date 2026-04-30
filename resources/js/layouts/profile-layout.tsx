import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    LayoutDashboard, User, ShoppingBag, Heart, MapPin, CreditCard, 
    Bell, LogOut, ChevronRight 
} from 'lucide-react';
import ShopLayout from '@/Layouts/shop-layout';

const SIDEBAR_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-profile', label: 'Profile Settings', mobileLabel: 'Profile', icon: User },
    { id: 'list-order', label: 'My Orders', mobileLabel: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'address', label: 'Address Book', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

interface Breadcrumb {
    label: string;
    href?: string;
}

interface ProfileLayoutProps {
    children: React.ReactNode;
    title: string;
    pageTitle: string; // Used for <Head>
    subtitle: string;
    activePath: string; // Should match one of the SIDEBAR_NAV ids
    breadcrumbs: Breadcrumb[];
}

export default function ProfileLayout({ children, title, pageTitle, subtitle, activePath, breadcrumbs }: ProfileLayoutProps) {
    return (
        <ShopLayout>
            <Head title={`${pageTitle} - Webcare`} />

            {/* --- Hero / Header Section --- */}
            <div className="relative w-full h-[200px] md:h-[280px] bg-[#EAE8E3] overflow-hidden flex items-center">
                {/* Background Image / Pattern */}
                <div className="absolute inset-0 z-0">
                    <img src="/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg" alt="Hero Background" className="w-full h-full object-cover opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent"></div>
                </div>
                
                <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 relative z-10">
                    <div className="flex items-center space-x-2 text-[10px] md:text-xs text-[#8C8578] mb-4 font-medium tracking-wide">
                        {breadcrumbs.map((bc, idx) => (
                            <React.Fragment key={idx}>
                                {bc.href ? (
                                    <>
                                        <Link href={bc.href} className="hover:text-black transition-colors">{bc.label}</Link>
                                        <span>/</span>
                                    </>
                                ) : (
                                    <span className="text-[#333333]">{bc.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-[#3C3428] mb-2">{title}</h1>
                    <p className="text-xs md:text-sm text-[#8C8578]">{subtitle}</p>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 bg-[#FAF9F6] min-h-screen -mt-10 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* --- Sidebar (Desktop) / Horizontal Nav (Mobile) --- */}
                    <div className="w-full lg:w-[240px] flex-shrink-0">
                        {/* Mobile Horizontal Nav */}
                        <div className="lg:hidden flex overflow-x-auto hide-scrollbar space-x-2 mb-6 pb-2">
                            {SIDEBAR_NAV.slice(0, 4).map(item => {
                                const Icon = item.icon;
                                const isActive = item.id === activePath;
                                return (
                                    <Link key={item.id} href={`/${item.id}`} className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border ${isActive ? 'bg-[#FAF8F5] border-[#C2AA92] text-[#3C3428] shadow-sm' : 'bg-white border-[#EAE8E3] text-[#8C8578] hover:border-[#C4BDB1]'}`}>
                                        <Icon size={20} className="mb-2" />
                                        <span className="text-[10px] font-semibold">{item.mobileLabel || item.label}</span>
                                    </Link>
                                );
                            })}
                            <div className="flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border bg-white border-[#EAE8E3] text-[#8C8578]">
                                <span className="text-xl mb-1 leading-none">...</span>
                                <span className="text-[10px] font-semibold">More</span>
                            </div>
                        </div>

                        {/* Desktop Sidebar Nav */}
                        <div className="hidden lg:block bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-2xl p-3 mb-6 shadow-sm">
                            {SIDEBAR_NAV.map(item => {
                                const Icon = item.icon;
                                const isActive = item.id === activePath;
                                return (
                                    <Link 
                                        key={item.id} 
                                        href={`/${item.id}`} 
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl mb-1 transition-all ${isActive ? 'bg-[#EAE4D9] text-[#3C3428] font-semibold' : 'text-[#8C8578] hover:bg-[#F5F2E6] hover:text-[#3C3428]'}`}
                                    >
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[13px]">{item.label}</span>
                                    </Link>
                                );
                            })}
                            <div className="h-px bg-[#EAE8E3] my-2 mx-2"></div>
                            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#8C8578] hover:bg-red-50 hover:text-red-600 transition-all">
                                <LogOut size={18} />
                                <span className="text-[13px]">Logout</span>
                            </button>
                        </div>

                        {/* Need Help Card (Desktop) */}
                        <div className="hidden lg:flex flex-col bg-white border border-[#EAE8E3] rounded-2xl overflow-hidden shadow-sm">
                            <div className="h-40 bg-[#F5F2E6] relative">
                                <img src="/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg" alt="Support" className="w-full h-full object-cover object-top" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                            <div className="p-5 pt-0 relative z-10 -mt-6">
                                <h3 className="text-lg font-serif text-[#3C3428] mb-2">Need Help?</h3>
                                <p className="text-[11px] text-[#8C8578] mb-4">We're here to assist you with any questions.</p>
                                <button className="w-full flex items-center justify-between px-4 py-2.5 bg-[#EAE4D9] text-[#3C3428] text-[11px] font-bold rounded-md hover:bg-[#DFD8CC] transition-colors">
                                    Contact Us <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Main Content Area --- */}
                    <div className="flex-1 w-full max-w-full overflow-hidden space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </ShopLayout>
    );
}
