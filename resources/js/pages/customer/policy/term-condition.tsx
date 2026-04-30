import { Head, Link } from '@inertiajs/react';
import { FileText, ChevronRight } from 'lucide-react';
import React from 'react';
import ShopLayout from '@/layouts/shop-layout';

export default function TermCondition() {
    return (
        <ShopLayout>
            <Head title="Terms & Conditions - Webcare" />
            
            {/* Hero Section */}
            <div className="relative w-full py-20 md:py-28 bg-[#FAF9F6] overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="relative z-10 px-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-white border border-[#EAE8E3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <FileText size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#3C3428] mb-4">Terms & Conditions</h1>
                    <p className="text-[#8C8578] text-[13px] md:text-[14px] max-w-[500px] mx-auto">
                        Please read these terms and conditions carefully before using our website.
                    </p>
                    <p className="text-[#A89F91] text-[11px] mt-6">Last Updated: May 15, 2024</p>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-20">
                <div className="bg-white border border-[#EAE8E3] rounded-3xl p-8 md:p-12 shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">1. Agreement to Terms</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Webcare ("we," "us" or "our"), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">2. Intellectual Property Rights</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">3. User Representations</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-4 text-[13px] md:text-[14px]">
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-5 mb-8 text-[#4A4A4A] text-[13px] md:text-[14px] space-y-2">
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
                            <li>You will not access the Site through automated or non-human means, whether through a bot, script, or otherwise.</li>
                        </ul>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">4. Products and Pricing</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors. All pricing is subject to change without notice.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">5. Modifications and Interruptions</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
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
