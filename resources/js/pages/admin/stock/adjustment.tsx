import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/pages/admin/catalog/shared';

type Variant = {
    id: number;
    product: string | null;
    sku: string;
    stock: number;
    reserved_stock: number;
    available_stock: number;
};

type Props = {
    variant: Variant;
};

export default function StockAdjustment({ variant }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'in',
        quantity: 1,
        note: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(`/admin/product-variants/${variant.id}/stock-adjustment`);
    };

    return (
        <>
            <Head title="Stock Adjustment" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    eyebrow="Catalog Management"
                    title="Stock Adjustment"
                    description="Setiap adjustment akan dicatat ke stock_logs dengan stock before dan stock after."
                />
                <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <Card>
                        <CardHeader>
                            <CardTitle>{variant.sku}</CardTitle>
                            <CardDescription>{variant.product ?? '-'}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <Metric label="Stock" value={variant.stock} />
                            <Metric label="Reserved" value={variant.reserved_stock} />
                            <Metric label="Available" value={variant.available_stock} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Adjustment Form</CardTitle>
                            <CardDescription>
                                Type out otomatis mengurangi stok jika quantity positif.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="flex flex-col gap-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <select id="type" value={data.type} onChange={(event) => setData('type', event.target.value)} className="border-input h-9 rounded-md border bg-transparent px-3 py-1 text-sm">
                                            <option value="in">In</option>
                                            <option value="out">Out</option>
                                            <option value="adjustment">Adjustment</option>
                                        </select>
                                        <InputError message={errors.type} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input id="quantity" type="number" value={data.quantity} onChange={(event) => setData('quantity', Number(event.target.value))} />
                                        <InputError message={errors.quantity} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="note">Note</Label>
                                    <textarea id="note" value={data.note} onChange={(event) => setData('note', event.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]" />
                                    <InputError message={errors.note} />
                                </div>
                                <div className="flex justify-end gap-3 border-t pt-5">
                                    <Button asChild type="button" variant="outline">
                                        <Link href="/admin/stock">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save />
                                        Save Adjustment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
}
