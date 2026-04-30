import { Head, Link } from '@inertiajs/react';
import { Shield, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function PrivacyPolicy() {
    return (
        <ShopLayout>
            <Head title="Privacy Policy - Webcare" />
            
            {/* Hero Section */}
            <div className="relative w-full py-20 md:py-28 bg-[#FAF9F6] overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="relative z-10 px-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-white border border-[#EAE8E3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Shield size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#3C3428] mb-4">Privacy Policy</h1>
                    <p className="text-[#8C8578] text-[13px] md:text-[14px] max-w-[500px] mx-auto">
                        Learn how we collect, use, and protect your personal information when you use our services.
                    </p>
                    <p className="text-[#A89F91] text-[11px] mt-6">Last Updated: May 15, 2024</p>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-20">
                <div className="bg-white border border-[#EAE8E3] rounded-3xl p-8 md:p-12 shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">1. Introduction</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            Welcome to Webcare. We respect your privacy and are committed to protecting your personal data. 
                            This privacy policy will inform you as to how we look after your personal data when you visit our website 
                            and tell you about your privacy rights and how the law protects you.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">2. The Data We Collect About You</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-4 text-[13px] md:text-[14px]">
                            Personal data, or personal information, means any information about an individual from which that person can be identified. 
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-5 mb-8 text-[#4A4A4A] text-[13px] md:text-[14px] space-y-2">
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
                            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">3. How We Use Your Personal Data</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-4 text-[13px] md:text-[14px]">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 mb-8 text-[#4A4A4A] text-[13px] md:text-[14px] space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal obligation.</li>
                        </ul>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">4. Data Security</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">5. Your Legal Rights</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
                        </p>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#EAE8E3] flex justify-between items-center">
                        <p className="text-[12px] text-[#8C8578]">Have questions? <a href="mailto:support@webcare.com" className="text-[#3C3428] font-semibold hover:underline">Contact Support</a></p>
                        <Link href="/" className="inline-flex items-center text-[12px] font-bold text-[#3C3428] hover:text-[#C2AA92] transition-colors">
                            Back to Home <ChevronRight size={14} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </main>
        </ShopLayout>
    );
}
