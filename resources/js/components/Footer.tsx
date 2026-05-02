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
                        <div className="mb-4 flex items-center space-x-3">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-accent"
                            >
                                <path
                                    d="M7 4V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="2"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="text-xl font-bold tracking-[0.3em] text-accent">
                                WEBCARE
                            </span>
                        </div>
                        <p className="max-w-md text-xs leading-relaxed text-white/60 md:text-sm">
                            Elevating modest fashion with elegance and grace.
                            Discover your true identity with our exclusive
                            collections.
                        </p>
                    </div>

                    <div className="flex flex-col lg:items-end">
                        <h3 className="mb-4 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Subscribe to our Newsletter
                        </h3>
                        <div className="group flex w-full max-w-md border-b border-white/30 pb-2 transition-colors focus-within:border-white">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 bg-transparent text-xs tracking-wider text-white placeholder-white/40 outline-none md:text-sm"
                            />
                            <button className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/60 uppercase transition-colors group-focus-within:text-white hover:text-white">
                                Subscribe <ArrowRight size={14} />
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
                            Contact Us
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
                                <span>hello@webcare.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Customer Care
                        </h3>
                        <ul className="space-y-4 text-white/60">
                            <li>
                                <Link
                                    href="/list"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    How to Buy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/checkout"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Payment Information
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shipping-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Shipping Information
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/no-return-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Return & Exchange
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/my-order"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/notifications"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    FAQs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                            Explore
                        </h3>
                        <ul className="space-y-4 text-white/60">
                            <li>
                                <Link
                                    href="/"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Our Story
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Our Journal
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/list"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Store Locator
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-conditions"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="inline-block transition-transform hover:translate-x-1 hover:text-white"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Payment & Social */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="mb-6 text-xs font-bold tracking-[0.2em] text-white/95 uppercase">
                                Secure Payment
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
                        © {new Date().getFullYear()} PT Webcare Digital. All
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
