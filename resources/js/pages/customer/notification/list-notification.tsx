import { Link, router } from '@inertiajs/react';
import { Bell, Package, Tag, Check, Truck, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ProfileLayout from '@/layouts/profile-layout';

// Helper to render heart icon as it wasn't directly imported
function HeartIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}

type NotificationItem = {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    is_read: boolean;
};

type Props = {
    notifications: {
        data: NotificationItem[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
};

const notificationTypeConfig: Record<
    string,
    { icon: React.ComponentType<any>; color: string }
> = {
    order: { icon: Package, color: 'bg-emerald-100 text-emerald-600' },
    payment: { icon: Check, color: 'bg-emerald-100 text-emerald-600' },
    promo: { icon: Tag, color: 'bg-orange-100 text-orange-600' },
    shipping: { icon: Truck, color: 'bg-blue-100 text-blue-600' },
    system: { icon: Star, color: 'bg-[#F8EDED] text-[#B6574B]' },
    wishlist: { icon: HeartIcon, color: 'bg-pink-100 text-pink-600' },
};

export default function ListNotification({ notifications }: Props) {
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const items = useMemo(
        () =>
            notifications.data.map((notification) => ({
                ...notification,
                isRead: notification.is_read,
                ...(notificationTypeConfig[notification.type] ?? {
                    icon: Bell,
                    color: 'bg-[#F8EDED] text-[#B6574B]',
                }),
            })),
        [notifications.data],
    );

    const unreadCount = items.filter((n) => !n.isRead).length;

    const filteredNotifications = items.filter((n) => {
        if (activeTab === 'unread') {
            return !n.isRead;
        }

        return true;
    });

    const markAllAsRead = () => {
        router.post(
            '/notifications/read-all',
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const markAsRead = (id: number) => {
        const target = items.find((notification) => notification.id === id);

        if (!target || target.isRead) {
            return;
        }

        router.post(
            `/notifications/${id}/read`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <ProfileLayout
            title="Notifications"
            pageTitle="Notifications"
            subtitle="Stay updated with your orders and exclusive offers."
            activePath="notifications"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Notifications' },
            ]}
        >
            <div
                className="animate-fade-in-up mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: '100ms' }}
            >
                <div className="flex w-fit space-x-2 rounded-lg border border-[#EADBD8] bg-white p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`rounded-md px-4 py-2 text-[13px] font-medium transition-all ${
                            activeTab === 'all'
                                ? 'bg-[#F8EDED] text-[#4A2525] shadow-sm'
                                : 'text-[#8A6B62] hover:text-[#4A2525]'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`flex items-center rounded-md px-4 py-2 text-[13px] font-medium transition-all ${
                            activeTab === 'unread'
                                ? 'bg-[#F8EDED] text-[#4A2525] shadow-sm'
                                : 'text-[#8A6B62] hover:text-[#4A2525]'
                        }`}
                    >
                        Unread
                        {unreadCount > 0 && (
                            <span className="ml-2 rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center text-[12px] font-semibold text-[#4A2525] transition-colors hover:text-[#B6574B]"
                    >
                        <Check size={14} className="mr-1.5" /> Mark all as read
                    </button>
                )}
            </div>

            {/* --- Empty State --- */}
            {filteredNotifications.length === 0 ? (
                <div
                    className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-[#EADBD8] bg-white px-6 py-20 text-center"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#F8EDED] opacity-60 blur-xl"></div>
                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#EADBD8] bg-[#FAF9F6] shadow-sm">
                            <Bell size={28} className="text-[#C99A8F]" />
                        </div>
                    </div>
                    <h2 className="mb-2 font-serif text-xl text-[#4A2525]">
                        No notifications yet
                    </h2>
                    <p className="mb-8 max-w-[280px] text-[13px] text-[#8A6B62]">
                        {activeTab === 'unread'
                            ? "You've read all your notifications."
                            : "When you get updates on your orders or exclusive offers, they'll show up here."}
                    </p>
                    <Link href="/">
                        <button className="rounded-lg bg-[#4A2525] px-8 py-3 text-[12px] font-bold tracking-wider text-white transition-all hover:bg-[#5F1717] hover:shadow-lg active:scale-[0.98]">
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            ) : (
                /* --- Notification List --- */
                <div
                    className="animate-fade-in-up overflow-hidden rounded-2xl border border-[#EADBD8] bg-white shadow-sm"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="divide-y divide-[#EADBD8]">
                        {filteredNotifications.map((notification) => {
                            const IconComponent = notification.icon;

                            return (
                                <Link
                                    key={notification.id}
                                    href={`/notifications/${notification.id}`}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`group relative flex items-start gap-4 p-5 transition-all duration-300 hover:bg-[#FAF9F6] md:p-6 ${!notification.isRead ? 'bg-[#FAF9F6]/50' : 'bg-white'}`}
                                >
                                    {/* Unread indicator line */}
                                    {!notification.isRead && (
                                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#B6574B]"></div>
                                    )}

                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full md:h-12 md:w-12 ${notification.color}`}
                                    >
                                        <IconComponent
                                            size={20}
                                            className="md:h-6 md:w-6"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1 pr-4">
                                        <div className="mb-1 flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                            <h3
                                                className={`truncate text-[14px] font-bold md:text-[15px] ${!notification.isRead ? 'text-[#4A2525]' : 'text-[#4A4A4A]'}`}
                                            >
                                                {notification.title}
                                            </h3>
                                            <span className="mt-1 flex-shrink-0 text-[11px] whitespace-nowrap text-[#8A6B62] sm:mt-0">
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[12px] leading-relaxed md:text-[13px] ${!notification.isRead ? 'font-medium text-[#4A4A4A]' : 'text-[#8A6B62]'}`}
                                        >
                                            {notification.message}
                                        </p>
                                    </div>

                                    {!notification.isRead && (
                                        <div className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
