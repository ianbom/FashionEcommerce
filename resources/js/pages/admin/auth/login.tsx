import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import type { FormEventHandler } from 'react';

import InputError from '@/components/input-error';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login" />
            <main className="grid min-h-screen bg-[#f7f1ea] lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1fr)]">
                <section className="relative hidden overflow-hidden bg-[#2f241b] p-12 text-white lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(221,190,161,0.3),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <Link href="/" className="font-serif text-3xl">
                            Aurea Syar'i
                        </Link>
                        <div>
                            <p className="mb-4 text-sm font-bold tracking-[0.2em] text-[#d7bfa8] uppercase">
                                Admin Operations
                            </p>
                            <h1 className="max-w-xl font-serif text-6xl leading-[0.98]">
                                Manage every order with calm control.
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-7 text-[#e9dacc]">
                                Product, stock, order, payment, shipment, and
                                content management in one focused workspace.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md rounded-2xl border border-[#eadfd4] bg-white p-8 shadow-[0_24px_70px_rgba(63,45,31,0.1)]">
                        <div className="mb-8 flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f241b] text-white">
                                <LockKeyhole size={21} strokeWidth={1.7} />
                            </span>
                            <div>
                                <h1 className="font-serif text-3xl text-[#2f241b]">
                                    Admin Login
                                </h1>
                                <p className="text-sm text-[#76685e]">
                                    Only active admin accounts can continue.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-[#3e3026]"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    className="mt-2 h-11 w-full rounded-lg border border-[#dfd2c7] bg-[#fffdf9] px-4 text-sm transition outline-none focus:border-[#8f684b] focus:ring-2 focus:ring-[#ead8c8]"
                                    autoComplete="email"
                                    autoFocus
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-[#3e3026]"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                    className="mt-2 h-11 w-full rounded-lg border border-[#dfd2c7] bg-[#fffdf9] px-4 text-sm transition outline-none focus:border-[#8f684b] focus:ring-2 focus:ring-[#ead8c8]"
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <label className="flex items-center gap-3 text-sm font-medium text-[#5f5045]">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(event) =>
                                        setData(
                                            'remember',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-[#d8c9ba] text-[#2f241b]"
                                />
                                Remember this device
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2f241b] text-sm font-bold text-white transition hover:bg-[#4a382b] disabled:opacity-70"
                            >
                                {processing && (
                                    <LoaderCircle
                                        className="animate-spin"
                                        size={16}
                                    />
                                )}
                                Login to Dashboard
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );
}
