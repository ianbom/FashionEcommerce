import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function NoReturnPolicy() {
    return (
        <ShopLayout>
            <Head title="Return & Exchange Policy - Webcare" />

            {/* Hero Section */}
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] py-20 text-center md:py-28">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="animate-fade-in-up relative z-10 px-4">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#EAE8E3] bg-white shadow-sm">
                        <AlertTriangle size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="mb-4 font-serif text-3xl text-[#3C3428] md:text-5xl">
                        Return & Exchange Policy
                    </h1>
                    <p className="mx-auto max-w-[500px] text-[13px] text-[#8C8578] md:text-[14px]">
                        Please read carefully before making a purchase to
                        understand our return guidelines.
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
                            1. All Sales Are Final
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            To maintain the highest standards of hygiene and
                            quality for all our customers, we operate a strict
                            "No Returns, No Exchanges" policy. All sales made on
                            our website are final. Please review your order
                            carefully before checking out.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            2. Damaged or Defective Items
                        </h2>
                        <p className="mb-4 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            While we quality-check every item before shipping,
                            if you receive a product that is damaged during
                            transit or contains a manufacturing defect, we will
                            evaluate the issue and make it right.
                        </p>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            <strong>To claim a defect:</strong> You must contact
                            our customer service team within 48 hours of
                            receiving your order. Please provide your order
                            number and clear photographic evidence of the
                            defect. We will offer a replacement of the same item
                            if deemed a valid defect.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            3. Incorrect Items Received
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            In the rare event that you receive an item different
                            from what you ordered, please contact us within 48
                            hours of delivery. We will arrange for the correct
                            item to be shipped out and provide instructions for
                            the return of the incorrect item at our expense.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#3C3428] md:text-2xl">
                            4. Cancellations
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Orders cannot be cancelled once they have been
                            processed and dispatched. If you need to cancel an
                            order, please contact us immediately after placing
                            it. If the order has not yet entered the fulfillment
                            process, we may be able to accommodate your request,
                            but this is not guaranteed.
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
