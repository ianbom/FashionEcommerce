import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Truck, ChevronRight } from 'lucide-react';
import ShopLayout from '@/Layouts/shop-layout';

export default function ShippingPolicy() {
    return (
        <ShopLayout>
            <Head title="Shipping Policy - Webcare" />
            
            {/* Hero Section */}
            <div className="relative w-full py-20 md:py-28 bg-[#FAF9F6] overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EAE8E3]/50 to-[#FAF9F6]"></div>
                </div>
                <div className="relative z-10 px-4 animate-fade-in-up">
                    <div className="w-16 h-16 bg-white border border-[#EAE8E3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Truck size={28} className="text-[#3C3428]" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#3C3428] mb-4">Shipping Policy</h1>
                    <p className="text-[#8C8578] text-[13px] md:text-[14px] max-w-[500px] mx-auto">
                        Information regarding processing times, delivery options, and shipping rates.
                    </p>
                    <p className="text-[#A89F91] text-[11px] mt-6">Last Updated: May 15, 2024</p>
                </div>
            </div>

            {/* Content Section */}
            <main className="max-w-[800px] mx-auto px-4 md:px-8 py-12 md:py-20 relative z-20">
                <div className="bg-white border border-[#EAE8E3] rounded-3xl p-8 md:p-12 shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    
                    <div className="prose prose-sm md:prose-base prose-stone max-w-none">
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">1. Order Processing Time</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            All orders are processed within 1 to 3 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped. Processing times may be longer during peak seasons or promotional periods.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">2. Shipping Rates & Estimates</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-4 text-[13px] md:text-[14px]">
                            Shipping charges for your order will be calculated and displayed at checkout. We offer several delivery options depending on your location:
                        </p>
                        <ul className="list-disc pl-5 mb-8 text-[#4A4A4A] text-[13px] md:text-[14px] space-y-2">
                            <li><strong>Standard Shipping:</strong> Usually takes 3-5 business days.</li>
                            <li><strong>Express Shipping:</strong> Usually takes 1-2 business days.</li>
                            <li><strong>Same Day Delivery:</strong> Available for select metropolitan areas if ordered before 12:00 PM.</li>
                        </ul>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">3. International Shipping</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            We currently ship internationally to select countries. Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. Webcare is not responsible for these charges if they are applied and are your responsibility as the customer.
                        </p>

                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-4">4. How do I check the status of my order?</h2>
                        <p className="text-[#4A4A4A] leading-relaxed mb-8 text-[13px] md:text-[14px]">
                            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available. If you haven't received your order within the estimated delivery time, please contact us with your name and order number.
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
