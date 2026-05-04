import { Head, Link } from '@inertiajs/react';
import { FileText, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function TermCondition() {
    return (
        <ShopLayout>
            <Head title="Terms & Conditions - Webcare" />

            {/* Hero Section */}
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] py-20 text-center md:py-28">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EADBD8]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="animate-fade-in-up relative z-10 px-4">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#EADBD8] bg-white shadow-sm">
                        <FileText size={28} className="text-[#4A2525]" />
                    </div>
                    <h1 className="mb-4 font-serif text-3xl text-[#4A2525] md:text-5xl">
                        Terms & Conditions
                    </h1>
                    <p className="mx-auto max-w-[500px] text-[13px] text-[#8A6B62] md:text-[14px]">
                        Please read these terms and conditions carefully before
                        using our website.
                    </p>
                    <p className="mt-6 text-[11px] text-[#C99A8F]">
                        Last Updated: May 15, 2024
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <main className="relative z-20 mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-20">
                <div
                    className="animate-fade-in-up rounded-3xl border border-[#EADBD8] bg-white p-8 shadow-sm md:p-12"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            1. Agreement to Terms
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            These Terms and Conditions constitute a legally
                            binding agreement made between you, whether
                            personally or on behalf of an entity ("you") and
                            Webcare ("we," "us" or "our"), concerning your
                            access to and use of our website as well as any
                            other media form, media channel, mobile website or
                            mobile application related, linked, or otherwise
                            connected thereto.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            2. Intellectual Property Rights
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Unless otherwise indicated, the Site is our
                            proprietary property and all source code, databases,
                            functionality, software, website designs, audio,
                            video, text, photographs, and graphics on the Site
                            (collectively, the "Content") and the trademarks,
                            service marks, and logos contained therein (the
                            "Marks") are owned or controlled by us or licensed
                            to us, and are protected by copyright and trademark
                            laws.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            3. User Representations
                        </h2>
                        <p className="mb-4 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="mb-8 list-disc space-y-2 pl-5 text-[13px] text-[#4A4A4A] md:text-[14px]">
                            <li>
                                All registration information you submit will be
                                true, accurate, current, and complete.
                            </li>
                            <li>
                                You will maintain the accuracy of such
                                information and promptly update such
                                registration information as necessary.
                            </li>
                            <li>
                                You have the legal capacity and you agree to
                                comply with these Terms and Conditions.
                            </li>
                            <li>
                                You will not access the Site through automated
                                or non-human means, whether through a bot,
                                script, or otherwise.
                            </li>
                        </ul>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            4. Products and Pricing
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            We make every effort to display as accurately as
                            possible the colors, features, specifications, and
                            details of the products available on the Site.
                            However, we do not guarantee that the colors,
                            features, specifications, and details of the
                            products will be accurate, complete, reliable,
                            current, or free of other errors. All pricing is
                            subject to change without notice.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            5. Modifications and Interruptions
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            We reserve the right to change, modify, or remove
                            the contents of the Site at any time or for any
                            reason at our sole discretion without notice.
                            However, we have no obligation to update any
                            information on our Site. We will not be liable to
                            you or any third party for any modification, price
                            change, suspension, or discontinuance of the Site.
                        </p>
                    </div>

                    <div className="mt-12 flex items-center justify-between border-t border-[#EADBD8] pt-8">
                        <p className="text-[12px] text-[#8A6B62]">
                            Have questions?{' '}
                            <a
                                href="mailto:support@webcare.com"
                                className="font-semibold text-[#4A2525] hover:underline"
                            >
                                Contact Support
                            </a>
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center text-[12px] font-bold text-[#4A2525] transition-colors hover:text-[#B6574B]"
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
