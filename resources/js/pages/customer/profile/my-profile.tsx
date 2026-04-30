import { Link } from '@inertiajs/react';
import {
    User, MapPin, Bell, Camera, CheckCircle2, X, Eye, EyeOff, Calendar,
    ChevronDown, ChevronRight
} from 'lucide-react';
import React, { useState } from 'react';
import ProfileLayout from '@/layouts/profile-layout';

export default function MyProfile() {
    const [showAlert, setShowAlert] = useState(true);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);

    // Toggles state
    const [toggles, setToggles] = useState({
        orderUpdates: true,
        shippingNotif: true,
        promoEmails: false,
        newArrivals: true,
        newsletter: true
    });

    const toggleSwitch = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ProfileLayout
            title="Profile Settings"
            pageTitle="Profile Settings"
            subtitle="Manage your personal information and account preferences."
            activePath="my-profile"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Profile Settings' }
            ]}
        >

            {/* Profile Header Card */}
            <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm animate-fade-in-up">
                <div className="flex items-center space-x-6 mb-6 md:mb-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#F5F2E6] relative group cursor-pointer">
                        <img src="/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp" alt="Siti Aisyah" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-1">Siti Aisyah</h2>
                        <p className="text-[12px] md:text-[13px] text-[#4A4A4A] mb-1">siti.aisyah@email.com</p>
                        <p className="text-[11px] text-[#8C8578] mb-3">Member since 2026</p>
                        <button className="flex items-center px-4 py-1.5 border border-[#EAE8E3] rounded-md text-[11px] font-semibold text-[#4A4A4A] hover:bg-[#FAF9F6] transition-colors">
                            <Camera size={14} className="mr-2" /> Change Photo
                        </button>
                    </div>
                </div>

                {/* Default Avatar Info (Desktop Only) */}
                <div className="hidden lg:flex items-center pl-8 border-l border-[#EAE8E3] max-w-[280px]">
                    <div className="w-12 h-12 rounded-full bg-[#F5F2E6] flex-shrink-0 mr-4 overflow-hidden border border-[#EAE8E3] opacity-60">
                        {/* Placeholder illustration */}
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full pt-2">
                            <path d="M50 55C63.8071 55 75 43.8071 75 30C75 16.1929 63.8071 5 50 5C36.1929 5 25 16.1929 25 30C25 43.8071 36.1929 55 50 55Z" fill="#D8D2C4" />
                            <path d="M15 95C15 75.67 30.67 60 50 60C69.33 60 85 75.67 85 95V100H15V95Z" fill="#D8D2C4" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold text-[#333] mb-0.5">Default avatar</h4>
                        <p className="text-[10px] text-[#8C8578] leading-tight">This will be used as your avatar if no photo is set.</p>
                    </div>
                    <ChevronRight size={16} className="text-[#A89F91] ml-4 flex-shrink-0" />
                </div>
            </div>

            {/* Success Alert */}
            {showAlert && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-3 rounded-lg flex items-center justify-between text-[12px] font-medium animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center">
                        <CheckCircle2 size={16} className="mr-2 text-[#22C55E]" />
                        Your profile has been updated successfully.
                    </div>
                    <button onClick={() => setShowAlert(false)} className="text-[#166534] hover:text-black transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Masonry-like Grid for Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* --- Left Column: Personal Information --- */}
                <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                        <User size={18} className="text-[#3C3428] mr-2" />
                        <h3 className="text-lg font-serif text-[#3C3428]">Personal Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Name</label>
                            <input type="text" defaultValue="Siti Aisyah" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Email Address</label>
                            <input type="email" defaultValue="siti.aisyah@email.com" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Phone Number</label>
                            <input type="tel" defaultValue="0812 3456 789" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Date of Birth</label>
                                <div className="relative">
                                    <input type="text" defaultValue="12 / 05 / 1995" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Gender</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all">
                                        <option>Female</option>
                                        <option>Male</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Username (optional)</label>
                            <input type="text" defaultValue="sitiaisyah" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all" />
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] hover:shadow-lg transition-all active:scale-[0.98]">
                                Save Changes
                            </button>
                            <button className="px-6 py-2.5 bg-white border border-[#EAE8E3] text-[#4A4A4A] text-[12px] font-bold tracking-wider rounded-md hover:bg-[#FAF9F6] transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Security, Address, Notifications --- */}
                <div className="space-y-6">

                    {/* Change Password */}
                    <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                            <LockIcon size={18} className="text-[#3C3428] mr-2" />
                            <h3 className="text-lg font-serif text-[#3C3428]">Change Password</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Current Password</label>
                                <div className="relative">
                                    <input type={showPassword1 ? "text" : "password"} defaultValue="password123" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all pr-10" />
                                    <button onClick={() => setShowPassword1(!showPassword1)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#333]">
                                        {showPassword1 ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">New Password</label>
                                <div className="relative">
                                    <input type={showPassword2 ? "text" : "password"} defaultValue="password" className="w-full px-4 py-2.5 bg-[#FFF5F5] border border-[#EF4444] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all pr-10" />
                                    <button onClick={() => setShowPassword2(!showPassword2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EF4444] hover:text-red-700">
                                        {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-[#EF4444] mt-1.5">Use at least 8 characters with a mix of letters and numbers.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input type={showPassword3 ? "text" : "password"} defaultValue="password" className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all pr-10" />
                                    <button onClick={() => setShowPassword3(!showPassword3)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#333]">
                                        {showPassword3 ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button className="w-full px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <MapPin size={18} className="text-[#3C3428] mr-2" />
                                <h3 className="text-lg font-serif text-[#3C3428]">Default Address</h3>
                            </div>
                            <span className="px-3 py-1 bg-[#F5F2E6] text-[#3C3428] text-[10px] font-bold rounded-md">Home</span>
                        </div>
                        <div className="text-[12px] text-[#4A4A4A] space-y-1.5 mb-6">
                            <p className="font-semibold text-[#333]">Siti Aisyah</p>
                            <p>0812 3456 789</p>
                            <p className="leading-relaxed">Jl. Melati No. 12, Coblong,<br />Bandung, Jawa Barat 40132</p>
                        </div>
                        <Link href="/address" className="block w-full px-4 py-2 bg-white border border-[#EAE8E3] text-center text-[#3C3428] text-[12px] font-bold tracking-wider rounded-md hover:bg-[#FAF9F6] transition-colors">
                            Manage Addresses
                        </Link>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                            <Bell size={18} className="text-[#3C3428] mr-2" />
                            <h3 className="text-lg font-serif text-[#3C3428]">Notification Preferences</h3>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold text-[#333] mb-0.5">Order updates</p>
                                    <p className="text-[10px] text-[#8C8578]">Get notified about your order status</p>
                                </div>
                                <ToggleSwitch active={toggles.orderUpdates} onClick={() => toggleSwitch('orderUpdates')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold text-[#333] mb-0.5">Shipping notifications</p>
                                    <p className="text-[10px] text-[#8C8578]">Receive shipping and delivery updates</p>
                                </div>
                                <ToggleSwitch active={toggles.shippingNotif} onClick={() => toggleSwitch('shippingNotif')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold text-[#333] mb-0.5">Promotional emails</p>
                                    <p className="text-[10px] text-[#8C8578]">Receive offers and promotions</p>
                                </div>
                                <ToggleSwitch active={toggles.promoEmails} onClick={() => toggleSwitch('promoEmails')} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold text-[#333] mb-0.5">New arrivals and special offers</p>
                                    <p className="text-[10px] text-[#8C8578]">Be the first to know</p>
                                </div>
                                <ToggleSwitch active={toggles.newArrivals} onClick={() => toggleSwitch('newArrivals')} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Full Width Bottom: Account Preferences --- */}
                <div className="md:col-span-2 bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                    <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                        <SettingsIcon size={18} className="text-[#3C3428] mr-2" />
                        <h3 className="text-lg font-serif text-[#3C3428]">Account Preferences</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Preferred Language</label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 bg-white border border-[#EAE8E3] rounded-md text-[13px] text-[#333] appearance-none focus:outline-none focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] transition-all">
                                        <option>English</option>
                                        <option>Indonesian</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[12px] font-semibold text-[#333] mb-0.5">Newsletter Subscription</p>
                                    <p className="text-[10px] text-[#8C8578] max-w-[200px]">Receive updates on new arrivals, offers and more.</p>
                                </div>
                                <ToggleSwitch active={toggles.newsletter} onClick={() => toggleSwitch('newsletter')} />
                            </div>
                        </div>
                        <div className="space-y-4 md:border-l border-[#EAE8E3] md:pl-8 flex flex-col justify-center">
                            <Link href="/privacy-policy" className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-[#F5F2E6] transition-colors group">
                                <div className="text-left">
                                    <p className="text-[13px] font-semibold text-[#333] mb-0.5 group-hover:text-[#3C3428]">Privacy Settings</p>
                                    <p className="text-[10px] text-[#8C8578]">Manage how your data is used</p>
                                </div>
                                <ChevronRight size={16} className="text-[#A89F91] group-hover:text-[#3C3428]" />
                            </Link>
                            <button className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-red-50 transition-colors group">
                                <div className="text-left">
                                    <p className="text-[13px] font-semibold text-[#EF4444] mb-0.5">Delete Account</p>
                                    <p className="text-[10px] text-[#8C8578] group-hover:text-red-400">Permanently delete your account</p>
                                </div>
                                <ChevronRight size={16} className="text-[#EF4444]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </ProfileLayout>
    );
}

// Reusable toggle component
function ToggleSwitch({ active, onClick }: { active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${active ? 'bg-[#3C3428]' : 'bg-[#EAE8E3]'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow-sm ${active ? 'left-[22px]' : 'left-0.5'}`}></div>
        </button>
    );
}

// Custom icons to perfectly match design if missing in lucide
function LockIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function SettingsIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
