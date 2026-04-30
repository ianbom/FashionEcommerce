import { Link } from '@inertiajs/react';
import {
    Search, ChevronDown, Package, Check, Truck, ChevronLeft, ChevronRight
} from 'lucide-react';
import React, { useState } from 'react';
import ProfileLayout from '@/layouts/profile-layout';

// --- Dummy Data ---
const TABS = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending-payment', label: 'Pending Payment' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
];

const ORDERS = [
    {
        id: 'AS24051578',
        date: '15 May 2024',
        time: '10:32 AM',
        paymentStatus: 'Pending Payment',
        orderStatus: 'Pending Payment',
        total: 1128000,
        items: [
            { id: 1, title: 'Najran Piping Lace Abaya', color: 'Off White', size: 'M', qty: 1, image: '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp' },
            { id: 2, title: 'Sila Scarf', color: 'Sand Beige', size: 'Standard', qty: 1, image: '/img/ainur-iman-qcNmigFPTQM-unsplash.webp' },
        ],
        extraItems: 1
    },
    {
        id: 'AS24051322',
        date: '13 May 2024',
        time: '02:15 PM',
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        total: 799000,
        items: [
            { id: 1, title: 'Kufah Khimar', color: 'Taupe', size: 'M', qty: 1, image: '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webpp' },
            { id: 2, title: 'Sila Scarf', color: 'Sand Beige', size: 'Standard', qty: 1, image: '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp' },
        ],
        extraItems: 0
    },
    {
        id: 'AS24051011',
        date: '10 May 2024',
        time: '09:48 AM',
        paymentStatus: 'Paid',
        orderStatus: 'Shipped',
        total: 1287000,
        items: [
            { id: 1, title: 'Najran Piping Lace Abaya', color: 'Off White', size: 'M', qty: 1, image: '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp' },
            { id: 2, title: 'Kufah Khimar', color: 'Taupe', size: 'M', qty: 1, image: '/img/khaled-ghareeb-n84s3jgzhKk-unsplash.webp' },
        ],
        extraItems: 2,
        timeline: { step: 3, dates: ['10 May', '11 May', '12 May', 'Est. 16 May'] }
    },
    {
        id: 'AS24050544',
        date: '5 May 2024',
        time: '11:20 AM',
        paymentStatus: 'Paid',
        orderStatus: 'Delivered',
        total: 598000,
        items: [
            { id: 1, title: 'Zahra Dress', color: 'Mauve', size: 'M', qty: 1, image: '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp' },
        ],
        extraItems: 0
    },
    {
        id: 'AS24050190',
        date: '1 May 2024',
        time: '04:05 PM',
        paymentStatus: 'Refunded',
        orderStatus: 'Cancelled',
        total: 299000,
        items: [
            { id: 1, title: 'Sila Scarf', color: 'Muted Blush', size: 'Standard', qty: 1, image: '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.webp' },
        ],
        extraItems: 0
    }
];

// --- Helpers ---
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price).replace('Rp', 'Rp ');
};

const getBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending payment': return 'bg-orange-100 text-orange-700';
        case 'paid': return 'bg-green-100 text-green-700';
        case 'processing': return 'bg-blue-100 text-blue-700';
        case 'shipped': return 'bg-purple-100 text-purple-700';
        case 'delivered': return 'bg-emerald-100 text-emerald-700';
        case 'cancelled': return 'bg-red-100 text-red-700';
        case 'refunded': return 'bg-gray-200 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

export default function ListOrder() {
    const [activeTab, setActiveTab] = useState('all');
    // Set to true to see the empty state
    const [isEmpty] = useState(false);

    const filteredOrders = activeTab === 'all'
        ? ORDERS
        : ORDERS.filter(o => o.orderStatus.toLowerCase() === activeTab.replace('-', ' '));

    return (
        <ProfileLayout
            title="My Orders"
            pageTitle="My Orders"
            subtitle="Track and manage your recent purchases."
            activePath="list-order"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'My Orders' }
            ]}
        >

            {/* Search & Sort Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A89F91]" />
                    <input
                        type="text"
                        placeholder="Search by order number or product name"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE8E3] rounded-xl text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all shadow-sm"
                    />
                </div>
                <div className="hidden md:flex relative w-[200px]">
                    <select className="w-full px-4 py-3 bg-white border border-[#EAE8E3] rounded-xl text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] shadow-sm">
                        <option>Newest First</option>
                        <option>Oldest First</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-[#EAE8E3] mb-6">
                <div className="flex space-x-6 px-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-[13px] font-medium whitespace-nowrap transition-all relative ${activeTab === tab.id ? 'text-[#3C3428]' : 'text-[#8C8578] hover:text-[#4A4A4A]'}`}
                        >
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2AA92] rounded-t-full"></div>
                            )}
                            <span className={activeTab === tab.id ? 'bg-[#C2AA92] text-white px-3 py-1.5 rounded-full text-xs shadow-sm' : 'px-1'}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Empty State --- */}
            {isEmpty || filteredOrders.length === 0 ? (
                <div className="bg-white border border-[#EAE8E3] rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in-up">
                    <div className="w-48 h-48 mb-6 relative">
                        <div className="absolute inset-0 bg-[#F5F2E6] rounded-full blur-2xl opacity-50"></div>
                        <img src="/img/hasan-almasi-_X2UAmIcpko-unsplash.webp" alt="Emwebp Box" className="w-full h-full object-cover rounded-xl shadow-lg relative z-10" />
                    </div>
                    <h2 className="text-2xl font-serif text-[#3C3428] mb-2">No orders yet</h2>
                    <p className="text-[13px] text-[#8C8578] mb-8 max-w-[280px]">You haven't placed any orders yet. Start exploring our collection.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/list" className="px-8 py-3 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-lg hover:bg-[#2D261C] hover:shadow-lg transition-all active:scale-[0.98]">
                            Shop Now
                        </Link>
                        <Link href="/list" className="px-8 py-3 bg-white border border-[#EAE8E3] text-[#3C3428] text-[12px] font-bold tracking-wider rounded-lg hover:border-[#C4BDB1] hover:bg-[#FAF9F6] transition-all">
                            Browse New Arrivals
                        </Link>
                    </div>
                </div>
            ) : (
                /* --- Order List --- */
                <div className="space-y-6">
                    {filteredOrders.map((order, idx) => (
                        <div
                            key={order.id}
                            className="bg-white border border-[#EAE8E3] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            {/* Order Card Header */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 md:p-6 border-b border-[#EAE8E3]/60 bg-[#FAF9F6]/50">
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-[13px] font-serif text-[#333333] mb-1">Order #{order.id}</p>
                                    <p className="text-[11px] text-[#8C8578]">{order.date} • {order.time}</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[10px] text-[#8C8578] mb-1">Payment</p>
                                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md ${getBadgeStyle(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[10px] text-[#8C8578] mb-1">Total</p>
                                    <p className="text-[14px] font-serif text-[#333333]">{formatPrice(order.total)}</p>
                                </div>
                                <div className="col-span-2 md:col-span-1 text-left md:text-right flex flex-col justify-center items-start md:items-end">
                                    <p className="text-[10px] text-[#8C8578] mb-1 hidden md:block">Order Status</p>
                                    <span className={`inline-block px-3 py-1.5 text-[11px] font-bold rounded-md ${getBadgeStyle(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Order Card Body */}
                            <div className="p-5 md:p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">

                                {/* Items Preview (Desktop: detailed, Mobile: thumbnails only) */}
                                <div className="flex-1 flex gap-4 w-full overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4 min-w-[200px] md:min-w-0">
                                            <div className="w-[80px] h-[100px] rounded-lg overflow-hidden bg-[#F5F2E6] flex-shrink-0">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="py-1 hidden md:block pr-4">
                                                <h4 className="text-[13px] font-semibold text-[#333333] mb-1 truncate max-w-[150px]">{item.title}</h4>
                                                <p className="text-[11px] text-[#8C8578] mb-1">{item.color} • {item.size}</p>
                                                <p className="text-[11px] text-[#8C8578]">Qty: {item.qty}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.extraItems > 0 && (
                                        <div className="w-[80px] h-[100px] rounded-lg bg-[#FAF9F6] border border-[#EAE8E3] flex flex-col items-center justify-center text-[#8C8578] flex-shrink-0">
                                            <span className="text-lg font-serif italic text-[#3C3428]">+{order.extraItems}</span>
                                            <span className="text-[10px]">more item{order.extraItems > 1 && 's'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full lg:w-[200px] flex flex-row lg:flex-col gap-3 flex-shrink-0 mt-4 lg:mt-0">
                                    {order.orderStatus === 'Pending Payment' && (
                                        <Link href="/checkout" className="flex-1 lg:w-full py-2.5 bg-[#3C3428] text-center text-white text-[12px] font-bold rounded-lg hover:bg-[#2D261C] transition-colors shadow-md shadow-[#3C3428]/20">
                                            Pay Now
                                        </Link>
                                    )}
                                    {order.orderStatus === 'Shipped' && (
                                        <Link href="/my-order/detail" className="flex-1 lg:w-full py-2.5 bg-[#3C3428] text-center text-white text-[12px] font-bold rounded-lg hover:bg-[#2D261C] transition-colors shadow-md shadow-[#3C3428]/20">
                                            Track Order
                                        </Link>
                                    )}
                                    {order.orderStatus === 'Delivered' && (
                                        <Link href="/detail" className="flex-1 lg:w-full py-2.5 bg-[#3C3428] text-center text-white text-[12px] font-bold rounded-lg hover:bg-[#2D261C] transition-colors shadow-md shadow-[#3C3428]/20">
                                            Review Product
                                        </Link>
                                    )}

                                    {order.orderStatus === 'Processing' && (
                                        <button className="flex-1 lg:w-full py-2.5 bg-white border border-[#EAE8E3] text-[#EF4444] text-[12px] font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
                                            Cancel Order
                                        </button>
                                    )}

                                    <Link href={order.orderStatus === 'Delivered' ? '/list' : '/my-order/detail'} className="flex-1 lg:w-full py-2.5 bg-white border border-[#EAE8E3] text-center text-[#3C3428] text-[12px] font-bold rounded-lg hover:bg-[#FAF9F6] hover:border-[#C4BDB1] transition-colors">
                                        {order.orderStatus === 'Delivered' ? 'Buy Again' : 'View Details'}
                                    </Link>
                                </div>
                            </div>

                            {/* Optional Timeline (Only for active shipping) */}
                            {order.timeline && (
                                <div className="px-5 md:px-8 py-4 bg-[#FAF9F6] border-t border-[#EAE8E3]/60 hidden md:block">
                                    <div className="flex items-center justify-between relative z-10 max-w-[600px] mx-auto">
                                        {/* Background line */}
                                        <div className="absolute left-[5%] right-[5%] top-4 h-[2px] bg-[#EAE8E3] -z-10"></div>

                                        {/* Active line */}
                                        <div
                                            className="absolute left-[5%] top-4 h-[2px] bg-[#C2AA92] -z-10 transition-all duration-1000"
                                            style={{ width: `${((order.timeline.step - 1) / 3) * 90}%` }}
                                        ></div>

                                        {[
                                            { label: 'Order Confirmed', icon: Check, active: order.timeline.step >= 1 },
                                            { label: 'Packed', icon: Package, active: order.timeline.step >= 2 },
                                            { label: 'Shipped', icon: Truck, active: order.timeline.step >= 3 },
                                            { label: 'Delivered', icon: Check, active: order.timeline.step >= 4 },
                                        ].map((step, i) => {
                                            const Icon = step.icon;

                                            return (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-colors ${step.active
                                                        ? 'bg-[#C2AA92] border-[#C2AA92] text-white shadow-md'
                                                        : 'bg-white border-[#EAE8E3] text-[#A89F91]'
                                                        }`}>
                                                        <Icon size={14} strokeWidth={3} />
                                                    </div>
                                                    <p className={`text-[10px] font-bold mb-0.5 ${step.active ? 'text-[#3C3428]' : 'text-[#A89F91]'}`}>{step.label}</p>
                                                    <p className="text-[9px] text-[#8C8578]">{order.timeline.dates[i]}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-center pt-8 pb-4">
                        <div className="flex space-x-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#A89F91] hover:bg-white hover:text-[#3C3428] transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#3C3428] text-white font-semibold text-xs shadow-md">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#8C8578] hover:bg-white hover:text-[#3C3428] font-medium text-xs transition-colors">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#8C8578] hover:bg-white hover:text-[#3C3428] font-medium text-xs transition-colors">3</button>
                            <span className="w-8 h-8 flex items-center justify-center text-[#A89F91] text-xs">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#8C8578] hover:bg-white hover:text-[#3C3428] font-medium text-xs transition-colors">8</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#8C8578] hover:bg-white hover:text-[#3C3428] transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center pb-8">
                        <button className="px-6 py-2.5 bg-[#EAE4D9]/50 border border-[#C4BDB1]/50 text-[#4A4A4A] text-[11px] font-bold rounded-lg hover:bg-[#EAE4D9] transition-colors flex items-center">
                            Load More Orders <ChevronDown size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
