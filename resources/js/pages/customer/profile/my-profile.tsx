import { Link, useForm, usePage } from '@inertiajs/react';
import {
    User, MapPin, Camera, Eye, EyeOff,
    ChevronRight, Loader2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import ProfileLayout from '@/layouts/profile-layout';

type UserProp = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    member_since: string | null;
};

type AddressProp = {
    id: number;
    label: string | null;
    recipient_name: string;
    recipient_phone: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string | null;
    postal_code: string;
    full_address: string;
    note: string | null;
    is_default: boolean;
};

type PageProps = {
    defaultAddress: AddressProp | null;
    user: UserProp;
};

export default function MyProfile() {
    const { defaultAddress, user } = usePage<PageProps>().props;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // --- Personal Info Form ---
    const profileForm = useForm<{
        name: string;
        email: string;
        phone: string;
        avatar_url: File | null;
    }>({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        avatar_url: null,
    });

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.transform((data) => ({
            ...data,
            _method: 'patch',
        }));
        profileForm.post(ProfileController.update['/my-profile'].url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                selectAvatar(null);

                if (avatarInputRef.current) {
                    avatarInputRef.current.value = '';
                }
            },
        });
    };

    const selectAvatar = (file: File | null) => {
        profileForm.setData('avatar_url', file);

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    };

    // --- Password UI ---
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put(SecurityController.update.url(), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: () => passwordForm.reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const avatarSrc = avatarPreview || user.avatar_url || '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp';

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
                        <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-serif text-[#3C3428] mb-1">{user.name}</h2>
                        <p className="text-[12px] md:text-[13px] text-[#4A4A4A] mb-1">{user.email}</p>
                        {user.member_since && (
                            <p className="text-[11px] text-[#8C8578] mb-3">Member since {user.member_since}</p>
                        )}
                    </div>
                </div>

                {/* Default Avatar Info (Desktop Only) */}
                <div className="hidden lg:flex items-center pl-8 border-l border-[#EAE8E3] max-w-[280px]">
                    <div className="w-12 h-12 rounded-full bg-[#F5F2E6] flex-shrink-0 mr-4 overflow-hidden border border-[#EAE8E3] opacity-60">
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

            {/* Masonry-like Grid for Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                {/* --- Left Column: Personal Information --- */}
                <form
                    onSubmit={submitProfile}
                    className="bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                        <User size={18} className="text-[#3C3428] mr-2" />
                        <h3 className="text-lg font-serif text-[#3C3428]">Personal Information</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className={`w-full px-4 py-2.5 bg-white border rounded-md text-[13px] text-[#333] focus:outline-none focus:ring-1 transition-all ${
                                    profileForm.errors.name
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.name && (
                                <p className="text-[10px] text-red-500 mt-1">{profileForm.errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className={`w-full px-4 py-2.5 bg-white border rounded-md text-[13px] text-[#333] focus:outline-none focus:ring-1 transition-all ${
                                    profileForm.errors.email
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.email && (
                                <p className="text-[10px] text-red-500 mt-1">{profileForm.errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                placeholder="e.g. 0812 3456 789"
                                className={`w-full px-4 py-2.5 bg-white border rounded-md text-[13px] text-[#333] focus:outline-none focus:ring-1 transition-all ${
                                    profileForm.errors.phone
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.phone && (
                                <p className="text-[10px] text-red-500 mt-1">{profileForm.errors.phone}</p>
                            )}
                        </div>

                        {/* Avatar Upload */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">Avatar Image <span className="font-normal text-[#8C8578]">(optional)</span></label>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => selectAvatar(e.target.files?.[0] ?? null)}
                                className={`w-full px-4 py-2.5 bg-white border rounded-md text-[13px] text-[#333] focus:outline-none focus:ring-1 transition-all ${
                                    profileForm.errors.avatar_url
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.avatar_url && (
                                <p className="text-[10px] text-red-500 mt-1">{profileForm.errors.avatar_url}</p>
                            )}
                            <p className="mt-1.5 text-[10px] text-[#8C8578]">
                                JPG, PNG, or WEBP. Max 2MB.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {profileForm.processing && <Loader2 size={14} className="animate-spin" />}
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => profileForm.reset()}
                                className="px-6 py-2.5 bg-white border border-[#EAE8E3] text-[#4A4A4A] text-[12px] font-bold tracking-wider rounded-md hover:bg-[#FAF9F6] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>

                {/* --- Right Column: Security & Address --- */}
                <div className="space-y-6">

                    {/* Change Password */}
                    <form
                        onSubmit={submitPassword}
                        className="bg-white border border-[#EAE8E3] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in-up"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="flex items-center mb-6 border-b border-[#EAE8E3] pb-4">
                            <LockIcon size={18} className="text-[#3C3428] mr-2" />
                            <h3 className="text-lg font-serif text-[#3C3428]">Change Password</h3>
                        </div>
                        <div className="space-y-4">
                            <PasswordField
                                label="Current Password"
                                show={showPassword1}
                                onToggle={() => setShowPassword1(!showPassword1)}
                                value={passwordForm.data.current_password}
                                onChange={(value) => passwordForm.setData('current_password', value)}
                                error={passwordForm.errors.current_password}
                                autoComplete="current-password"
                            />
                            <PasswordField
                                label="New Password"
                                show={showPassword2}
                                onToggle={() => setShowPassword2(!showPassword2)}
                                value={passwordForm.data.password}
                                onChange={(value) => passwordForm.setData('password', value)}
                                error={passwordForm.errors.password}
                                autoComplete="new-password"
                                hint="Use at least 8 characters with a mix of letters and numbers."
                                hintColor="text-[#EF4444]"
                            />
                            <PasswordField
                                label="Confirm New Password"
                                show={showPassword3}
                                onToggle={() => setShowPassword3(!showPassword3)}
                                value={passwordForm.data.password_confirmation}
                                onChange={(value) => passwordForm.setData('password_confirmation', value)}
                                error={passwordForm.errors.password_confirmation}
                                autoComplete="new-password"
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3C3428] text-white text-[12px] font-bold tracking-wider rounded-md hover:bg-[#2D261C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {passwordForm.processing && <Loader2 size={14} className="animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Default Address */}
                    <div className="bg-white border border-[#EAE8E3] rounded-2xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <MapPin size={18} className="text-[#3C3428] mr-2" />
                                <h3 className="text-lg font-serif text-[#3C3428]">Default Address</h3>
                            </div>
                        </div>
                        {defaultAddress ? (
                            <div className="mb-6 space-y-3 text-[12px]">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-[#333]">{defaultAddress.recipient_name}</p>
                                    <span className="rounded-md bg-[#F5F2E6] px-3 py-1 text-[10px] font-bold text-[#3C3428]">
                                        {defaultAddress.label ?? 'Default'}
                                    </span>
                                </div>
                                <p className="text-[#4A4A4A]">{defaultAddress.recipient_phone}</p>
                                <p className="leading-relaxed text-[#4A4A4A]">{defaultAddress.full_address}</p>
                                <p className="text-[#8C8578]">
                                    {[defaultAddress.district, defaultAddress.city, defaultAddress.province, defaultAddress.postal_code]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                {defaultAddress.note && (
                                    <p className="rounded-md bg-[#FAF9F6] px-3 py-2 text-[#8C8578]">{defaultAddress.note}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-[12px] text-[#8C8578] mb-6 leading-relaxed">
                                No default address yet. Add one for faster checkout.
                            </p>
                        )}
                        <Link
                            href="/address"
                            className="block w-full px-4 py-2 bg-white border border-[#EAE8E3] text-center text-[#3C3428] text-[12px] font-bold tracking-wider rounded-md hover:bg-[#FAF9F6] transition-colors"
                        >
                            Manage Addresses
                        </Link>
                    </div>
                </div>

            </div>

        </ProfileLayout>
    );
}

// --- Sub-components ---

function PasswordField({
    label,
    show,
    onToggle,
    value,
    onChange,
    error,
    autoComplete,
    hint,
    hintColor = 'text-[#8C8578]',
}: {
    label: string;
    show: boolean;
    onToggle: () => void;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    autoComplete: string;
    hint?: string;
    hintColor?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-[#4A4A4A] mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    className={`w-full px-4 py-2.5 bg-white border rounded-md text-[13px] text-[#333] focus:outline-none focus:ring-1 transition-all pr-10 ${
                        error
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                            : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#333]"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
            {hint && <p className={`text-[10px] mt-1.5 ${hintColor}`}>{hint}</p>}
        </div>
    );
}

function LockIcon(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
    const { size = 24, ...svgProps } = props;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...svgProps}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
