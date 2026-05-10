import { Head, Link, useForm } from '@inertiajs/react';
import { BarChart3, Download, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/pages/admin/catalog/shared';

type Metric = { label: string; value: number; format: 'currency' | 'number' };
type ReportTable = {
    title: string;
    columns: string[];
    rows: Record<string, unknown>[];
};

type Props = {
    type: string;
    tabs: string[];
    filters: {
        date_from: string;
        date_to: string;
        payment_status: string;
        order_status: string;
        category_id: string;
        collection_id: string;
    };
    options: {
        paymentStatuses: string[];
        orderStatuses: string[];
        categories: { id: number; name: string }[];
        collections: { id: number; name: string }[];
    };
    report: { metrics: Metric[]; tables: ReportTable[] };
};

function metricValue(metric: Metric) {
    return metric.format === 'currency'
        ? formatPrice(metric.value)
        : new Intl.NumberFormat('id-ID').format(metric.value);
}

function titleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ReportIndex({
    type,
    tabs,
    filters,
    options,
    report,
}: Props) {
    const { data, setData, get, processing } = useForm(filters);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        get(`/admin/reports/${type}`, { preserveState: true, replace: true });
    };

    const query = new URLSearchParams(
        Object.entries(data).filter(([, value]) => value !== ''),
    ).toString();

    return (
        <>
            <Head title={`${type} Report`} />
            <div className="flex flex-1 flex-col gap-8 bg-white p-4 text-zinc-900 md:p-6">
                <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-[#7F2020]/50 uppercase">
                            <BarChart3 className="size-4" strokeWidth={1.7} />
                            Reports
                        </p>
                        <h1 className="font-serif text-4xl leading-tight text-zinc-900">
                            {titleCase(type)} Report
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
                            Ringkasan data toko untuk order, produk, customer,
                            shipment, dan voucher.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="h-9 rounded-lg bg-[#7F2020] px-4 text-white shadow-none hover:bg-[#5F1717] active:scale-[0.98]"
                    >
                        <a href={`/admin/reports/${type}/export?${query}`}>
                            <Download className="size-4" /> Export CSV
                        </a>
                    </Button>
                </header>

                <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
                    {tabs.map((tab) => (
                        <Link
                            key={tab}
                            href={`/admin/reports/${tab}`}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                tab === type
                                    ? 'border-[#7F2020] bg-[#7F2020] text-white'
                                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                            }`}
                        >
                            {titleCase(tab)}
                        </Link>
                    ))}
                </nav>

                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-2xl border border-zinc-200 p-4 md:grid-cols-3 xl:grid-cols-6"
                >
                    <Input
                        type="date"
                        value={data.date_from}
                        onChange={(event) =>
                            setData('date_from', event.target.value)
                        }
                        className="h-9 rounded-lg border-zinc-200 bg-white text-sm shadow-none"
                    />
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            setData('date_to', event.target.value)
                        }
                        className="h-9 rounded-lg border-zinc-200 bg-white text-sm shadow-none"
                    />
                    <select
                        value={data.payment_status}
                        onChange={(event) =>
                            setData('payment_status', event.target.value)
                        }
                        className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors outline-none focus:border-[#7F2020]"
                    >
                        <option value="">All payment</option>
                        {options.paymentStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <select
                        value={data.order_status}
                        onChange={(event) =>
                            setData('order_status', event.target.value)
                        }
                        className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors outline-none focus:border-[#7F2020]"
                    >
                        <option value="">All order</option>
                        {options.orderStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <select
                        value={data.category_id}
                        onChange={(event) =>
                            setData('category_id', event.target.value)
                        }
                        className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition-colors outline-none focus:border-[#7F2020]"
                    >
                        <option value="">All categories</option>
                        {options.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-9 rounded-lg border-zinc-200 bg-white text-zinc-600 shadow-none hover:bg-zinc-50"
                    >
                        <Search className="size-4" /> Apply
                    </Button>
                </form>

                <section className="grid overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:grid-cols-2 xl:grid-cols-5">
                    {report.metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="border-r border-b border-zinc-200 px-5 py-5 last:border-r-0"
                        >
                            <p className="text-sm font-semibold text-zinc-500">
                                {metric.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                                {metricValue(metric)}
                            </p>
                        </div>
                    ))}
                </section>

                {report.tables.map((table) => (
                    <section
                        key={table.title}
                        className="rounded-2xl border border-zinc-200 p-5"
                    >
                        <div className="mb-5 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                                    {table.title}
                                </h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {table.rows.length} rows
                                </p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-y border-zinc-200 text-sm">
                                <thead className="border-b border-zinc-200 bg-zinc-50/70 text-xs tracking-wider text-zinc-500 uppercase">
                                    <tr className="text-left">
                                        {table.columns.map((column) => (
                                            <th
                                                key={column}
                                                className="py-4 pr-4 font-semibold first:pl-4"
                                            >
                                                {column.replaceAll('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {table.rows.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="transition-colors hover:bg-zinc-50/70"
                                        >
                                            {table.columns.map((column) => (
                                                <td
                                                    key={column}
                                                    className="py-4 pr-4 text-zinc-600 first:pl-4"
                                                >
                                                    {formatCell(
                                                        column,
                                                        row[column],
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {table.rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={table.columns.length}
                                                className="px-4 py-8 text-center text-sm text-zinc-400"
                                            >
                                                No report data found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}

function formatCell(column: string, value: unknown) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (
        ['grand_total', 'revenue', 'total_spending', 'total_discount'].includes(
            column,
        )
    ) {
        return formatPrice(Number(value));
    }

    return String(value);
}
