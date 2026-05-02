import { Head, Link, useForm } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    formatPrice,
    PageHeader,
    TableShell,
} from '@/pages/admin/catalog/shared';

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
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Reports"
                    title={`${type[0].toUpperCase()}${type.slice(1)} Report`}
                    description="Analisis performa toko berdasarkan data order, product snapshot, customer, shipment, dan voucher."
                    action={
                        <Button asChild>
                            <a href={`/admin/reports/${type}/export?${query}`}>
                                <Download /> Export CSV
                            </a>
                        </Button>
                    }
                />

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            asChild
                            variant={tab === type ? 'secondary' : 'outline'}
                            size="sm"
                        >
                            <Link href={`/admin/reports/${tab}`}>{tab}</Link>
                        </Button>
                    ))}
                </div>

                <form
                    onSubmit={submit}
                    className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-3 xl:grid-cols-6"
                >
                    <Input
                        type="date"
                        value={data.date_from}
                        onChange={(event) =>
                            setData('date_from', event.target.value)
                        }
                    />
                    <Input
                        type="date"
                        value={data.date_to}
                        onChange={(event) =>
                            setData('date_to', event.target.value)
                        }
                    />
                    <select
                        value={data.payment_status}
                        onChange={(event) =>
                            setData('payment_status', event.target.value)
                        }
                        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
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
                        variant="outline"
                    >
                        <Search /> Apply
                    </Button>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {report.metrics.map((metric) => (
                        <Card key={metric.label}>
                            <CardHeader className="pb-4">
                                <CardDescription>
                                    {metric.label}
                                </CardDescription>
                                <CardTitle>{metricValue(metric)}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {report.tables.map((table) => (
                    <TableShell
                        key={table.title}
                        title={table.title}
                        description={`${table.rows.length} rows`}
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        {table.columns.map((column) => (
                                            <th
                                                key={column}
                                                className="pr-4 pb-3 font-medium"
                                            >
                                                {column.replaceAll('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {table.rows.map((row, index) => (
                                        <tr key={index}>
                                            {table.columns.map((column) => (
                                                <td
                                                    key={column}
                                                    className="py-3 pr-4"
                                                >
                                                    {formatCell(
                                                        column,
                                                        row[column],
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TableShell>
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
