import { Head, Link } from '@inertiajs/react';
import { Truck, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function ShippingPolicy() {
    return (
        <ShopLayout>
            <Head title="Shipping Policy - Webcare" />

            {/* Hero Section */}
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] py-20 text-center md:py-28">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="animate-fade-in-up relative z-10 px-4">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#EAE8E3] bg-white shadow-sm">
                        <Truck size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="mb-4 font-serif text-3xl text-[#3C3428] md:text-5xl">
                        Shipping Policy
                    </h1>
                    <p className="mx-auto max-w-[500px] text-[13px] text-[#8C8578] md:text-[14px]">
                        Information regarding processing times, delivery
                        options, and shipping rates.
                    </p>
                    <p className="mt-6 text-[11px] text-[#A89F91]">
                        Last Updated: May 15, 2024
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <main className="relative z-20 mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-20">
                <div
                    className="animate-fade-in-up rounded-3xl border border-[#EAE8E3] bg-white p-8 shadow-sm md:p-12"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            1. Order Processing Time
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            All orders are processed within 1 to 3 business days
                            (excluding weekends and holidays) after receiving
                            your order confirmation email. You will receive
                            another notification when your order has shipped.
                            Processing times may be longer during peak seasons
                            or promotional periods.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            2. Shipping Rates & Estimates
                        </h2>
                        <p className="mb-4 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Shipping charges for your order will be calculated
                            and displayed at checkout. We offer several delivery
                            options depending on your location:
                        </p>
                        <ul className="mb-8 list-disc space-y-2 pl-5 text-[13px] text-[#4A4A4A] md:text-[14px]">
                            <li>
                                <strong>Standard Shipping:</strong> Usually
                                takes 3-5 business days.
                            </li>
                            <li>
                                <strong>Express Shipping:</strong> Usually takes
                                1-2 business days.
                            </li>
                            <li>
                                <strong>Same Day Delivery:</strong> Available
                                for select metropolitan areas if ordered before
                                12:00 PM.
                            </li>
                        </ul>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            3. International Shipping
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            We currently ship internationally to select
                            countries. Your order may be subject to import
                            duties and taxes (including VAT), which are incurred
                            once a shipment reaches your destination country.
                            Webcare is not responsible for these charges if they
                            are applied and are your responsibility as the
                            customer.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            4. How do I check the status of my order?
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            When your order has shipped, you will receive an
                            email notification from us which will include a
                            tracking number you can use to check its status.
                            Please allow 48 hours for the tracking information
                            to become available. If you haven't received your
                            order within the estimated delivery time, please
                            contact us with your name and order number.
                        </p>
                    </div>

                    <div className="mt-12 flex items-center justify-between border-t border-[#EAE8E3] pt-8">
                        <p className="text-[12px] text-[#8C8578]">
                            Have questions?{' '}
                            <a
                                href="mailto:support@webcare.com"
                                className="font-semibold text-[#3C3428] hover:underline"
                            >
                                Contact Support
                            </a>
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center text-[12px] font-bold text-[#3C3428] transition-colors hover:text-[#C2AA92]"
                        >
                            Back to Home{' '}
                            <ChevronRight size={14} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </main>
        </ShopLayout>
    );
}
