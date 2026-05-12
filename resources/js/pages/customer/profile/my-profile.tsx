import { Link, useForm, usePage } from '@inertiajs/react';
import {
    User,
    MapPin,
    Camera,
    Eye,
    EyeOff,
    Loader2,
    LogOut,
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

type ProfileClientErrors = {
    name?: string;
    email?: string;
};

type PasswordClientErrors = {
    current_password?: string;
    password?: string;
    password_confirmation?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toIndonesianError = (message?: string) => {
    if (!message) {
        return undefined;
    }

    const normalized = message.toLowerCase();

    if (
        normalized.includes('required') ||
        normalized.includes('tidak boleh kosong')
    ) {
        if (normalized.includes('name')) {
            return 'Nama lengkap tidak boleh kosong';
        }

        if (normalized.includes('email')) {
            return 'Email tidak boleh kosong';
        }

        if (normalized.includes('current_password')) {
            return 'Kata sandi saat ini tidak boleh kosong';
        }

        if (normalized.includes('password_confirmation')) {
            return 'Konfirmasi kata sandi tidak boleh kosong';
        }

        if (normalized.includes('password')) {
            return 'Kata sandi baru tidak boleh kosong';
        }
    }

    if (normalized.includes('valid email') || normalized.includes('must be a valid email')) {
        return 'Format email tidak valid';
    }

    if (
        normalized.includes('confirmation does not match') ||
        normalized.includes('must match') ||
        normalized.includes('tidak sesuai')
    ) {
        return 'Konfirmasi kata sandi tidak sesuai';
    }

    if (normalized.includes('current password is incorrect')) {
        return 'Kata sandi saat ini tidak sesuai';
    }

    if (normalized.includes('at least 8') || normalized.includes('minimum 8')) {
        return 'Kata sandi minimal 8 karakter';
    }

    return message;
};

export default function MyProfile() {
    const { defaultAddress, user } = usePage<PageProps>().props;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [profileClientErrors, setProfileClientErrors] =
        useState<ProfileClientErrors>({});
    const [passwordClientErrors, setPasswordClientErrors] =
        useState<PasswordClientErrors>({});

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

    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const selectAvatar = (file: File | null) => {
        profileForm.setData('avatar_url', file);

        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarPreview(file ? URL.createObjectURL(file) : null);
    };

    const submitProfile = (e: React.FormEvent) => {
        e.preventDefault();

        const nextErrors: ProfileClientErrors = {};
        const trimmedName = profileForm.data.name.trim();
        const trimmedEmail = profileForm.data.email.trim();

        if (trimmedName === '') {
            nextErrors.name = 'Nama lengkap tidak boleh kosong';
        }

        if (trimmedEmail === '') {
            nextErrors.email = 'Email tidak boleh kosong';
        } else if (!emailRegex.test(trimmedEmail)) {
            nextErrors.email = 'Format email tidak valid';
        }

        if (Object.keys(nextErrors).length > 0) {
            setProfileClientErrors(nextErrors);

            return;
        }

        setProfileClientErrors({});
        profileForm.transform((data) => ({
            ...data,
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            _method: 'patch',
        }));
        profileForm.post(ProfileController.update['/my-profile'].url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setProfileClientErrors({});
                selectAvatar(null);

                if (avatarInputRef.current) {
                    avatarInputRef.current.value = '';
                }
            },
            onError: () => {
                setProfileClientErrors({});
            },
            onFinish: () => {
                profileForm.transform((data) => data);
            },
        });
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();

        const nextErrors: PasswordClientErrors = {};
        const currentPassword = passwordForm.data.current_password.trim();
        const password = passwordForm.data.password.trim();
        const passwordConfirmation =
            passwordForm.data.password_confirmation.trim();

        if (currentPassword === '') {
            nextErrors.current_password =
                'Kata sandi saat ini tidak boleh kosong';
        }

        if (password === '') {
            nextErrors.password = 'Kata sandi baru tidak boleh kosong';
        } else if (password.length < 8) {
            nextErrors.password = 'Kata sandi minimal 8 karakter';
        }

        if (passwordConfirmation === '') {
            nextErrors.password_confirmation =
                'Konfirmasi kata sandi tidak boleh kosong';
        } else if (passwordConfirmation !== password) {
            nextErrors.password_confirmation =
                'Konfirmasi kata sandi tidak sesuai';
        }

        if (Object.keys(nextErrors).length > 0) {
            setPasswordClientErrors(nextErrors);

            return;
        }

        setPasswordClientErrors({});
        passwordForm.put(SecurityController.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setPasswordClientErrors({});
                passwordForm.reset();
            },
            onError: () => {
                setPasswordClientErrors({});
                passwordForm.reset('password', 'password_confirmation');
            },
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
            title="Pengaturan Profil"
            pageTitle="Pengaturan Profil"
            subtitle="Kelola informasi pribadi dan preferensi akunmu."
            activePath="my-profile"
            breadcrumbs={[
                { label: 'Beranda', href: '/' },
                { label: 'Akun Saya', href: '/my-profile' },
                { label: 'Pengaturan Profil' },
            ]}
        >
            <div className="animate-fade-in-up flex flex-col items-start justify-between border-b border-[#EADBD8] pb-8 md:flex-row md:items-center">
                <div className="mb-6 flex items-center space-x-6 md:mb-0">
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border border-[#EADBD8] md:h-24 md:w-24"
                    >
                        <img
                            src={avatarSrc}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="text-white" size={24} />
                        </div>
                    </button>
                    <div>
                        <h2 className="mb-1 font-serif text-xl text-[#4A2525] md:text-2xl">
                            {user.name}
                        </h2>
                        <p className="mb-1 text-[12px] text-[#4A4A4A] md:text-[13px]">
                            {user.email}
                        </p>
                        {user.member_since && (
                            <p className="mb-3 text-[11px] text-[#8A6B62]">
                                Member sejak {user.member_since}
                            </p>
                        )}
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-12">
                <form
                    onSubmit={submitProfile}
                    className="animate-fade-in-up border-b border-[#EADBD8] pb-10 md:border-b-0"
                    style={{ animationDelay: '150ms' }}
                >
                    <div className="mb-6 flex items-center border-b border-[#EADBD8] pb-4">
                        <User size={18} className="mr-2 text-[#4A2525]" />
                        <h3 className="font-serif text-lg text-[#4A2525]">
                            Informasi Pribadi
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={profileForm.data.name}
                                onChange={(e) => {
                                    profileForm.setData('name', e.target.value);
                                    setProfileClientErrors((current) => ({
                                        ...current,
                                        name: undefined,
                                    }));
                                }}
                                className={`w-full border-b bg-transparent px-1 py-2.5 text-[13px] text-[#333] transition-colors focus:outline-none ${
                                    profileClientErrors.name ||
                                    profileForm.errors.name
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-[#EADBD8] focus:border-[#4A2525]'
                                }`}
                            />
                            {(profileClientErrors.name ||
                                profileForm.errors.name) && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileClientErrors.name ||
                                        toIndonesianError(
                                            profileForm.errors.name,
                                        )}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                required
                                value={profileForm.data.email}
                                onChange={(e) => {
                                    profileForm.setData('email', e.target.value);
                                    setProfileClientErrors((current) => ({
                                        ...current,
                                        email: undefined,
                                    }));
                                }}
                                className={`w-full border-b bg-transparent px-1 py-2.5 text-[13px] text-[#333] transition-colors focus:outline-none ${
                                    profileClientErrors.email ||
                                    profileForm.errors.email
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-[#EADBD8] focus:border-[#4A2525]'
                                }`}
                            />
                            {(profileClientErrors.email ||
                                profileForm.errors.email) && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {profileClientErrors.email ||
                                        toIndonesianError(
                                            profileForm.errors.email,
                                        )}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                value={profileForm.data.phone}
                                onChange={(e) =>
                                    profileForm.setData('phone', e.target.value)
                                }
                                placeholder="contoh 0812 3456 789"
                                className={`w-full border-b bg-transparent px-1 py-2.5 text-[13px] text-[#333] transition-colors focus:outline-none ${
                                    profileForm.errors.phone
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-[#EADBD8] focus:border-[#4A2525]'
                                }`}
                            />
                            {profileForm.errors.phone && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {toIndonesianError(profileForm.errors.phone)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                Foto Avatar{' '}
                                <span className="font-normal text-[#8A6B62]">
                                    (opsional)
                                </span>
                            </label>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) =>
                                    selectAvatar(e.target.files?.[0] ?? null)
                                }
                                className={`w-full border-b bg-transparent px-1 py-2.5 text-[13px] text-[#333] transition-colors file:mr-4 file:border-0 file:bg-[#F1E6E2] file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-[#4A2525] focus:outline-none ${
                                    profileForm.errors.avatar_url
                                        ? 'border-red-400 focus:border-red-400'
                                        : 'border-[#EADBD8] focus:border-[#4A2525]'
                                }`}
                            />
                            {profileForm.errors.avatar_url && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {toIndonesianError(
                                        profileForm.errors.avatar_url,
                                    )}
                                </p>
                            )}
                            <p className="mt-1.5 text-[10px] text-[#8A6B62]">
                                JPG, PNG, atau WEBP. Maks 2MB.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#4A2525] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-colors hover:bg-[#5F1717] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {profileForm.processing && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                )}
                                Simpan Perubahan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    profileForm.reset();
                                    setProfileClientErrors({});
                                }}
                                className="rounded-md border border-[#EADBD8] bg-transparent px-6 py-2.5 text-[12px] font-bold tracking-wider text-[#4A4A4A] transition-colors hover:bg-white"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </form>

                <div className="space-y-10">
                    <form
                        onSubmit={submitPassword}
                        className="animate-fade-in-up border-b border-[#EADBD8] pb-10"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="mb-6 flex items-center border-b border-[#EADBD8] pb-4">
                            <LockIcon
                                size={18}
                                className="mr-2 text-[#4A2525]"
                            />
                            <h3 className="font-serif text-lg text-[#4A2525]">
                                Ubah Kata Sandi
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <PasswordField
                                label="Kata Sandi Saat Ini"
                                show={showPassword1}
                                onToggle={() => setShowPassword1(!showPassword1)}
                                value={passwordForm.data.current_password}
                                onChange={(value) => {
                                    passwordForm.setData(
                                        'current_password',
                                        value,
                                    );
                                    setPasswordClientErrors((current) => ({
                                        ...current,
                                        current_password: undefined,
                                    }));
                                }}
                                error={
                                    passwordClientErrors.current_password ||
                                    toIndonesianError(
                                        passwordForm.errors.current_password,
                                    )
                                }
                                autoComplete="current-password"
                            />
                            <PasswordField
                                label="Kata Sandi Baru"
                                show={showPassword2}
                                onToggle={() => setShowPassword2(!showPassword2)}
                                value={passwordForm.data.password}
                                onChange={(value) => {
                                    passwordForm.setData('password', value);
                                    setPasswordClientErrors((current) => ({
                                        ...current,
                                        password: undefined,
                                    }));
                                }}
                                error={
                                    passwordClientErrors.password ||
                                    toIndonesianError(passwordForm.errors.password)
                                }
                                autoComplete="new-password"
                                hint="Gunakan minimal 8 karakter dengan kombinasi huruf dan angka."
                                hintColor="text-[#EF4444]"
                            />
                            <PasswordField
                                label="Konfirmasi Kata Sandi Baru"
                                show={showPassword3}
                                onToggle={() => setShowPassword3(!showPassword3)}
                                value={passwordForm.data.password_confirmation}
                                onChange={(value) => {
                                    passwordForm.setData(
                                        'password_confirmation',
                                        value,
                                    );
                                    setPasswordClientErrors((current) => ({
                                        ...current,
                                        password_confirmation: undefined,
                                    }));
                                }}
                                error={
                                    passwordClientErrors.password_confirmation ||
                                    toIndonesianError(
                                        passwordForm.errors.password_confirmation,
                                    )
                                }
                                autoComplete="new-password"
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#4A2525] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-colors hover:bg-[#5F1717] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {passwordForm.processing && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}
                                    Perbarui Kata Sandi
                                </button>
                            </div>
                        </div>
                    </form>

                    <div
                        className="animate-fade-in-up"
                        style={{ animationDelay: '250ms' }}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-[#EADBD8] pb-4">
                            <div className="flex items-center">
                                <MapPin
                                    size={18}
                                    className="mr-2 text-[#4A2525]"
                                />
                                <h3 className="font-serif text-lg text-[#4A2525]">
                                    Alamat Utama
                                </h3>
                            </div>
                        </div>
                        {defaultAddress ? (
                            <div className="mb-6 space-y-3 text-[12px]">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-[#333]">
                                        {defaultAddress.recipient_name}
                                    </p>
                                    <span className="text-[10px] font-bold text-[#4A2525]">
                                        {defaultAddress.label ?? 'Utama'}
                                    </span>
                                </div>
                                <p className="text-[#4A4A4A]">
                                    {defaultAddress.recipient_phone}
                                </p>
                                <p className="leading-relaxed text-[#4A4A4A]">
                                    {defaultAddress.full_address}
                                </p>
                                <p className="text-[#8A6B62]">
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
                                    <p className="border-l border-[#EADBD8] pl-3 text-[#8A6B62]">
                                        {defaultAddress.note}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="mb-6 text-[12px] leading-relaxed text-[#8A6B62]">
                                Belum ada alamat utama. Tambahkan alamat untuk
                                checkout lebih cepat.
                            </p>
                        )}
                        <Link
                            href="/address"
                            className="block w-full rounded-md border border-[#EADBD8] bg-white px-4 py-2 text-center text-[12px] font-bold tracking-wider text-[#4A2525] transition-colors hover:bg-[#FAF9F6]"
                        >
                            Kelola Alamat
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-center text-[12px] font-bold tracking-wider text-red-600 transition-colors hover:bg-red-100 md:hidden"
                        >
                            <LogOut size={14} /> Keluar
                        </Link>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
}

function PasswordField({
    label,
    show,
    onToggle,
    value,
    onChange,
    error,
    autoComplete,
    hint,
    hintColor = 'text-[#8A6B62]',
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
                    required
                    className={`w-full border-b bg-transparent px-1 py-2.5 pr-10 text-[13px] text-[#333] transition-colors focus:outline-none ${
                        error
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-[#EADBD8] focus:border-[#4A2525]'
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#C99A8F] hover:text-[#333]"
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
