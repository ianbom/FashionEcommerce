import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    ChevronRight, Check, Lock, ChevronDown, Plus, ShieldCheck, Box, HeadphonesIcon, 
    CreditCard, Wallet, QrCode, Building2, Smartphone, AlertCircle 
} from 'lucide-react';
import ShopLayout from '@/Layouts/shop-layout';

// Dummy Data for Order Summary
const orderItems = [
    {
        id: 1,
        title: "Najran Piping Lace Abaya",
        color: "Off White",
        size: "M",
        price: 739000,
        quantity: 1,
        image: "/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg",
    },
    {
        id: 2,
        title: "Kufah Khimar",
        color: "Off White",
        size: "M",
        price: 349000,
        quantity: 1,
        image: "/img/ainur-iman-qcNmigFPTQM-unsplash.jpg",
    },
    {
        id: 3,
        title: "Sila Scarf",
        color: "Broken White",
        size: "Standard",
        price: 244300,
        quantity: 1,
        image: "/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg",
    }
];

export default function Checkout() {
    const [activeSection, setActiveSection] = useState(1);
    const [deliveryMethod, setDeliveryMethod] = useState('jne');
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [addressType, setAddressType] = useState('home');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price).replace('Rp', 'Rp ');
    };

    const subtotal = 1332300;
    const shipping = 18000;
    const discount = 100000;
    const total = subtotal + shipping - discount;

    const deliveryOptions = [
        { id: 'jne', name: 'JNE Regular', time: '2-3 days', price: 18000, desc: 'Reliable & economical' },
        { id: 'jnt', name: 'J&T Express', time: '2-3 days', price: 16000, desc: 'Fast & reliable' },
        { id: 'sicepat', name: 'SiCepat Best', time: '1-2 days', price: 20000, desc: 'Best for your package' },
        { id: 'anteraja', name: 'AnterAja Reguler', time: '2-3 days', price: 17000, desc: 'Door to door delivery' },
        { id: 'sameday', name: 'Same Day', time: 'Instant (Jakarta)', price: 35000, desc: 'Same day delivery' },
    ];

    const paymentOptions = [
        { id: 'bank', name: 'Bank Transfer', desc: 'Manual transfer', icon: Building2 },
        { id: 'va', name: 'Virtual Account', desc: 'All major banks', icon: Smartphone },
        { id: 'ewallet', name: 'E-Wallet', desc: 'OVO, GoPay, DANA', icon: Wallet },
        { id: 'qris', name: 'QRIS', desc: 'Scan & Pay', icon: QrCode },
        { id: 'cc', name: 'Credit / Debit Card', desc: 'Visa, Mastercard', icon: CreditCard },
    ];

    // Reusable Section Header Component
    const SectionHeader = ({ num, title, isActive, isCompleted, rightContent = null, onClick = null }: any) => (
        <div 
            className={`flex items-center justify-between py-4 px-5 md:px-6 cursor-pointer ${isActive ? 'bg-white' : 'bg-transparent hover:bg-white/50'} transition-colors`}
            onClick={onClick}
        >
            <div className="flex items-center space-x-4">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${isActive || isCompleted ? 'bg-[#C2AA92] text-white shadow-sm' : 'bg-[#EAE8E3] text-[#8C8578]'}`}>
                    {isCompleted && !isActive ? <Check size={14} strokeWidth={3} /> : num}
                </div>
                <h2 className="text-lg font-serif text-[#3C3428]">{title}</h2>
            </div>
            {rightContent}
        </div>
    );

    return (
        <ShopLayout>
            <Head title="Checkout - Webcare" />

            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12 bg-[#FAF9F6] min-h-screen">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
                    <div>
                        {/* Breadcrumbs */}
                        <div className="flex items-center space-x-2 text-[10px] md:text-xs text-[#8C8578] mb-4 font-medium tracking-wide">
                            <Link href="/" className="hover:text-black transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/my-cart" className="hover:text-black transition-colors">Cart</Link>
                            <span>/</span>
                            <span className="text-[#333333]">Checkout</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif italic text-[#3C3428] mb-2">Checkout</h1>
                        <p className="text-xs md:text-sm text-[#8C8578]">Complete your order with secure payment and delivery details.</p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center w-full md:w-auto max-w-[400px] md:pr-4">
                        {[
                            { num: 1, label: 'Cart', status: 'completed' },
                            { num: 2, label: 'Checkout', status: 'active' },
                            { num: 3, label: 'Payment', status: 'pending' },
                            { num: 4, label: 'Confirmation', status: 'pending' },
                        ].map((step, idx, arr) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center relative group z-10">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                                        step.status === 'active' ? 'bg-[#3C3428] text-white shadow-md scale-110' :
                                        step.status === 'completed' ? 'bg-white border-2 border-[#C2AA92] text-[#C2AA92]' :
                                        'bg-white border border-[#EAE8E3] text-[#A89F91]'
                                    }`}>
                                        {step.num}
                                    </div>
                                    <span className={`absolute -bottom-5 text-[9px] font-medium whitespace-nowrap transition-colors duration-300 ${
                                        step.status === 'active' ? 'text-[#3C3428]' : 'text-[#A89F91]'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {idx < arr.length - 1 && (
                                    <div className="flex-1 h-[1px] bg-[#EAE8E3] mx-2 -mt-4 relative">
                                        {step.status === 'completed' && <div className="absolute inset-0 bg-[#C2AA92]"></div>}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative pb-20 lg:pb-0">
                    
                    {/* Left Column: Form Sections */}
                    <div className="flex-1 space-y-4 md:space-y-6">
                        
                        {/* 1. Contact Information */}
                        <div className="bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader 
                                num="1" 
                                title="Contact Information" 
                                isActive={activeSection === 1} 
                                isCompleted={activeSection > 1}
                                onClick={() => setActiveSection(1)}
                                rightContent={
                                    <span className="text-[11px] md:text-xs text-[#8C8578]">
                                        Already have an account? <Link href="/login" className="underline font-medium text-[#3C3428] hover:text-black">Sign in</Link>
                                    </span>
                                }
                            />
                            
                            {/* Accordion Content */}
                            <div className={`px-5 md:px-6 transition-all duration-500 ease-in-out ${activeSection === 1 ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Name</label>
                                        <input type="text" defaultValue="Siti Aisyah" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Email Address</label>
                                        <input type="email" defaultValue="siti.aisyah@email.com" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <input type="tel" defaultValue="0812 3456 789" className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-[#EF4444] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all pr-10" />
                                            <AlertCircle size={16} className="absolute right-3 top-3 text-[#EF4444]" />
                                        </div>
                                        <p className="text-[10px] text-[#EF4444] mt-1.5">Please enter a valid phone number</p>
                                    </div>
                                    <div className="md:col-span-2 flex items-center mt-2">
                                        <input type="checkbox" id="save-info" defaultChecked className="w-4 h-4 rounded border-[#C4BDB1] text-[#3C3428] focus:ring-[#3C3428]" />
                                        <label htmlFor="save-info" className="ml-2 text-[12px] text-[#4A4A4A]">Save this information for next time</label>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={() => setActiveSection(2)}
                                        className="px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors"
                                    >
                                        Continue to Shipping
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Shipping Address */}
                        <div className="bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader 
                                num="2" 
                                title="Shipping Address" 
                                isActive={activeSection === 2} 
                                isCompleted={activeSection > 2}
                                onClick={() => setActiveSection(2)}
                                rightContent={
                                    activeSection !== 2 ? (
                                        <button className="md:hidden text-[#8C8578]">
                                            <ChevronRight size={18} />
                                        </button>
                                    ) : (
                                        <button className="flex items-center text-[11px] font-medium text-[#3C3428] hover:text-black">
                                            Add New Address <Plus size={14} className="ml-1" />
                                        </button>
                                    )
                                }
                            />
                            
                            {/* Accordion Content */}
                            <div className={`px-5 md:px-6 transition-all duration-500 ease-in-out ${activeSection === 2 ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'}`}>
                                <div className="mt-4 flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-[#8C8578] mb-1.5">Use a saved address</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92]">
                                                <option>Home • Jl. Melati No. 12, Bandung</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-3 text-[#A89F91] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="flex bg-[#F5F2E6] p-1 rounded-md border border-[#EAE8E3]">
                                            <button 
                                                onClick={() => setAddressType('home')}
                                                className={`px-6 py-1.5 text-[12px] font-semibold rounded ${addressType === 'home' ? 'bg-white text-[#3C3428] shadow-sm' : 'text-[#8C8578] hover:text-[#4A4A4A]'} transition-all`}
                                            >
                                                Home
                                            </button>
                                            <button 
                                                onClick={() => setAddressType('office')}
                                                className={`px-6 py-1.5 text-[12px] font-semibold rounded ${addressType === 'office' ? 'bg-white text-[#3C3428] shadow-sm' : 'text-[#8C8578] hover:text-[#4A4A4A]'} transition-all`}
                                            >
                                                Office
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Name</label>
                                        <input type="text" defaultValue="Siti Aisyah" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Phone Number</label>
                                        <input type="tel" defaultValue="0812 3456 789" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Province</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92]">
                                                <option>Jawa Barat</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-3 text-[#A89F91] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">City / Regency</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92]">
                                                <option>Bandung</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-3 text-[#A89F91] pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">District</label>
                                        <div className="relative">
                                            <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92]">
                                                <option>Coblong</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-3 text-[#A89F91] pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Postal Code</label>
                                        <input type="text" defaultValue="40132" className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-[#EF4444] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all" />
                                        <p className="text-[10px] text-[#EF4444] mt-1.5">Please enter a valid postal code</p>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Address / Street Address</label>
                                        <input type="text" defaultValue="Jl. Melati No. 12, RT 03/RW 05, Coblong" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Address Notes (Optional)</label>
                                        <input type="text" placeholder="e.g. Deliver to front gate" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={() => setActiveSection(3)}
                                        className="px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors"
                                    >
                                        Continue to Delivery
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Delivery Method */}
                        <div className="bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader 
                                num="3" 
                                title="Delivery Method" 
                                isActive={activeSection === 3} 
                                isCompleted={activeSection > 3}
                                onClick={() => setActiveSection(3)}
                                rightContent={
                                    activeSection !== 3 ? (
                                        <div className="flex items-center space-x-4">
                                            <div className="hidden md:block text-right">
                                                <p className="text-[12px] font-medium text-[#4A4A4A]">JNE Regular</p>
                                                <p className="text-[12px] font-bold text-[#3C3428]">Rp 18.000</p>
                                            </div>
                                            <button className="md:hidden text-[#8C8578]">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-[#8C8578] flex items-center font-medium">
                                            Shipping powered by <img src="/img/biteship-logo.png" alt="Biteship" className="h-4 ml-1 opacity-60 grayscale" onError={(e) => e.currentTarget.style.display = 'none'} /> <span className="ml-1 font-bold text-[#4A4A4A]">Biteship</span>
                                        </span>
                                    )
                                }
                            />
                            
                            {/* Accordion Content */}
                            <div className={`px-5 md:px-6 transition-all duration-500 ease-in-out ${activeSection === 3 ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {deliveryOptions.map(option => (
                                        <div 
                                            key={option.id}
                                            onClick={() => setDeliveryMethod(option.id)}
                                            className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                                                deliveryMethod === option.id 
                                                    ? 'border-[#C2AA92] bg-[#FAF8F5] shadow-[0_4px_20px_rgba(194,170,146,0.15)] ring-1 ring-[#C2AA92]' 
                                                    : 'border-[#EAE8E3] bg-white hover:border-[#C4BDB1]'
                                            }`}
                                        >
                                            <div className="flex items-start mb-2">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                    deliveryMethod === option.id ? 'border-[#C2AA92]' : 'border-[#C4BDB1]'
                                                }`}>
                                                    {deliveryMethod === option.id && <div className="w-2 h-2 rounded-full bg-[#C2AA92]"></div>}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-[13px] font-bold text-[#3C3428]">{option.name}</h3>
                                                    <p className="text-[11px] text-[#8C8578] mt-0.5">{option.time}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 pl-7">
                                                <p className="text-[14px] font-bold text-[#333333] mb-1">{formatPrice(option.price)}</p>
                                                <p className="text-[10px] text-[#8C8578]">{option.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Skeleton Loader matching design */}
                                <div className="mt-6 border border-[#EAE8E3] bg-[#FAF9F6]/50 rounded-lg p-5 flex items-start space-x-4">
                                    <Box className="text-[#A89F91]" size={24} />
                                    <div className="space-y-3 flex-1">
                                        <p className="text-[12px] font-semibold text-[#8C8578]">Calculating shipping cost...</p>
                                        <div className="h-2 bg-[#EAE8E3] rounded-full w-3/4"></div>
                                        <div className="h-2 bg-[#EAE8E3] rounded-full w-1/2"></div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={() => setActiveSection(4)}
                                        className="px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Payment Method */}
                        <div className="bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader 
                                num="4" 
                                title="Payment Method" 
                                isActive={activeSection === 4} 
                                isCompleted={activeSection > 4}
                                onClick={() => setActiveSection(4)}
                                rightContent={
                                    activeSection === 4 && (
                                        <span className="text-[10px] text-[#8C8578] flex items-center font-medium">
                                            Secure payment powered by <span className="ml-1 font-bold text-[#1E3A8A]">mid</span><span className="font-bold text-[#0EA5E9]">trans</span>
                                        </span>
                                    )
                                }
                            />
                            
                            {/* Accordion Content */}
                            <div className={`px-5 md:px-6 transition-all duration-500 ease-in-out ${activeSection === 4 ? 'max-h-[800px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'}`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                                    {paymentOptions.map(option => {
                                        const Icon = option.icon;
                                        return (
                                            <div 
                                                key={option.id}
                                                onClick={() => setPaymentMethod(option.id)}
                                                className={`relative border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                                                    paymentMethod === option.id 
                                                        ? 'border-[#C2AA92] bg-[#FAF8F5] shadow-[0_4px_20px_rgba(194,170,146,0.15)] ring-1 ring-[#C2AA92]' 
                                                        : 'border-[#EAE8E3] bg-white hover:border-[#C4BDB1]'
                                                }`}
                                            >
                                                <div className="absolute top-3 left-3">
                                                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                                        paymentMethod === option.id ? 'border-[#C2AA92]' : 'border-[#C4BDB1]'
                                                    }`}>
                                                        {paymentMethod === option.id && <div className="w-1.5 h-1.5 rounded-full bg-[#C2AA92]"></div>}
                                                    </div>
                                                </div>
                                                <Icon size={24} strokeWidth={1.5} className={`mb-3 mt-2 ${paymentMethod === option.id ? 'text-[#3C3428]' : 'text-[#A89F91]'}`} />
                                                <h3 className="text-[11px] font-bold text-[#3C3428] leading-tight mb-1">{option.name}</h3>
                                                <p className="text-[9px] text-[#8C8578] leading-tight">{option.desc}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                                
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={() => setActiveSection(5)}
                                        className="px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors"
                                    >
                                        Confirm Payment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 5. Order Notes */}
                        <div className="bg-white/60 backdrop-blur-md border border-[#EAE8E3] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader 
                                num="5" 
                                title="Order Notes" 
                                isActive={activeSection === 5} 
                                isCompleted={false}
                                onClick={() => setActiveSection(5)}
                            />
                            
                            <div className={`px-5 md:px-6 transition-all duration-500 ease-in-out ${activeSection === 5 ? 'max-h-[200px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'}`}>
                                <div className="mt-2 relative">
                                    <textarea 
                                        placeholder="Add a note for your order (optional)" 
                                        className="w-full px-4 py-3 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all resize-none h-24"
                                    ></textarea>
                                    <span className="absolute bottom-3 right-3 text-[10px] text-[#A89F91]">0 / 250</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary (Desktop Sticky) */}
                    <div className="w-full lg:w-[380px] flex-shrink-0 hidden lg:block">
                        <div className="bg-white rounded-2xl border border-[#EAE8E3]/80 p-6 md:p-8 shadow-xl shadow-black/5 sticky top-24">
                            <h2 className="text-xl font-serif text-[#3C3428] mb-6 border-b border-[#EAE8E3] pb-4">Order Summary</h2>
                            
                            {/* Items List */}
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-[60px] aspect-[4/5] rounded-md overflow-hidden bg-[#F5F2E6] flex-shrink-0 relative">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            <span className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-md shadow-sm border-l border-b border-[#EAE8E3]">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h3 className="text-[12px] font-bold text-[#333333] leading-tight mb-1">{item.title}</h3>
                                            <p className="text-[10px] text-[#8C8578] mb-1">Color: {item.color} <br/> Size: {item.size}</p>
                                        </div>
                                        <div className="py-1 text-right">
                                            <p className="text-[12px] font-semibold text-[#333333]">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 text-[12px] text-[#4A4A4A] mb-6 pt-4 border-t border-[#EAE8E3]">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-[#333333]">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Shipping Cost</span>
                                    <span className="font-semibold text-[#333333]">{formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#C05D5D]">
                                    <span>Discount</span>
                                    <span className="font-semibold">- {formatPrice(discount)}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#EAE8E3] pt-4 pb-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-[13px] font-semibold text-[#333333]">Total Payment</span>
                                    <span className="text-2xl font-serif text-[#333333]">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="flex space-x-2 mb-6">
                                <input 
                                    type="text" 
                                    placeholder="Enter promo code" 
                                    className="flex-1 px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE8E3] rounded-md text-[12px] focus:outline-none focus:border-[#C4BDB1] focus:ring-1 focus:ring-[#C4BDB1] transition-all"
                                />
                                <button className="px-5 py-2.5 bg-[#EAE4D9] text-[#4A4A4A] text-[12px] font-semibold rounded-md hover:bg-[#DFD8CC] hover:text-black transition-colors">
                                    Apply
                                </button>
                            </div>

                            {/* Place Order Button */}
                            <div className="space-y-4">
                                <button className="w-full py-4 rounded-lg bg-[#3C3428] text-white text-[13px] font-bold tracking-wider hover:bg-[#2D261C] hover:shadow-lg hover:shadow-[#3C3428]/20 transition-all active:scale-[0.98] flex items-center justify-center">
                                    <Lock size={16} className="mr-2" strokeWidth={2} />
                                    Place Order
                                </button>
                                <div className="text-center pb-2 border-b border-[#EAE8E3]/60">
                                    <Link href="/my-cart" className="inline-block text-[12px] text-[#333333] font-bold underline underline-offset-4 hover:text-black transition-colors">
                                        Back to Cart
                                    </Link>
                                </div>
                                <p className="text-[10px] text-center text-[#8C8578] leading-relaxed">
                                    By placing your order, you agree to our <br/>
                                    <a href="#" className="underline hover:text-[#333]">Terms & Conditions</a> and <a href="#" className="underline hover:text-[#333]">Privacy Policy.</a>
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-4 pt-6 border-t border-[#EAE8E3]/60 bg-[#FAF9F6]/50 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <ShieldCheck size={18} className="text-[#A89F91] flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#4A4A4A]">Secure Payment</p>
                                        <p className="text-[10px] text-[#8C8578]">Your payment is protected with encryption</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Box size={18} className="text-[#A89F91] flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#4A4A4A]">Trusted Delivery</p>
                                        <p className="text-[10px] text-[#8C8578]">Shipping powered by Biteship</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <HeadphonesIcon size={18} className="text-[#A89F91] flex-shrink-0" strokeWidth={1.5} />
                                    <div>
                                        <p className="text-[11px] font-bold text-[#4A4A4A]">Customer Support</p>
                                        <p className="text-[10px] text-[#8C8578]">We're here to help you anytime</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Mobile Floating Checkout Footer */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EAE8E3] p-4 pb-safe flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 transform translate-y-0 transition-transform">
                    <div>
                        <p className="text-[10px] text-[#8C8578] mb-0.5 font-medium">Total Payment</p>
                        <p className="text-lg font-serif text-[#333333]">{formatPrice(total)}</p>
                    </div>
                    <button className="px-6 py-3 bg-[#3C3428] text-white rounded-md text-xs font-bold tracking-wide hover:bg-[#2D261C] transition-colors active:scale-95 flex items-center">
                        Place Order
                    </button>
                </div>
            </main>
        </ShopLayout>
    );
}
