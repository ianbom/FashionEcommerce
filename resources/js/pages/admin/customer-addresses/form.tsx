import { Head, Link, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, textInputClass } from '@/pages/admin/marketing/shared';

type Address = Record<string, string | number | boolean | null> & { id: number };
type Props = { address: Address };

export default function CustomerAddressForm({ address }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        recipient_name: String(address.recipient_name ?? ''),
        recipient_phone: String(address.recipient_phone ?? ''),
        label: String(address.label ?? ''),
        province: String(address.province ?? ''),
        city: String(address.city ?? ''),
        district: String(address.district ?? ''),
        subdistrict: String(address.subdistrict ?? ''),
        postal_code: String(address.postal_code ?? ''),
        biteship_area_id: String(address.biteship_area_id ?? ''),
        latitude: String(address.latitude ?? ''),
        longitude: String(address.longitude ?? ''),
        full_address: String(address.full_address ?? ''),
        note: String(address.note ?? ''),
        is_default: Boolean(address.is_default),
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(`/admin/customer-addresses/${address.id}`);
    };

    return (
        <>
            <Head title="Edit Customer Address" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Customer Management" title="Edit Customer Address" description="Edit address book customer tanpa mengubah snapshot order lama." />
                <Card className="max-w-4xl">
                    <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                {(['recipient_name', 'recipient_phone', 'label', 'province', 'city', 'district', 'subdistrict', 'postal_code', 'biteship_area_id', 'latitude', 'longitude'] as const).map((field) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor={field}>{field.replaceAll('_', ' ')}</Label>
                                        <Input id={field} value={String(data[field])} onChange={(event) => setData(field, event.target.value)} />
                                        <InputError message={errors[field]} />
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="full_address">Full Address</Label>
                                <textarea id="full_address" value={data.full_address} onChange={(event) => setData('full_address', event.target.value)} className={`${textInputClass()} min-h-28`} />
                                <InputError message={errors.full_address} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="note">Note</Label>
                                <textarea id="note" value={data.note} onChange={(event) => setData('note', event.target.value)} className={`${textInputClass()} min-h-20`} />
                            </div>
                            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm">
                                <input type="checkbox" checked={data.is_default} onChange={(event) => setData('is_default', event.target.checked)} className="mt-1" />
                                <span><span className="block font-medium">Default address</span><span className="text-muted-foreground">Tandai sebagai alamat utama customer.</span></span>
                            </label>
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button asChild type="button" variant="outline"><Link href={`/admin/customer-addresses/${address.id}`}>Cancel</Link></Button>
                                <Button type="submit" disabled={processing}><Save /> Save Address</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
