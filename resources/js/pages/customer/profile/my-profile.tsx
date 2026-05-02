import { Link, useForm, usePage } from '@inertiajs/react';
import {
    User,
    MapPin,
    Camera,
    Eye,
    EyeOff,
    ChevronRight,
    Loader2,
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
            onError: () =>
                passwordForm.reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const avatarSrc =
        avatarPreview ||
        user.avatar_url ||
        '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.webp';

    return (
        <ProfileLayout
            title="Profile Settings"
            pageTitle="Profile Settings"
            subtitle="Manage your personal information and account preferences."
            activePath="my-profile"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Profile Settings' },
            ]}
        >
            {/* Profile Header Card */}
            <div className="animate-fade-in-up flex flex-col items-start justify-between rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
                <div className="mb-6 flex items-center space-x-6 md:mb-0">
                    <div className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border-4 border-[#F5F2E6] md:h-24 md:w-24">
                        <img
                            src={avatarSrc}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div>
                        <h2 className="mb-1 font-serif text-xl text-[#3C3428] md:text-2xl">
                            {user.name}
                        </h2>
                        <p className="mb-1 text-[12px] text-[#4A4A4A] md:text-[13px]">
                            {user.email}
                        </p>
                        {user.member_since && (
                            <p className="mb-3 text-[11px] text-[#8C8578]">
                                Member since {user.member_since}
                            </p>
                        )}
                    </div>
                </div>

                {/* Default Avatar Info (Desktop Only) */}
                <div className="hidden max-w-[280px] items-center border-l border-[#EAE8E3] pl-8 lg:flex">
                    <div className="mr-4 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-[#EAE8E3] bg-[#F5F2E6] opacity-60">
                        <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-full w-full pt-2"
                        >
                            <path
                                d="M50 55C63.8071 55 75 43.8071 75 30C75 16.1929 63.8071 5 50 5C36.1929 5 25 16.1929 25 30C25 43.8071 36.1929 55 50 55Z"
                                fill="#D8D2C4"
                            />
                            <path
                                d="M15 95C15 75.67 30.67 60 50 60C69.33 60 85 75.67 85 95V100H15V95Z"
                                fill="#D8D2C4"
                            />
                        </svg>
                    </div>
                    <div>
                        <h4 className="mb-0.5 text-[12px] font-bold text-[#333]">
                            Default avatar
                        </h4>
                        <p className="text-[10px] leading-tight text-[#8C8578]">
                            This will be used as your avatar if no photo is set.
                        </p>
                    </div>
                    <ChevronRight
                        size={16}
                        className="ml-4 flex-shrink-0 text-[#A89F91]"
                    />
                </div>
            </div>

            {/* Masonry-like Grid for Forms */}
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                {/* --- Left Column: Personal Information --- */}
                <form
                    onSubmit={submitProfile}
                    className="animate-fade-in-up rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm md:p-8"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="mb-6 flex items-center border-b border-[#EAE8E3] pb-4">
                        <User size={18} className="mr-2 text-[#3C3428]" />
                        <h3 className="font-serif text-lg text-[#3C3428]">
                            Personal Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={profileForm.data.name}
                                onChange={(e) =>
                                    profileForm.setData('name', e.target.value)
                                }
                                className={`w-full rounded-md border bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:ring-1 focus:outline-none ${
                                    profileForm.errors.name
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.name && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileForm.errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) =>
                                    profileForm.setData('email', e.target.value)
                                }
                                className={`w-full rounded-md border bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:ring-1 focus:outline-none ${
                                    profileForm.errors.email
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.email && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileForm.errors.email}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) =>
                                    profileForm.setData('phone', e.target.value)
                                }
                                placeholder="e.g. 0812 3456 789"
                                className={`w-full rounded-md border bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:ring-1 focus:outline-none ${
                                    profileForm.errors.phone
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.phone && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileForm.errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Avatar Upload */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Avatar Image{' '}
                                <span className="font-normal text-[#8C8578]">
                                    (optional)
                                </span>
                            </label>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) =>
                                    selectAvatar(e.target.files?.[0] ?? null)
                                }
                                className={`w-full rounded-md border bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:ring-1 focus:outline-none ${
                                    profileForm.errors.avatar_url
                                        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                        : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                                }`}
                            />
                            {profileForm.errors.avatar_url && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileForm.errors.avatar_url}
                                </p>
                            )}
                            <p className="mt-1.5 text-[10px] text-[#8C8578]">
                                JPG, PNG, or WEBP. Max 2MB.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#3C3428] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-all hover:bg-[#2D261C] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {profileForm.processing && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                )}
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => profileForm.reset()}
                                className="rounded-md border border-[#EAE8E3] bg-white px-6 py-2.5 text-[12px] font-bold tracking-wider text-[#4A4A4A] transition-colors hover:bg-[#FAF9F6]"
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
                        className="animate-fade-in-up rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm md:p-8"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="mb-6 flex items-center border-b border-[#EAE8E3] pb-4">
                            <LockIcon
                                size={18}
                                className="mr-2 text-[#3C3428]"
                            />
                            <h3 className="font-serif text-lg text-[#3C3428]">
                                Change Password
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <PasswordField
                                label="Current Password"
                                show={showPassword1}
                                onToggle={() =>
                                    setShowPassword1(!showPassword1)
                                }
                                value={passwordForm.data.current_password}
                                onChange={(value) =>
                                    passwordForm.setData(
                                        'current_password',
                                        value,
                                    )
                                }
                                error={passwordForm.errors.current_password}
                                autoComplete="current-password"
                            />
                            <PasswordField
                                label="New Password"
                                show={showPassword2}
                                onToggle={() =>
                                    setShowPassword2(!showPassword2)
                                }
                                value={passwordForm.data.password}
                                onChange={(value) =>
                                    passwordForm.setData('password', value)
                                }
                                error={passwordForm.errors.password}
                                autoComplete="new-password"
                                hint="Use at least 8 characters with a mix of letters and numbers."
                                hintColor="text-[#EF4444]"
                            />
                            <PasswordField
                                label="Confirm New Password"
                                show={showPassword3}
                                onToggle={() =>
                                    setShowPassword3(!showPassword3)
                                }
                                value={passwordForm.data.password_confirmation}
                                onChange={(value) =>
                                    passwordForm.setData(
                                        'password_confirmation',
                                        value,
                                    )
                                }
                                error={
                                    passwordForm.errors.password_confirmation
                                }
                                autoComplete="new-password"
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#3C3428] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-colors hover:bg-[#2D261C] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {passwordForm.processing && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Default Address */}
                    <div
                        className="animate-fade-in-up rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm"
                        style={{ animationDelay: '250ms' }}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <MapPin
                                    size={18}
                                    className="mr-2 text-[#3C3428]"
                                />
                                <h3 className="font-serif text-lg text-[#3C3428]">
                                    Default Address
                                </h3>
                            </div>
                        </div>
                        {defaultAddress ? (
                            <div className="mb-6 space-y-3 text-[12px]">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-[#333]">
                                        {defaultAddress.recipient_name}
                                    </p>
                                    <span className="rounded-md bg-[#F5F2E6] px-3 py-1 text-[10px] font-bold text-[#3C3428]">
                                        {defaultAddress.label ?? 'Default'}
                                    </span>
                                </div>
                                <p className="text-[#4A4A4A]">
                                    {defaultAddress.recipient_phone}
                                </p>
                                <p className="leading-relaxed text-[#4A4A4A]">
                                    {defaultAddress.full_address}
                                </p>
                                <p className="text-[#8C8578]">
                                    {[
                                        defaultAddress.district,
                                        defaultAddress.city,
                                        defaultAddress.province,
                                        defaultAddress.postal_code,
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                {defaultAddress.note && (
                                    <p className="rounded-md bg-[#FAF9F6] px-3 py-2 text-[#8C8578]">
                                        {defaultAddress.note}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mb-6 text-[12px] leading-relaxed text-[#8C8578]">
                                No default address yet. Add one for faster
                                checkout.
                            </p>
                        )}
                        <Link
                            href="/address"
                            className="block w-full rounded-md border border-[#EAE8E3] bg-white px-4 py-2 text-center text-[12px] font-bold tracking-wider text-[#3C3428] transition-colors hover:bg-[#FAF9F6]"
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
            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    className={`w-full rounded-md border bg-white px-4 py-2.5 pr-10 text-[13px] text-[#333] transition-all focus:ring-1 focus:outline-none ${
                        error
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                            : 'border-[#EAE8E3] focus:border-[#C2AA92] focus:ring-[#C2AA92]'
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#A89F91] hover:text-[#333]"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
            {hint && (
                <p className={`mt-1.5 text-[10px] ${hintColor}`}>{hint}</p>
            )}
        </div>
    );
}

function LockIcon(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
    const { size = 24, ...svgProps } = props;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...svgProps}
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}
