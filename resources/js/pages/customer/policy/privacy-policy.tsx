import { Head, Link } from '@inertiajs/react';
import ShopLayout from '@/layouts/shop-layout';
import { useState } from 'react';
import {
    CheckCircle2,
    User,
    Box,
    CreditCard,
    Truck,
    Cookie,
    ShieldCheck,
    Share2,
    Megaphone,
    Calendar,
    Shield,
    Baby,
    RefreshCw,
    Mail,
    Lock,
    Ban,
    ChevronDown,
    Clock,
    MessageCircle,
    FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const sidebarItems = [
    { id: 'introduction', icon: CheckCircle2, label: '1. Pendahuluan' },
    { id: 'info-collect', icon: User, label: '2. Informasi yang Kami Kumpulkan' },
    { id: 'use-info', icon: Box, label: '3. Cara Kami Menggunakan Informasi' },
    { id: 'payment', icon: CreditCard, label: '4. Informasi Pembayaran' },
    { id: 'shipping', icon: Truck, label: '5. Data Pengiriman & Pengantaran' },
    {
        id: 'cookies',
        icon: Cookie,
        label: '6. Cookie & Teknologi Pelacakan',
    },
    { id: 'protect', icon: ShieldCheck, label: '7. Cara Kami Melindungi Data' },
    {
        id: 'sharing',
        icon: Share2,
        label: '8. Berbagi Data dengan Pihak Ketiga',
    },
    { id: 'account', icon: User, label: '9. Data Akun & Profil Pengguna' },
    { id: 'marketing', icon: Megaphone, label: '10. Komunikasi Pemasaran' },
    { id: 'retention', icon: Calendar, label: '11. Retensi Data' },
    { id: 'rights', icon: Shield, label: '12. Hak Pengguna' },
    { id: 'children', icon: Baby, label: '13. Privasi Anak' },
    { id: 'changes', icon: RefreshCw, label: '14. Perubahan Kebijakan Ini' },
    { id: 'contact', icon: Mail, label: '15. Informasi Kontak' },
];

const sections = [
    {
        id: 'introduction',
        title: 'Pendahuluan',
        content:
            "Kebijakan Privasi ini menjelaskan cara Auréa Syar'i mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadimu saat menggunakan situs web kami.",
    },
    {
        id: 'info-collect',
        title: 'Informasi yang Kami Kumpulkan',
        content:
            'Kami mengumpulkan informasi pribadi yang kamu berikan langsung, seperti nama, alamat email, nomor telepon, alamat pengiriman, dan detail pesanan.',
    },
    {
        id: 'use-info',
        title: 'Cara Kami Menggunakan Informasi',
        content:
            'Kami menggunakan informasimu untuk memproses pesanan, mengirim produk, meningkatkan layanan, berkomunikasi denganmu, dan mempersonalisasi pengalamanmu.',
    },
    {
        id: 'payment',
        title: 'Informasi Pembayaran',
        content: 'Pembayaran aman diproses melalui Midtrans.',
    },
    {
        id: 'shipping',
        title: 'Data Pengiriman & Pengantaran',
        content:
            'Opsi pengiriman dan estimasi pengantaran dapat dihitung menggunakan Biteship.',
    },
    {
        id: 'cookies',
        title: 'Cookie & Teknologi Pelacakan',
        content:
            'Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman jelajah, menganalisis trafik situs, dan mendukung upaya pemasaran kami.',
    },
    {
        id: 'protect',
        title: 'Cara Kami Melindungi Data',
        content:
            'Kami menerapkan langkah keamanan berstandar industri untuk melindungi informasi pribadimu dari akses atau pengungkapan tanpa izin.',
    },
    {
        id: 'sharing',
        title: 'Berbagi Data dengan Pihak Ketiga',
        content:
            'Kami tidak menjual informasi pribadimu. Kami dapat membagikan data kepada penyedia layanan tepercaya yang membantu operasional bisnis kami.',
    },
    {
        id: 'account',
        title: 'Data Akun & Profil Pengguna',
        content:
            'Informasi akunmu membantu kami menyediakan pengalaman belanja yang personal dan menyimpan preferensi untuk pesanan berikutnya.',
    },
    {
        id: 'marketing',
        title: 'Komunikasi Pemasaran',
        content:
            'Kamu dapat berhenti berlangganan komunikasi pemasaran kapan saja.',
    },
    {
        id: 'retention',
        title: 'Retensi Data',
        content:
            'Kami menyimpan informasimu hanya selama diperlukan untuk memenuhi tujuan dalam kebijakan ini atau sesuai kewajiban hukum.',
    },
    {
        id: 'rights',
        title: 'Hak Pengguna',
        content:
            'Kamu berhak mengakses, memperbarui, memperbaiki, atau menghapus informasi pribadimu. Hubungi kami untuk bantuan.',
    },
    {
        id: 'children',
        title: 'Privasi Anak',
        content:
            'Situs web kami tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak secara sadar mengumpulkan informasi pribadi dari anak-anak.',
    },
    {
        id: 'changes',
        title: 'Perubahan Kebijakan Ini',
        content:
            'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan ditampilkan di halaman ini beserta tanggal pembaruan.',
    },
    {
        id: 'contact',
        title: 'Informasi Kontak',
        content:
            'Jika ada pertanyaan tentang Kebijakan Privasi ini, hubungi kami melalui detail di bawah.',
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

export default function PrivacyPolicy() {
    const scrollToSection = (id: string) => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <ShopLayout>
            <Head title="Kebijakan Privasi" />

            {/* Hero Section */}
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
                                    Kebijakan Privasi
                                </span>
                            </div>
                            <p className="mb-4 inline-flex border-l border-[#8b5e4c] pl-3 text-xs font-semibold tracking-[0.22em] text-[#8b5e4c] uppercase">
                                Kebijakan Data Pelanggan
                            </p>
                            <h1 className="mb-5 max-w-xl font-serif text-4xl leading-tight text-[#53362d] md:text-5xl lg:text-6xl">
                                Kebijakan Privasi
                            </h1>
                            <p className="max-w-xl text-base leading-8 text-[#846b60] sm:text-lg">
                                Pelajari cara kami mengumpulkan, menggunakan,
                                melindungi, dan mengelola informasi pribadimu saat berbelanja di
                                Auréa Syar'i.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#846b60]">
                                <span className="border-b border-[#dcc8b8] pb-1">
                                    Terakhir diperbarui: 28 April 2026
                                </span>
                                <button
                                    type="button"
                                    onClick={() => scrollToSection('contact')}
                                    className="border-b border-[#53362d] pb-1 font-medium text-[#53362d] transition hover:text-[#8b5e4c] active:scale-[0.98]"
                                >
                                    Hubungi tim privasi
                                </button>
                            </div>
                        </div>

                        <div className="relative hidden min-h-72 md:block lg:min-h-96">
                            {/* Placeholder for the design image */}
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

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
                    {/* Sidebar */}
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
                                {sidebarItems.map((item) => {
                                    return (
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
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="min-w-0">
                        <div className="mb-10 border-b border-[#eadfd4] pb-8">
                            <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                                <ShieldCheck
                                    size={28}
                                    strokeWidth={1.5}
                                    className="mt-1 shrink-0 text-[#8b5e4c]"
                                />
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold text-[#53362d]">
                                        Privasimu Penting
                                    </h3>
                                    <p className="max-w-3xl leading-7 text-[#846b60]">
                                        Kami hanya mengumpulkan informasi yang
                                        diperlukan untuk memproses pesanan,
                                        mengirim pembelian, meningkatkan
                                        pengalaman belanja, dan menyediakan
                                        dukungan pelanggan.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="mb-10 grid grid-cols-1 gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
                            <FeatureBox icon={Lock} title="Pembayaran Aman" />
                            <FeatureBox
                                icon={ShieldCheck}
                                title="Data Pribadi Terlindungi"
                            />
                            <FeatureBox
                                icon={Truck}
                                title="Mitra Pengiriman Tepercaya"
                            />
                            <FeatureBox icon={Ban} title="Tidak Menjual Data" />
                        </div>

                        {/* Accordion List */}
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

                        {/* Contact Information */}
                        <div className="grid gap-5 border-t border-[#eadfd4] pt-8 md:grid-cols-3">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 text-[#8b5e4c]">
                                    <Mail size={22} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="mb-0.5 text-sm font-medium text-[#53362d]">
                                        Email
                                    </div>
                                    <div className="text-sm text-[#846b60]">
                                        privacy@aureasyari.com
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
                                    <Clock size={22} strokeWidth={1.5} />
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
