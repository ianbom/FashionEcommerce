import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Check,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Download,
    Edit3,
    FileText,
    Headphones,
    MapPin,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    Truck,
    UserRound,
    WalletCards,
    Package
} from 'lucide-react';
import type { ComponentType } from 'react';
import ProfileLayout from '@/layouts/profile-layout';

type IconComponent = ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
}>;

type StatusTone = 'green' | 'blue' | 'amber' | 'red';

const formatPrice = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

const statusExamples: Array<{ id: string; date: string; status: string; tone: StatusTone }> = [
    { id: '#ORD-2026-00126', date: '27 Apr 2026', status: 'Pending Payment', tone: 'amber' },
    { id: '#ORD-2026-00121', date: '20 Apr 2026', status: 'Delivered', tone: 'green' },
    { id: '#ORD-2026-00119', date: '10 Apr 2026', status: 'Canceled', tone: 'red' },
];

const progressSteps: Array<{ icon: IconComponent; label: string; time: string; active?: boolean; complete?: boolean }> = [
    { icon: ClipboardList, label: 'Order Placed', time: '28 Apr, 10:15 AM', complete: true },
    { icon: Check, label: 'Payment Confirmed', time: '28 Apr, 10:16 AM', complete: true },
    { icon: ShieldCheck, label: 'Order Processed', time: '28 Apr, 01:20 PM', complete: true },
    { icon: Package, label: 'Packed', time: '29 Apr, 09:40 AM', complete: true },
    { icon: Truck, label: 'Shipped', time: '29 Apr, 03:15 PM', active: true },
    { icon: Check, label: 'Delivered', time: '2 May, Est.', complete: false },
];

const orderItems = [
    {
        image: '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.webp',
        name: 'Najran Piping Lace Abaya',
        color: 'Off White',
        size: 'M',
        price: 739000,
    },
    {
        image: '/img/mina-rad-2O2cXJemDmo-unsplash.webp',
        name: 'Kufah Khimar',
        color: 'Off White',
        size: 'M',
        price: 349000,
    },
    {
        image: '/img/ainur-iman-qcNmigFPTQM-unsplash.webp',
        name: 'Sila Scarf',
        color: 'Broken White',
        size: 'Standard',
        price: 244300,
    },
];

const summaryRows = [
    { label: 'Subtotal', value: formatPrice(1332300) },
    { label: 'Shipping Cost', value: formatPrice(18000) },
    { label: 'Discount', value: `- ${formatPrice(100000)}`, danger: true },
    { label: 'Voucher / Promo', value: 'WELCOME10' },
    { label: 'Service Fee', value: formatPrice(0) },
];

function StatusPill({ children, tone = 'green' }: { children: string; tone?: StatusTone }) {
    const tones = {
        amber: 'bg-[#fff0d6] text-[#b57525]',
        blue: 'bg-[#e8f1fb] text-[#496b8f]',
        green: 'bg-[#e5f3df] text-[#537a42]',
        red: 'bg-[#fde8e2] text-[#b7604f]',
    };

    return <span className={`inline-flex rounded px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function SmallIconButton({ icon: Icon, label, href }: { icon: IconComponent; label: string; href?: string }) {
    const className =
        'inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#e5d7ca] bg-white px-5 text-[12px] font-semibold text-[#4a392c] transition hover:border-[#c9a983] hover:bg-[#fbf4ed]';

    if (href) {
        return (
            <Link href={href} className={className}>
                <Icon size={15} strokeWidth={1.7} />
                {label}
            </Link>
        );
    }

    return (
        <button type="button" className={className}>
            <Icon size={15} strokeWidth={1.7} />
            {label}
        </button>
    );
}

function InfoLine({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
    return (
        <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-3 text-[12px] leading-relaxed">
            <Icon className="mt-0.5 text-[#9b8777]" size={15} strokeWidth={1.65} />
            <span className="text-[#8b7b6e]">{label}</span>
            <span className="font-semibold text-[#3f3025]">{value}</span>
        </div>
    );
}

export default function DetailOrder() {
    return (
        <ProfileLayout
            title="Order Detail"
            pageTitle="Order Detail"
            subtitle="View your order information, shipment progress, and payment summary."
            activePath="list-order"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'My Orders', href: '/my-order' },
                { label: 'Order Detail' }
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {/* Main Order Content */}
                <div className="space-y-6">
                    <section className="bg-white border border-[#EAE8E3] rounded-2xl p-5 sm:p-6 shadow-sm">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(130px,0.9fr)_minmax(110px,0.65fr)_minmax(110px,0.65fr)_minmax(120px,0.65fr)]">
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Order Number</p>
                                <h2 className="mt-1 font-serif text-[24px] leading-none text-[#2d2119]">#ORD-2026-00125</h2>
                                <p className="mt-2 text-[12px] font-medium text-[#7f6d60]">28 April 2026</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Payment Method</p>
                                <p className="mt-2 text-[13px] font-semibold text-[#3d3027]">Virtual Account</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Payment Status</p>
                                <div className="mt-2">
                                    <StatusPill>Paid</StatusPill>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Order Status</p>
                                <div className="mt-2">
                                    <StatusPill tone="blue">Shipped</StatusPill>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Est. Arrival</p>
                                <p className="mt-2 text-[13px] font-semibold text-[#3d3027]">2 May 2026</p>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <Link
                                href="/my-order/detail"
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#2f2016] px-5 text-[12px] font-semibold text-white transition hover:bg-[#4a3324]"
                            >
                                <Truck size={15} strokeWidth={1.7} />
                                Track Order
                            </Link>
                            <SmallIconButton href="/list" icon={RefreshCcw} label="Buy Again" />
                            <SmallIconButton icon={Download} label="Download Invoice" />
                            <SmallIconButton icon={Headphones} label="Contact Support" />
                        </div>
                    </section>

                    <section className="bg-white border border-[#EAE8E3] rounded-2xl p-5 sm:p-6 shadow-sm">
                        <h2 className="font-serif text-[22px] text-[#2d2119]">Order Progress</h2>
                        <div className="mt-7 overflow-x-auto pb-1 hide-scrollbar">
                            <div className="relative grid min-w-[760px] grid-cols-6 gap-0">
                                <div className="absolute left-[8.5%] right-[8.5%] top-[22px] h-px bg-[#d8ae8f]" />
                                {progressSteps.map((step) => {
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.label} className="relative flex flex-col items-center text-center">
                                            <div
                                                className={[
                                                    'relative z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white transition-all',
                                                    step.active
                                                        ? 'border-[#2f2016] bg-[#2f2016] text-white shadow-md'
                                                        : step.complete
                                                            ? 'border-[#d4b79d] text-[#8a6b55]'
                                                            : 'border-[#e2ddd8] text-[#c6bdb4]',
                                                ].join(' ')}
                                            >
                                                <Icon size={17} strokeWidth={1.65} />
                                            </div>
                                            <p className="mt-4 text-[12px] font-bold text-[#4b3a2d]">{step.label}</p>
                                            <p className="mt-1 text-[11px] font-medium text-[#867366]">{step.time}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-[#EAE8E3] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-5 pb-3 sm:p-6 sm:pb-4">
                            <h2 className="font-serif text-[22px] text-[#2d2119]">Ordered Items</h2>
                        </div>
                        <div className="overflow-x-auto px-5 pb-5 sm:px-6 hide-scrollbar">
                            <table className="w-full min-w-[840px] border-collapse overflow-hidden rounded-[10px] text-left text-[12px]">
                                <thead>
                                    <tr className="bg-[#f5ebe3] text-[#6d5c50]">
                                        <th className="w-[38%] px-4 py-3 font-semibold rounded-tl-lg">Item</th>
                                        <th className="px-4 py-3 font-semibold">Details</th>
                                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                                        <th className="px-4 py-3 text-center font-semibold">Qty</th>
                                        <th className="px-4 py-3 text-right font-semibold rounded-tr-lg">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eee3da] border-x border-b border-[#eee3da] rounded-b-lg">
                                    {orderItems.map((item) => (
                                        <tr key={item.name} className="bg-white align-middle group hover:bg-[#FAF9F6] transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Link href="/detail" className="h-[74px] w-[74px] overflow-hidden rounded-[8px] bg-[#f4ebe4] flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-top" />
                                                    </Link>
                                                    <div>
                                                        <Link href="/detail" className="font-bold text-[13px] text-[#3d3027] transition hover:text-[#8f684b]">
                                                            {item.name}
                                                        </Link>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            <SmallIconButton href="/detail" icon={ReceiptText} label="Review" />
                                                            <SmallIconButton href="/list" icon={RefreshCcw} label="Buy Again" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[#6d5c50]">
                                                <p>Color: <span className="font-semibold text-[#3d3027]">{item.color}</span></p>
                                                <p className="mt-2">Size: <span className="font-semibold text-[#3d3027]">{item.size}</span></p>
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-[#3d3027]">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-4 text-center font-semibold text-[#3d3027]">1</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[#3d3027]">{formatPrice(item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-5 flex justify-center">
                                <SmallIconButton href="/list" icon={RefreshCcw} label="Buy All Again" />
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="bg-white border border-[#EAE8E3] rounded-2xl p-5 shadow-sm">
                            <h2 className="font-serif text-[20px] text-[#2d2119]">Shipping Information</h2>
                            <div className="mt-5 space-y-3">
                                <InfoLine icon={UserRound} label="Recipient" value="Siti Aisyah" />
                                <InfoLine icon={Headphones} label="Phone" value="0812 3456 789" />
                                <InfoLine icon={MapPin} label="Address" value="Jl. Melati No. 12, Coblong, Bandung, Jawa Barat 40132" />
                                <InfoLine icon={Truck} label="Courier" value="JNE Regular" />
                                <InfoLine icon={ReceiptText} label="Tracking Number" value="JNE26042800125" />
                                <InfoLine icon={FileText} label="Delivery Note" value="Leave package at front gate." />
                            </div>
                            <Link
                                href="/my-order/detail"
                                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[7px] bg-[#2f2016] text-[12px] font-semibold text-white transition hover:bg-[#4a3324]"
                            >
                                <Truck size={15} strokeWidth={1.7} />
                                Track Shipment
                            </Link>
                        </div>

                        <div className="bg-white border border-[#EAE8E3] rounded-2xl p-5 shadow-sm">
                            <h2 className="font-serif text-[20px] text-[#2d2119]">Payment Information</h2>
                            <div className="mt-5 space-y-3">
                                <InfoLine icon={CreditCard} label="Method" value="BCA Virtual Account" />
                                <InfoLine icon={ReceiptText} label="Transaction ID" value="TRX-2026-0428-8841" />
                                <InfoLine icon={ClipboardList} label="Payment Date" value="28 April 2026, 10:15 AM" />
                                <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-3 text-[12px] leading-relaxed">
                                    <WalletCards className="mt-0.5 text-[#9b8777]" size={15} strokeWidth={1.65} />
                                    <span className="text-[#8b7b6e]">Payment Status</span>
                                    <StatusPill>Paid</StatusPill>
                                </div>
                            </div>
                            <div className="mt-5 flex gap-3 rounded-[10px] bg-[#e8f4df] p-4 text-[#587b47]">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#9fc28b]">
                                    <Check size={15} strokeWidth={1.7} />
                                </div>
                                <p className="text-[12px] font-semibold leading-5">Your payment has been received successfully.</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <section className="bg-white border border-[#EAE8E3] rounded-2xl p-5 shadow-sm">
                        <h2 className="font-serif text-[22px] text-[#2d2119]">Order Summary</h2>
                        <div className="mt-6 space-y-4">
                            {summaryRows.map((row) => (
                                <div key={row.label} className="flex items-center justify-between text-[13px]">
                                    <span className="text-[#6f5e52]">{row.label}</span>
                                    <span className={row.danger ? 'font-semibold text-[#c45745]' : 'font-semibold text-[#3d3027]'}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-7 border-t border-[#eee3da] pt-6">
                            <p className="text-[13px] font-semibold text-[#7b6758]">Total Payment</p>
                            <p className="mt-2 font-serif text-[32px] leading-none text-[#221914]">{formatPrice(1250300)}</p>
                            <p className="mt-2 text-[11px] font-medium text-[#8b7b6e]">Inclusive of VAT</p>
                        </div>
                    </section>

                    <section className="bg-white border border-[#EAE8E3] rounded-2xl p-5 shadow-sm">
                        <h2 className="font-serif text-[20px] text-[#2d2119]">Invoice & Documents</h2>
                        <div className="mt-5 text-[12px]">
                            <p className="text-[#8b7b6e]">Invoice No.</p>
                            <p className="mt-1 font-bold text-[13px] text-[#3d3027]">INV-2026-00125</p>
                        </div>
                        <div className="mt-5 space-y-3">
                            <SmallIconButton icon={Download} label="Download Invoice" />
                            <SmallIconButton icon={FileText} label="Payment Receipt" />
                        </div>
                        <p className="mt-6 text-[11px] leading-5 text-[#817065]">Documents are available for download until 28 July 2026.</p>
                    </section>

                    <section className="bg-white border border-[#EAE8E3] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="font-serif text-[20px] text-[#2d2119]">Order Notes</h2>
                            <button type="button" aria-label="Edit order note" className="text-[#8c7462] transition hover:text-[#34251b]">
                                <Edit3 size={16} strokeWidth={1.6} />
                            </button>
                        </div>
                        <p className="mt-3 text-[12px] leading-5 text-[#716155] italic border-l-2 border-[#EAE8E3] pl-3">"Please deliver in the afternoon if possible."</p>
                    </section>
                </aside>
            </div>
        </ProfileLayout>
    );
}
