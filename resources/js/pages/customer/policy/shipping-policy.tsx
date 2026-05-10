import { Head, Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import {
    Box,
    Calendar,
    ChevronDown,
    Clock,
    FileText,
    Mail,
    MapPin,
    MessageCircle,
    PackageCheck,
    Plane,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const sidebarItems = [
    { id: 'processing', icon: Clock, label: '1. Waktu Pemrosesan Pesanan' },
    { id: 'rates', icon: Truck, label: '2. Tarif & Estimasi Pengiriman' },
    { id: 'international', icon: Plane, label: '3. Pengiriman Internasional' },
    { id: 'tracking', icon: PackageCheck, label: '4. Status Pesanan' },
];

const sections = [
    {
        id: 'processing',
        title: 'Waktu Pemrosesan Pesanan',
        content:
            'Semua pesanan diproses dalam 1 sampai 3 hari kerja, tidak termasuk akhir pekan dan hari libur, setelah email konfirmasi pesanan diterima. Waktu pemrosesan dapat lebih lama saat musim ramai atau periode promosi.',
    },
    {
        id: 'rates',
        title: 'Tarif & Estimasi Pengiriman',
        content:
            'Biaya pengiriman dihitung dan ditampilkan saat checkout. Opsi pengiriman dapat mencakup pengiriman standar, pengiriman ekspres, dan pengiriman di hari yang sama untuk area metropolitan tertentu jika dipesan sebelum pukul 12:00.',
    },
    {
        id: 'international',
        title: 'Pengiriman Internasional',
        content:
            'Saat ini kami mengirim secara internasional ke negara tertentu. Pesanan kamu dapat dikenai bea masuk dan pajak, termasuk PPN, saat tiba di negara tujuan. Biaya tersebut menjadi tanggung jawab pelanggan.',
    },
    {
        id: 'tracking',
        title: 'Bagaimana cara cek status pesanan?',
        content:
            'Saat pesanan dikirim, kamu akan menerima notifikasi email berisi nomor pelacakan. Mohon tunggu hingga 48 jam sampai informasi pelacakan tersedia.',
    },
];

function FeatureBox({
    icon: Icon,
    title,
}: {
    icon: LucideIcon;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3 border-b border-[#eadfd4] py-4 transition duration-300 hover:border-[#cdb5a4]">
            <Icon
                size={22}
                strokeWidth={1.4}
                className="shrink-0 text-[#8b5e4c]"
            />
            <span className="text-sm leading-snug font-medium text-[#53362d] sm:text-base">
                {title}
            </span>
        </div>
    );
}

function AccordionItem({
    item,
    index,
    isLast,
}: {
    item: (typeof sections)[number];
    index: number;
    isLast: boolean;
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section
            id={item.id}
            className={`${isLast ? '' : 'border-b border-[#eadfd4]'} scroll-mt-28 py-6`}
        >
            <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${item.id}-content`}
                className="group flex w-full items-start justify-between gap-5 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex gap-4">
                    <span className="w-8 shrink-0 pt-0.5 text-sm font-semibold text-[#bc9e90]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                        <span className="block text-base font-semibold text-[#53362d] sm:text-lg">
                            {item.title}
                        </span>
                        <div
                            id={`${item.id}-content`}
                            className={`grid transition-all duration-300 ease-out ${isOpen ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <p className="max-w-3xl text-sm leading-7 text-[#846b60] sm:text-base">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    </span>
                </span>
                <ChevronDown
                    size={20}
                    className={`mt-1 shrink-0 text-[#bc9e90] transition duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-[#8b5e4c]`}
                />
            </button>
        </section>
    );
}

export default function ShippingPolicy() {
    const scrollToSection = (id: string) =>
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return (
        <ShopLayout>
            <Head title="Kebijakan Pengiriman" />
            <div className="relative w-full overflow-hidden border-b border-[#eadfd4] bg-[#fcfbf9] pt-8 pb-14 sm:pt-10 lg:pb-20">
                <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-[#f6eee7]"></div>
                <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                        <div className="max-w-2xl">
                            <div className="mb-8 flex items-center text-sm font-medium text-[#846b60]">
                                <Link
                                    href="/"
                                    className="transition-colors hover:text-[#8b5e4c]"
                                >
                                    Beranda
                                </Link>
                                <span className="mx-2 text-[#bc9e90]">/</span>
                                <span className="text-[#53362d]">
                                    Kebijakan Pengiriman
                                </span>
                            </div>
                            <p className="mb-4 inline-flex border-l border-[#8b5e4c] pl-3 text-xs font-semibold tracking-[0.22em] text-[#8b5e4c] uppercase">
                                Kebijakan Pengiriman Pelanggan
                            </p>
                            <h1 className="mb-5 max-w-xl font-serif text-4xl leading-tight text-[#53362d] md:text-5xl lg:text-6xl">
                                Kebijakan Pengiriman
                            </h1>
                            <p className="max-w-xl text-base leading-8 text-[#846b60] sm:text-lg">
                                Informasi tentang waktu pemrosesan, opsi
                                pengiriman, dan tarif pengiriman.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#846b60]">
                                <span className="border-b border-[#dcc8b8] pb-1">
                                    Terakhir diperbarui: 15 Mei 2024
                                </span>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('contact')}
                                    className="border-b border-[#53362d] pb-1 font-medium text-[#53362d] transition hover:text-[#8b5e4c] active:scale-[0.98]"
                                >
                                    Hubungi tim dukungan
                                </button>
                            </div>
                        </div>
                        <div className="relative hidden min-h-72 md:block lg:min-h-96">
                            <div className="absolute inset-0 flex items-center justify-end">
                                <img
                                    src="/images/privacy-hero.png"
                                    alt=""
                                    className="h-full max-h-[26rem] w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
                    <div className="hidden lg:block">
                        <div className="sticky top-24 border-l border-[#eadfd4] pl-5">
                            <div className="mb-5 flex items-center gap-3 text-base text-[#53362d]">
                                <FileText
                                    size={20}
                                    strokeWidth={1.5}
                                    className="text-[#8b5e4c]"
                                />
                                <h2 className="font-serif">Di Halaman Ini</h2>
                            </div>
                            <ul className="space-y-1.5">
                                {sidebarItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                scrollToSection(item.id)
                                            }
                                            className="flex w-full items-center gap-3 py-2.5 text-left text-sm font-medium text-[#846b60] transition duration-300 hover:translate-x-1 hover:text-[#53362d] active:scale-[0.98]"
                                        >
                                            <item.icon
                                                size={18}
                                                strokeWidth={1.5}
                                                className="shrink-0 text-[#bc9e90]"
                                            />
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="mb-10 border-b border-[#eadfd4] pb-8">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                                <Truck
                                    size={28}
                                    strokeWidth={1.5}
                                    className="mt-1 shrink-0 text-[#8b5e4c]"
                                />
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold text-[#53362d]">
                                        Pengiriman Lebih Jelas
                                    </h3>
                                    <p className="max-w-3xl leading-7 text-[#846b60]">
                                        Biaya pengiriman, estimasi pengiriman,
                                        dan detail pelacakan ditangani saat
                                        checkout dan setelah pesanan dipenuhi.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mb-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
                            <FeatureBox icon={Box} title="Pemrosesan 1-3 Hari" />
                            <FeatureBox
                                icon={Truck}
                                title="Tarif Pengiriman Checkout"
                            />
                            <FeatureBox
                                icon={MapPin}
                                title="Area Pengiriman Terpilih"
                            />
                            <FeatureBox
                                icon={ShieldCheck}
                                title="Pembaruan Pelacakan"
                            />
                        </div>
                        <div className="mb-10 border-y border-[#eadfd4]">
                            {sections.map((section, index) => (
                                <AccordionItem
                                    key={section.id}
                                    item={section}
                                    index={index}
                                    isLast={index === sections.length - 1}
                                />
                            ))}
                        </div>
                        <div
                            id="contact"
                            className="grid scroll-mt-28 gap-5 border-t border-[#eadfd4] pt-8 md:grid-cols-3"
                        >
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Mail size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Email
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        support@aureasyari.com
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-[#eadfd4] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <MessageCircle
                                        size={22}
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        WhatsApp
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        +62 812-0000-0000
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-[#eadfd4] pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Calendar size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Jam operasional
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        Senin - Sabtu, 09:00 - 17:00
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
