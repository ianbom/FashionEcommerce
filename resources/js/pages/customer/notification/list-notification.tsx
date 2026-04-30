import { Link } from '@inertiajs/react';
import { Bell, Package, Tag, Check, Truck, Star } from 'lucide-react';
import React, { useState } from 'react';
import ProfileLayout from '@/layouts/profile-layout';

// --- Dummy Data ---
const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #AS24050544 has been delivered to your address. We hope you enjoy your purchase!',
        time: 'Just now',
        isRead: false,
        icon: Package,
        color: 'bg-emerald-100 text-emerald-600'
    },
    {
        id: 2,
        type: 'promo',
        title: 'Weekend Flash Sale!',
        message: 'Exclusive for you: Get up to 50% off on all items in our New Arrival collection. Limited time only.',
        time: '2 hours ago',
        isRead: false,
        icon: Tag,
        color: 'bg-orange-100 text-orange-600'
    },
    {
        id: 3,
        type: 'order',
        title: 'Order Shipped',
        message: 'Good news! Your order #AS24051011 is on its way. You can track your package from the order details.',
        time: 'Yesterday',
        isRead: true,
        icon: Truck,
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 4,
        type: 'system',
        title: 'Welcome to Webcare',
        message: 'Thank you for creating an account with us. Update your profile to get personalized recommendations.',
        time: '12 May 2024',
        isRead: true,
        icon: Star,
        color: 'bg-[#F5F2E6] text-[#C2AA92]'
    },
    {
        id: 5,
        type: 'promo',
        title: 'Your wishlist is on sale',
        message: 'The "Najran Piping Lace Abaya" in your wishlist is now 20% off. Grab it before it\'s gone!',
        time: '10 May 2024',
        isRead: true,
        icon: HeartIcon,
        color: 'bg-pink-100 text-pink-600'
    }
];

// Helper to render heart icon as it wasn't directly imported
function HeartIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}


export default function ListNotification() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') {
            return !n.isRead;
        }

        return true;
    });

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    // Toggle for empty state preview
    const [isEmpty] = useState(false);

    return (
        <ProfileLayout
            title="Notifications"
            pageTitle="Notifications"
            subtitle="Stay updated with your orders and exclusive offers."
            activePath="notifications"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Notifications' }
            ]}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex space-x-2 bg-white border border-[#EAE8E3] rounded-lg p-1 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                            activeTab === 'all' 
                                ? 'bg-[#F5F2E6] text-[#3C3428] shadow-sm' 
                                : 'text-[#8C8578] hover:text-[#3C3428]'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all flex items-center ${
                            activeTab === 'unread' 
                                ? 'bg-[#F5F2E6] text-[#3C3428] shadow-sm' 
                                : 'text-[#8C8578] hover:text-[#3C3428]'
                        }`}
                    >
                        Unread
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center text-[12px] font-semibold text-[#3C3428] hover:text-[#C2AA92] transition-colors"
                    >
                        <Check size={14} className="mr-1.5" /> Mark all as read
                    </button>
                )}
            </div>

            {/* --- Empty State --- */}
            {isEmpty || filteredNotifications.length === 0 ? (
                <div className="bg-white border border-[#EAE8E3] rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#F5F2E6] rounded-full blur-xl opacity-60"></div>
                        <div className="w-16 h-16 bg-[#FAF9F6] border border-[#EAE8E3] rounded-full flex items-center justify-center relative z-10 shadow-sm">
                            <Bell size={28} className="text-[#A89F91]" />
                        </div>
                    </div>
                    <h2 className="text-xl font-serif text-[#3C3428] mb-2">No notifications yet</h2>
                    <p className="text-[13px] text-[#8C8578] mb-8 max-w-[280px]">
                        {activeTab === 'unread' 
                            ? "You've read all your notifications." 
                            : "When you get updates on your orders or exclusive offers, they'll show up here."}
                    </p>
                    <Link href="/">
                        <button className="px-8 py-3 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-lg hover:bg-[#2D261C] hover:shadow-lg transition-all active:scale-[0.98]">
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            ) : (
                /* --- Notification List --- */
                <div className="bg-white border border-[#EAE8E3] rounded-2xl overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="divide-y divide-[#EAE8E3]">
                        {filteredNotifications.map((notification) => {
                            const IconComponent = notification.icon;
                            
                            return (
                                <div 
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`p-5 md:p-6 flex items-start gap-4 transition-all duration-300 cursor-pointer group hover:bg-[#FAF9F6] relative ${!notification.isRead ? 'bg-[#FAF9F6]/50' : 'bg-white'}`}
                                >
                                    {/* Unread indicator line */}
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C2AA92]"></div>
                                    )}

                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 flex items-center justify-center ${notification.color}`}>
                                        <IconComponent size={20} className="md:w-6 md:h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                            <h3 className={`text-[14px] md:text-[15px] font-bold truncate ${!notification.isRead ? 'text-[#3C3428]' : 'text-[#4A4A4A]'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-[11px] text-[#8C8578] whitespace-nowrap mt-1 sm:mt-0 flex-shrink-0">
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className={`text-[12px] md:text-[13px] leading-relaxed ${!notification.isRead ? 'text-[#4A4A4A] font-medium' : 'text-[#8C8578]'}`}>
                                            {notification.message}
                                        </p>
                                    </div>

                                    {!notification.isRead && (
                                        <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full flex-shrink-0 mt-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
