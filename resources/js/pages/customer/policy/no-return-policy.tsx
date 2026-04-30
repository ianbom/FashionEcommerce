import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import ShopLayout from '@/Layouts/shop-layout';

export default function NoReturnPolicy() {
    return (
        <ShopLayout>
            <Head title="Return & Exchange Policy - Webcare" />
            
            {/* Hero Section */}
            <div className="relative w-full py-20 md:py-28 bg-[#FAF9F6] overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="relative z-10 px-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-white border border-[#EAE8E3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <AlertTriangle size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#3C3428] mb-4">Return & Exchange Policy</h1>
                    <p className="text-[#8C8578] text-[13px] md:text-[14px] max-w-[500px] mx-auto">
                        Please read carefully before making a purchase to understand our return guidelines.
                    </p>
                    <p className="text-[#A89F91] text-[11px] mt-6">Last Updated: May 15, 2024</p>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-20">
                <div className="bg-white border border-[#EAE8E3] rounded-3xl p-8 md:p-12 shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">1. All Sales Are Final</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            To maintain the highest standards of hygiene and quality for all our customers, we operate a strict "No Returns, No Exchanges" policy. All sales made on our website are final. Please review your order carefully before checking out.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">2. Damaged or Defective Items</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-4 text-[13px] md:text-[14px]">
                            While we quality-check every item before shipping, if you receive a product that is damaged during transit or contains a manufacturing defect, we will evaluate the issue and make it right.
                        </p>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            <strong>To claim a defect:</strong> You must contact our customer service team within 48 hours of receiving your order. Please provide your order number and clear photographic evidence of the defect. We will offer a replacement of the same item if deemed a valid defect.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">3. Incorrect Items Received</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            In the rare event that you receive an item different from what you ordered, please contact us within 48 hours of delivery. We will arrange for the correct item to be shipped out and provide instructions for the return of the incorrect item at our expense.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">4. Cancellations</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            Orders cannot be cancelled once they have been processed and dispatched. If you need to cancel an order, please contact us immediately after placing it. If the order has not yet entered the fulfillment process, we may be able to accommodate your request, but this is not guaranteed.
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
