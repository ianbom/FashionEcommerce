import { Link } from '@inertiajs/react';
import {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Mail,
    MapPin,
    Phone,
    ArrowRight,
} from 'lucide-react';
import React from 'react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-primary pt-16 pb-8 text-primary-foreground md:pt-24">
            {/* Top Section: Newsletter & Brand */}
            <div className="mx-auto mb-16 max-w-[1500px] px-6 md:px-10">
                <div className="grid grid-cols-1 items-center gap-12 border-b border-white/10 pb-12 lg:grid-cols-2">
                    <div className="flex flex-col">
                        <div className="mb-4 flex items-center gap-4">
                            <img
                                src="/logo-shay/logo-tab.png"
                                alt="Shayda"
                                className="h-16 w-auto object-contain md:h-20"
                            />
                            <span className="text-xl font-bold tracking-[0.3em] text-accent md:text-2xl">
                                Shayda
                            </span>
                        </div>
                        <p className="max-w-md text-xs leading-relaxed text-white/60 md:text-sm">
                            Menghadirkan modest fashion dengan elegansi dan
                            kelembutan. Temukan identitas terbaikmu lewat
                            koleksi eksklusif kami.
                        </p>
                    </div>

                    <div className="flex flex-col lg:items-end">
                        <h3 className="mb-4 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Berlangganan Newsletter
                        </h3>
                        <div className="group flex w-full max-w-md border-b border-white/30 pb-2 transition-colors focus-within:border-white">
                            <input
                                type="email"
                                placeholder="Masukkan alamat email"
                                className="flex-1 bg-transparent text-xs tracking-wider text-white placeholder-white/40 outline-none md:text-sm"
                            />
                            <button className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase transition-colors group-focus-within:text-white hover:text-white">
                                Berlangganan <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Links */}
            <div className="mx-auto max-w-[1500px] px-6 md:px-10">
                <div className="mb-16 grid grid-cols-1 gap-12 text-[11px] font-medium tracking-widest md:grid-cols-2 lg:grid-cols-4">
                    {/* Contact Us */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Hubungi Kami
                        </h3>
                        <ul className="space-y-4 text-white/60">
                            <li className="group flex cursor-pointer items-start gap-3 transition-colors hover:text-white">
                                <MapPin
                                    size={16}
                                    className="mt-0.5 shrink-0 transition-colors group-hover:text-accent"
                                />
                                <span className="leading-relaxed">
                                    Jl. Raya Surabaya No. 123,
                                    <br />
                                    Surabaya, 12345
                                </span>
                            </li>
                            <li className="group flex cursor-pointer items-center gap-3 transition-colors hover:text-white">
                                <Phone
                                    size={16}
                                    className="shrink-0 transition-colors group-hover:text-accent"
                                />
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li className="group flex cursor-pointer items-center gap-3 transition-colors hover:text-white">
                                <Mail
                                    size={16}
                                    className="shrink-0 transition-colors group-hover:text-accent"
                                />
                                <span>hello@shayda.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Layanan Pelanggan
                        </h3>
                        <ul className="space-y-4 text-white/60">
                            <li>
                                <Link
                                    href="/list"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Cara Membeli
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/checkout"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Informasi Pembayaran
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Informasi Pengiriman
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/no-return-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Retur & Penukaran
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/my-order"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Lacak Pesanan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/notifications"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Pertanyaan Umum
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Jelajahi
                        </h3>
                        <ul className="space-y-4 text-white/60">
                            <li>
                                <Link
                                    href="/"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Cerita Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Jurnal Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Kebijakan Pengiriman
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/no-return-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Kebijakan Tanpa Retur
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-conditions"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Payment & Social */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                                Pembayaran Aman
                            </h3>
                            <div className="grid grid-cols-4 gap-2 opacity-70 transition-opacity hover:opacity-100">
                                {[
                                    'QRIS',
                                    'OVO',
                                    'Shopee',
                                    'Dana',
                                    'BNI',
                                    'Mandiri',
                                    'BCA',
                                    'BSI',
                                    'VISA',
                                    'JCB',
                                    'MasterCard',
                                ].map((method) => (
                                    <div
                                        key={method}
                                        className="flex h-8 cursor-default items-center justify-center rounded border border-white/5 bg-white/10 text-[7px] font-bold tracking-wider uppercase backdrop-blur-sm transition-colors hover:bg-white/20"
                                    >
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col items-center justify-between border-t border-white/10 pt-8 text-[10px] tracking-[0.15em] text-white/50 md:flex-row">
                    <p className="mb-4 md:mb-0">
                        © {new Date().getFullYear()} Shayda. All
                        Rights Reserved.
                    </p>

                    <div className="flex items-center space-x-6">
                        <button
                            type="button"
                            className="transition-all duration-300 hover:-translate-y-1 hover:text-accent"
                        >
                            <Instagram size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="transition-all duration-300 hover:-translate-y-1 hover:text-accent"
                        >
                            <Facebook size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="transition-all duration-300 hover:-translate-y-1 hover:text-accent"
                        >
                            <Twitter size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="transition-all duration-300 hover:-translate-y-1 hover:text-accent"
                        >
                            <Youtube size={18} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
