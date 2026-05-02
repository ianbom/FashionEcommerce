import React from 'react';
import ProfileLayout from '@/layouts/profile-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Truck,
    Check,
    Package,
    ChevronRight,
    ArrowLeft,
    ExternalLink,
    Trash2,
    Bell,
    Clock,
    Star,
    ShoppingBag,
    Calendar,
    Barcode,
    Info,
    CreditCard,
    Tag,
    Gift
} from 'lucide-react';

export default function DetailNotification() {
    return (
        <ProfileLayout
            title={
                <div className="flex flex-col items-start">
                    <Link
                        href="/notifications"
                        className="mb-4 flex items-center font-sans text-sm not-italic text-[#3C3428] transition-colors hover:text-black group"
                    >
                        <ArrowLeft
                            size={16}
                            className="mr-2 transition-transform group-hover:-translate-x-1"
                        />
                        Back to Notifications
                    </Link>
                    <span>Notification Detail</span>
                </div>
            }
            pageTitle="Notification Detail"
            subtitle="Review the full details of your latest update."
            activePath="notifications"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Notifications', href: '/notifications' },
                { label: 'Notification Detail' },
            ]}
        >
            <div className="flex flex-col gap-6 lg:flex-row">
                {/* --- Left Column --- */}
                <div className="flex min-w-0 flex-1 flex-col space-y-6">
                    {/* Shipping Card */}
                    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#EAE8E3] bg-[#FAF8F5] p-6 shadow-sm transition-all hover:shadow-md md:flex-row md:items-start">
                        <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAE4D9] text-[#8C5A41]">
                                    <Truck size={24} />
                                </div>
                                <div className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#FAF8F5] bg-[#8C5A41]"></div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs font-semibold text-[#8C5A41]">
                                    Shipping
                                </p>
                                <h2 className="mb-2 font-serif text-lg text-[#3C3428] md:text-xl">
                                    Your order #ORD-2026-00125 has been shipped
                                </h2>
                                <div className="flex items-center text-xs text-[#8C8578]">
                                    <Clock size={14} className="mr-1" /> Today,
                                    10:24 AM
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                            <span className="rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-semibold text-[#D46B5A]">
                                Unread
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-[#FDF5ED] px-3 py-1 text-xs font-semibold text-[#D98C4A]">
                                <Star size={12} fill="currentColor" /> Important
                            </span>
                        </div>
                    </div>

                    {/* Message Details */}
                    <div className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                        <h3 className="mb-3 font-serif text-xl text-[#3C3428]">
                            Message Details
                        </h3>
                        <p className="mb-6 leading-relaxed text-[#5C564D] text-sm">
                            Good news! Your order has been shipped and is now on
                            its way to you. You can track your package in
                            real-time using the tracking number below. Thank you
                            for shopping with Auréa Syar'i.
                        </p>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-[#EAE8E3] pt-6 md:grid-cols-2">
                            {/* Item 1 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Order Number
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        #ORD-2026-00125
                                    </p>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Shipping Status
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        In Transit
                                    </p>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <Package size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Courier Name
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        JNE Regular
                                    </p>
                                </div>
                            </div>
                            {/* Item 4 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Estimated Delivery Date
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        2 May 2026
                                    </p>
                                </div>
                            </div>
                            {/* Item 5 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <Barcode size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Tracking Number
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        JNE202600125
                                    </p>
                                </div>
                            </div>
                            {/* Item 6 */}
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8C8578]">
                                    <Info size={18} />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs text-[#8C8578]">
                                        Latest Update
                                    </p>
                                    <p className="text-sm font-semibold text-[#3C3428]">
                                        Shipment picked up by courier
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/notifications"
                            className="flex items-center gap-2 rounded-lg border border-[#EAE8E3] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]"
                        >
                            <ArrowLeft size={16} /> Back to Notifications
                        </Link>
                        <button className="flex items-center gap-2 rounded-lg border border-[#EAE8E3] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]">
                            <Check size={16} /> Mark as Read
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50">
                            <Trash2 size={16} /> Delete Notification
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-[#EAE8E3] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]">
                            <Package size={16} /> View Order
                        </button>
                        <button className="ml-auto flex items-center gap-2 rounded-lg bg-[#3C3428] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2A241C]">
                            <Truck size={16} /> Track Shipment
                        </button>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="flex w-full flex-shrink-0 flex-col space-y-6 lg:w-[320px] xl:w-[360px]">
                    {/* Related Information */}
                    <div className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 font-serif text-lg text-[#3C3428]">
                            Related Information
                        </h3>
                        <div className="mb-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-[#8C8578]">
                                    <Truck size={14} className="mr-2" /> Courier
                                </div>
                                <span className="font-medium text-[#3C3428]">
                                    JNE Regular
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-[#8C8578]">
                                    <Barcode size={14} className="mr-2" />{' '}
                                    Tracking Number
                                </div>
                                <span className="font-medium text-[#3C3428]">
                                    JNE202600125
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-[#8C8578]">
                                    <Truck size={14} className="mr-2" />{' '}
                                    Shipping Progress
                                </div>
                                <span className="font-medium text-[#D98C4A]">
                                    In Transit
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-[#8C8578]">
                                    <Calendar size={14} className="mr-2" />{' '}
                                    Estimated Delivery
                                </div>
                                <span className="font-medium text-[#3C3428]">
                                    2 May 2026
                                </span>
                            </div>
                        </div>
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3C3428] py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2A241C]">
                            Track Order <ExternalLink size={16} />
                        </button>
                    </div>

                    {/* Activity Timeline */}
                    <div className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                        <h3 className="mb-6 font-serif text-lg text-[#3C3428]">
                            Activity Timeline
                        </h3>
                        <div className="relative ml-2 space-y-7 border-l border-[#EAE8E3]">
                            {/* Timeline item 1 */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[7px] top-1 h-[14px] w-[14px] rounded-full border-2 border-[#C2AA92] bg-white"></div>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-[#3C3428]">
                                        Order Confirmed
                                    </p>
                                    <p className="text-xs text-[#8C8578]">
                                        28 Apr, 10:15 AM
                                    </p>
                                </div>
                            </div>
                            {/* Timeline item 2 */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[7px] top-1 h-[14px] w-[14px] rounded-full border-2 border-[#C2AA92] bg-white"></div>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-[#3C3428]">
                                        Payment Received
                                    </p>
                                    <p className="text-xs text-[#8C8578]">
                                        28 Apr, 10:16 AM
                                    </p>
                                </div>
                            </div>
                            {/* Timeline item 3 */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[7px] top-1 h-[14px] w-[14px] rounded-full border-2 border-[#C2AA92] bg-white"></div>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-[#3C3428]">
                                        Packed
                                    </p>
                                    <p className="text-xs text-[#8C8578]">
                                        29 Apr, 09:40 AM
                                    </p>
                                </div>
                            </div>
                            {/* Timeline item 4 (Current) */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 h-[18px] w-[18px] rounded-full border-[4px] border-[#FAF8F5] bg-[#3C3428] shadow-[0_0_0_1px_#3C3428]"></div>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-bold text-[#3C3428]">
                                        Shipped
                                    </p>
                                    <p className="text-xs font-bold text-[#3C3428]">
                                        29 Apr, 10:24 AM
                                    </p>
                                </div>
                            </div>
                            {/* Timeline item 5 (Future) */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[7px] top-1 h-[14px] w-[14px] rounded-full border-2 border-[#EAE8E3] bg-white"></div>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-[#8C8578]">
                                        Delivered
                                    </p>
                                    <p className="text-xs text-[#8C8578]">
                                        2 May, Est.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
}
