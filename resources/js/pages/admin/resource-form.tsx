import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FilePen, Save } from 'lucide-react';

type Definition = {
    key: string;
    title: string;
    group: string;
    columns: string[];
};

type Props = {
    definition: Definition;
    mode: 'create' | 'edit';
    record: Record<string, string | number | boolean | null> | null;
};

export default function ResourceForm({ definition, mode, record }: Props) {
    const isEdit = mode === 'edit';

    return (
        <>
            <Head title={`${isEdit ? 'Edit' : 'Create'} ${definition.title}`} />

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .anim-fadeinup  { animation: fadeInUp 0.45s ease-out both; }
                .anim-delay-1   { animation-delay: 0.05s; }
                .anim-delay-2   { animation-delay: 0.12s; }
                .field-in       { animation: fadeInUp 0.4s ease-out both; }
                .input-field {
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                .input-field:focus {
                    border-color: #1c1917;
                    box-shadow: 0 0 0 3px rgba(28,25,23,0.08);
                    outline: none;
                }
            `}</style>

            <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
                {/* ── Hero header ── */}
                <div className="anim-fadeinup relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] lg:p-8">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
                    <div className="pointer-events-none absolute right-1/3 -bottom-6 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />

                    <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-stone-400 uppercase">
                                <FilePen size={12} />
                                {definition.group}
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white lg:text-4xl">
                                {isEdit ? 'Edit' : 'Create'}
                                <span className="ml-3 text-stone-300">
                                    {definition.title}
                                </span>
                            </h1>
                            {isEdit && record?.id && (
                                <p className="mt-1 font-mono text-xs text-stone-400">
                                    ID: {String(record.id)}
                                </p>
                            )}
                        </div>

                        <Link
                            href={`/admin/${definition.key}`}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                        >
                            <ArrowLeft size={16} />
                            Back to List
                        </Link>
                    </div>
                </div>

                {/* ── Form card ── */}
                <div className="anim-fadeinup anim-delay-1 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
                    <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-4">
                        <p className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                            {isEdit
                                ? 'Update record fields'
                                : 'Fill in the details below'}
                        </p>
                    </div>

                    <form className="p-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {definition.columns.map((column, idx) => (
                                <label
                                    key={column}
                                    className="field-in flex flex-col gap-1.5"
                                    style={{
                                        animationDelay: `${0.12 + idx * 0.05}s`,
                                    }}
                                >
                                    <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                        {column.replaceAll('_', ' ')}
                                    </span>
                                    <input
                                        defaultValue={String(
                                            record?.[column] ?? '',
                                        )}
                                        className="input-field h-11 w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 text-sm text-stone-900 placeholder:text-stone-400"
                                        placeholder={`Enter ${column.replaceAll('_', ' ').toLowerCase()}…`}
                                    />
                                </label>
                            ))}
                        </div>

                        {/* ── Action bar ── */}
                        <div className="mt-8 flex items-center gap-3 border-t border-stone-100 pt-6">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-[1.03] hover:bg-stone-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.20)]"
                                style={{ willChange: 'transform' }}
                            >
                                <Save size={16} />
                                {isEdit ? 'Save Changes' : 'Create Record'}
                            </button>
                            <Link
                                href={`/admin/${definition.key}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-600 transition-all duration-200 hover:border-stone-400 hover:text-stone-900"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
