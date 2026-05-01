import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, textInputClass } from '@/pages/admin/marketing/shared';

type Voucher = Record<string, string | number | boolean | null> & { id: number };
type Props = { mode: 'create' | 'edit'; voucher: Voucher | null };

export default function VoucherForm({ mode, voucher }: Props) {
    const isEdit = mode === 'edit' && voucher !== null;
    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        code: String(voucher?.code ?? ''),
        name: String(voucher?.name ?? ''),
        description: String(voucher?.description ?? ''),
        discount_type: String(voucher?.discount_type ?? 'fixed'),
        discount_value: String(voucher?.discount_value ?? ''),
        max_discount: String(voucher?.max_discount ?? ''),
        min_order_amount: String(voucher?.min_order_amount ?? ''),
        usage_limit: String(voucher?.usage_limit ?? ''),
        starts_at: String(voucher?.starts_at ?? ''),
        ends_at: String(voucher?.ends_at ?? ''),
        is_active: Boolean(voucher?.is_active ?? true),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(isEdit ? `/admin/vouchers/${voucher.id}` : '/admin/vouchers');
    };

    return (
        <>
            <Head title={isEdit ? 'Edit Voucher' : 'Create Voucher'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Marketing Management" title={isEdit ? 'Edit Voucher' : 'Create Voucher'} description="Atur kode promo yang valid untuk checkout customer." />
                <Card className="max-w-4xl">
                    <CardHeader><CardTitle>Voucher Information</CardTitle><CardDescription>Percentage discount dibatasi maksimal 100%.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Code" value={data.code} onChange={(value) => setData('code', value.toUpperCase())} error={errors.code} />
                                <Field label="Name" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} />
                                <div className="grid gap-2">
                                    <Label>Discount Type</Label>
                                    <select value={data.discount_type} onChange={(event) => setData('discount_type', event.target.value)} className={textInputClass()}>
                                        <option value="fixed">fixed</option><option value="percentage">percentage</option>
                                    </select>
                                    <InputError message={errors.discount_type} />
                                </div>
                                <Field label="Discount Value" value={data.discount_value} onChange={(value) => setData('discount_value', value)} error={errors.discount_value} />
                                <Field label="Max Discount" value={data.max_discount} onChange={(value) => setData('max_discount', value)} error={errors.max_discount} />
                                <Field label="Minimum Order Amount" value={data.min_order_amount} onChange={(value) => setData('min_order_amount', value)} error={errors.min_order_amount} />
                                <Field label="Usage Limit" value={data.usage_limit} onChange={(value) => setData('usage_limit', value)} error={errors.usage_limit} />
                                <Field label="Starts At" type="datetime-local" value={data.starts_at} onChange={(value) => setData('starts_at', value)} error={errors.starts_at} />
                                <Field label="Ends At" type="datetime-local" value={data.ends_at} onChange={(value) => setData('ends_at', value)} error={errors.ends_at} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <textarea value={data.description} onChange={(event) => setData('description', event.target.value)} className={`${textInputClass()} min-h-24`} />
                            </div>
                            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm"><input type="checkbox" checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)} className="mt-1" /><span><span className="block font-medium">Active voucher</span><span className="text-muted-foreground">Voucher inactive tidak bisa dipakai checkout.</span></span></label>
                            <div className="flex justify-end gap-3 border-t pt-5"><Button asChild type="button" variant="outline"><Link href="/admin/vouchers">Cancel</Link></Button><Button type="submit" disabled={processing}><Save /> Save Voucher</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Field({ label, value, onChange, error, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; error?: string; type?: string }) {
    return <div className="grid gap-2"><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /><InputError message={error} /></div>;
}
