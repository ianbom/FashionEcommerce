import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    DatabaseZap,
    Layers,
    Plus,
    Search,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

type Definition = {
    key: string;
    title: string;
    group: string;
    table: string;
    description: string;
    columns: string[];
    readonly?: boolean;
};

type Props = {
    definition: Definition;
    filters: {
        search?: string;
    };
    rows: Array<Record<string, string | number | boolean | null>>;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
};

function renderCell(value: string | number | boolean | null) {
    if (typeof value === 'boolean') {
        return value ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-500 ring-1 ring-stone-200">
                <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                Inactive
            </span>
        );
    }

    if (value === null || value === undefined || value === '') {
        return <span className="text-stone-300">—</span>;
    }

    if (typeof value === 'number') {
        return new Intl.NumberFormat('id-ID').format(value);
    }

    const normalized = value.toLowerCase();

    if (
        ['paid', 'published', 'completed', 'delivered', 'settlement'].includes(
            normalized,
        )
    ) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {value}
            </span>
        );
    }

    if (normalized.includes('pending') || normalized.includes('processing')) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {value}
            </span>
        );
    }

    if (
        normalized.includes('cancel') ||
        normalized.includes('expired') ||
        normalized.includes('failed')
    ) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {value}
            </span>
        );
    }

    return value;
}

export default function ResourceIndex({
    definition,
    filters,
    rows,
    stats,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            `/admin/${definition.key}`,
            { search },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={definition.title} />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-fadeinup { animation: fadeInUp 0.5s ease-out both; }
                .anim-delay-1  { animation-delay: 0.05s; }
                .anim-delay-2  { animation-delay: 0.12s; }
                .anim-delay-3  { animation-delay: 0.19s; }
                .anim-delay-4  { animation-delay: 0.26s; }
            `}</style>

            <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
                {/* ── Hero header ── */}
                <div className="anim-fadeinup relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] lg:p-8">
                    {/* decorative orbs */}
                    <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-8 left-1/3 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

                    <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
                                {definition.group}
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                                {definition.title}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-300">
                                {definition.description}
                            </p>
                        </div>

                        {!definition.readonly && (
                            <Link
                                href={`/admin/${definition.key}/create`}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-stone-900 shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
                            >
                                <Plus size={16} />
                                Create New
                            </Link>
                        )}
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            label: 'Total Records',
                            value: stats.total,
                            icon: DatabaseZap,
                            color: 'from-stone-50 to-white',
                            iconBg: 'bg-stone-100 text-stone-600',
                            delay: 'anim-delay-1',
                        },
                        {
                            label: 'Active',
                            value: stats.active,
                            icon: TrendingUp,
                            color: 'from-emerald-50 to-white',
                            iconBg: 'bg-emerald-100 text-emerald-600',
                            delay: 'anim-delay-2',
                        },
                        {
                            label: 'Inactive',
                            value: stats.inactive,
                            icon: Layers,
                            color: 'from-orange-50 to-white',
                            iconBg: 'bg-orange-100 text-orange-600',
                            delay: 'anim-delay-3',
                        },
                    ].map(
                        ({
                            label,
                            value,
                            icon: Icon,
                            color,
                            iconBg,
                            delay,
                        }) => (
                            <div
                                key={label}
                                className={`anim-fadeinup ${delay} group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br ${color} p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]`}
                                style={{ willChange: 'transform' }}
                            >
                                <div
                                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <Icon size={20} />
                                </div>
                                <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                    {label}
                                </p>
                                <p className="mt-1 text-3xl font-black text-stone-900">
                                    {new Intl.NumberFormat('id-ID').format(
                                        value,
                                    )}
                                </p>
                            </div>
                        ),
                    )}
                </div>

                {/* ── Table card ── */}
                <div className="anim-fadeinup anim-delay-4 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                    {/* Search bar */}
                    <div className="border-b border-stone-100 bg-stone-50/60 px-5 py-4">
                        <form onSubmit={submit} className="flex max-w-lg gap-3">
                            <div className="relative flex-1">
                                <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
                                    size={16}
                                />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Search ${definition.title.toLowerCase()}…`}
                                    className="h-10 w-full rounded-xl border border-stone-200 bg-white pr-3 pl-10 text-sm text-stone-900 transition-all duration-200 outline-none placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
                                />
                            </div>
                            <button
                                type="submit"
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-stone-700"
                            >
                                Search
                            </button>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(
                                            `/admin/${definition.key}`,
                                            {},
                                            { preserveScroll: true },
                                        );
                                    }}
                                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stone-200 px-3 text-sm text-stone-500 transition hover:text-stone-900"
                                >
                                    <XCircle size={15} />
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 bg-stone-50/40">
                                    {definition.columns.map((col) => (
                                        <th
                                            key={col}
                                            className="px-5 py-3.5 text-xs font-semibold tracking-wider text-stone-500 uppercase"
                                        >
                                            {col.replaceAll('_', ' ')}
                                        </th>
                                    ))}
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                definition.columns.length + 1
                                            }
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                                                    <DatabaseZap size={24} />
                                                </div>
                                                <p className="font-semibold text-stone-500">
                                                    No records found
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {search
                                                        ? 'Try a different search term.'
                                                        : 'Create the first one to get started.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr
                                            key={String(row.id ?? idx)}
                                            className="group transition-colors duration-150 hover:bg-stone-50/80"
                                        >
                                            {definition.columns.map((col) => (
                                                <td
                                                    key={col}
                                                    className="max-w-[220px] truncate px-5 py-4 text-stone-700"
                                                >
                                                    {renderCell(row[col])}
                                                </td>
                                            ))}
                                            <td className="px-5 py-4 text-right">
                                                {row.id ? (
                                                    <Link
                                                        href={`/admin/${definition.key}/${row.id}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                                                    >
                                                        View
                                                        <ArrowRight size={13} />
                                                    </Link>
                                                ) : (
                                                    <span className="text-stone-300">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
