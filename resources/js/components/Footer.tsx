import React from 'react';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#2D2A12] text-white pt-16 md:pt-24 pb-8 border-t border-[#EAE8E3]">
            {/* Top Section: Newsletter & Brand */}
            <div className="max-w-[1500px] mx-auto px-6 md:px-10 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-12 border-b border-white/10">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 4V12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12V4" stroke="#A89F91" strokeWidth="1.5"/>
                                <circle cx="12" cy="12" r="2" fill="#A89F91"/>
                            </svg>
                            <span className="text-xl tracking-[0.3em] font-bold text-[#A89F91]">WEBCARE</span>
                        </div>
                        <p className="text-white/60 text-xs md:text-sm max-w-md leading-relaxed">
                            Elevating modest fashion with elegance and grace. Discover your true identity with our exclusive collections.
                        </p>
                    </div>
                    
                    <div className="flex flex-col lg:items-end">
                        <h3 className="mb-4 font-bold tracking-[0.2em] text-white/95 text-xs uppercase">Subscribe to our Newsletter</h3>
                        <div className="flex w-full max-w-md border-b border-white/30 pb-2 transition-colors focus-within:border-white group">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="bg-transparent text-white placeholder-white/40 text-xs md:text-sm outline-none flex-1 tracking-wider"
                            />
                            <button className="text-white/60 hover:text-white transition-colors group-focus-within:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                                Subscribe <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Links */}
            <div className="max-w-[1500px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-[11px] tracking-widest font-medium">
                    {/* Contact Us */}
                    <div>
                        <h3 className="mb-6 font-bold tracking-[0.2em] text-white/95 uppercase text-xs">Contact Us</h3>
                        <ul className="space-y-4 text-white/60">
                            <li className="flex items-start gap-3 hover:text-white transition-colors cursor-pointer group">
                                <MapPin size={16} className="shrink-0 mt-0.5 group-hover:text-[#A89F91] transition-colors" />
                                <span className="leading-relaxed">Jl. Raya Surabaya No. 123,<br/>Surabaya, 12345</span>
                            </li>
                            <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                                <Phone size={16} className="shrink-0 group-hover:text-[#A89F91] transition-colors" />
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer group">
                                <Mail size={16} className="shrink-0 group-hover:text-[#A89F91] transition-colors" />
                                <span>hello@webcare.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="mb-6 font-bold tracking-[0.2em] text-white/95 uppercase text-xs">Customer Care</h3>
                        <ul className="space-y-4 text-white/60">
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">How to Buy</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Payment Information</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Shipping Information</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Return & Exchange</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Track Order</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="mb-6 font-bold tracking-[0.2em] text-white/95 uppercase text-xs">Explore</h3>
                        <ul className="space-y-4 text-white/60">
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Our Story</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Our Journal</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Store Locator</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Careers</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Payment & Social */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="mb-6 font-bold tracking-[0.2em] text-white/95 uppercase text-xs">Secure Payment</h3>
                            <div className="grid grid-cols-4 gap-2 opacity-70 hover:opacity-100 transition-opacity">
                                {['QRIS', 'OVO', 'Shopee', 'Dana', 'BNI', 'Mandiri', 'BCA', 'BSI', 'VISA', 'JCB', 'MasterCard'].map((method) => (
                                    <div key={method} className="bg-white/10 h-8 rounded flex items-center justify-center text-[7px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/5 hover:bg-white/20 transition-colors cursor-default">
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[10px] text-white/50 tracking-[0.15em]">
                    <p className="mb-4 md:mb-0">© {new Date().getFullYear()} PT Webcare Digital. All Rights Reserved.</p>
                    
                    <div className="flex items-center space-x-6">
                        <a href="#" className="hover:text-[#A89F91] hover:-translate-y-1 transition-all duration-300">
                            <Instagram size={18} strokeWidth={1.5} />
                        </a>
                        <a href="#" className="hover:text-[#A89F91] hover:-translate-y-1 transition-all duration-300">
                            <Facebook size={18} strokeWidth={1.5} />
                        </a>
                        <a href="#" className="hover:text-[#A89F91] hover:-translate-y-1 transition-all duration-300">
                            <Twitter size={18} strokeWidth={1.5} />
                        </a>
                        <a href="#" className="hover:text-[#A89F91] hover:-translate-y-1 transition-all duration-300">
                            <Youtube size={18} strokeWidth={1.5} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
