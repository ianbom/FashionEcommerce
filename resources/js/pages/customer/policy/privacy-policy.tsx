import { Head, Link } from '@inertiajs/react';
import { Shield, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function PrivacyPolicy() {
    return (
        <ShopLayout>
            <Head title="Privacy Policy - Webcare" />

            {/* Hero Section */}
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F6] py-20 text-center md:py-28">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EADBD8]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="animate-fade-in-up relative z-10 px-4">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#EADBD8] bg-white shadow-sm">
                        <Shield size={28} className="text-[#4A2525]" />
                    </div>
                    <h1 className="mb-4 font-serif text-3xl text-[#4A2525] md:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mx-auto max-w-[500px] text-[13px] text-[#8A6B62] md:text-[14px]">
                        Learn how we collect, use, and protect your personal
                        information when you use our services.
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
                            1. Introduction
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Welcome to Webcare. We respect your privacy and are
                            committed to protecting your personal data. This
                            privacy policy will inform you as to how we look
                            after your personal data when you visit our website
                            and tell you about your privacy rights and how the
                            law protects you.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            2. The Data We Collect About You
                        </h2>
                        <p className="mb-4 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Personal data, or personal information, means any
                            information about an individual from which that
                            person can be identified. We may collect, use, store
                            and transfer different kinds of personal data about
                            you which we have grouped together as follows:
                        </p>
                        <ul className="mb-8 list-disc space-y-2 pl-5 text-[13px] text-[#4A4A4A] md:text-[14px]">
                            <li>
                                <strong>Identity Data</strong> includes first
                                name, last name, username or similar identifier.
                            </li>
                            <li>
                                <strong>Contact Data</strong> includes billing
                                address, delivery address, email address and
                                telephone numbers.
                            </li>
                            <li>
                                <strong>Financial Data</strong> includes bank
                                account and payment card details.
                            </li>
                            <li>
                                <strong>Transaction Data</strong> includes
                                details about payments to and from you and other
                                details of products you have purchased from us.
                            </li>
                        </ul>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            3. How We Use Your Personal Data
                        </h2>
                        <p className="mb-4 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            We will only use your personal data when the law
                            allows us to. Most commonly, we will use your
                            personal data in the following circumstances:
                        </p>
                        <ul className="mb-8 list-disc space-y-2 pl-5 text-[13px] text-[#4A4A4A] md:text-[14px]">
                            <li>
                                Where we need to perform the contract we are
                                about to enter into or have entered into with
                                you.
                            </li>
                            <li>
                                Where it is necessary for our legitimate
                                interests (or those of a third party) and your
                                interests and fundamental rights do not override
                                those interests.
                            </li>
                            <li>
                                Where we need to comply with a legal obligation.
                            </li>
                        </ul>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            4. Data Security
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            We have put in place appropriate security measures
                            to prevent your personal data from being
                            accidentally lost, used, or accessed in an
                            unauthorized way, altered, or disclosed. In
                            addition, we limit access to your personal data to
                            those employees, agents, contractors, and other
                            third parties who have a business need to know.
                        </p>

                        <h2 className="mb-4 font-serif text-xl text-[#4A2525] md:text-2xl">
                            5. Your Legal Rights
                        </h2>
                        <p className="mb-8 text-[13px] leading-relaxed text-[#4A4A4A] md:text-[14px]">
                            Under certain circumstances, you have rights under
                            data protection laws in relation to your personal
                            data, including the right to request access,
                            correction, erasure, restriction, transfer, to
                            object to processing, to portability of data, and
                            (where the lawful ground of processing is consent)
                            to withdraw consent.
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
