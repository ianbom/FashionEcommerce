import { Head, Link, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, textInputClass } from '@/pages/admin/marketing/shared';

type Customer = { id: number; name: string; email: string; is_active: boolean };
type Props = { customers: Customer[]; types: string[] };

export default function NotificationForm({ customers, types }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        target: 'one',
        user_id: '',
        title: '',
        message: '',
        type: 'system',
        reference_type: '',
        reference_id: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/admin/notifications');
    };

    return (
        <>
            <Head title="Send Notification" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Customer Management" title="Send Notification" description="Kirim notifikasi manual ke satu customer, semua customer, atau segment customer aktif." />
                <Card className="max-w-4xl">
                    <CardHeader><CardTitle>Notification Message</CardTitle><CardDescription>Notifikasi masuk ke halaman customer notifications.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2"><Label>Target</Label><select value={data.target} onChange={(event) => setData('target', event.target.value)} className={textInputClass()}><option value="one">One customer</option><option value="active">Active customers</option><option value="all">All customers</option></select><InputError message={errors.target} /></div>
                                <div className="grid gap-2"><Label>Customer</Label><select value={data.user_id} onChange={(event) => setData('user_id', event.target.value)} disabled={data.target !== 'one'} className={textInputClass()}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email}{customer.is_active ? '' : ' (inactive)'}</option>)}</select><InputError message={errors.user_id} /></div>
                                <div className="grid gap-2"><Label>Type</Label><select value={data.type} onChange={(event) => setData('type', event.target.value)} className={textInputClass()}>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select><InputError message={errors.type} /></div>
                                <div className="grid gap-2"><Label>Reference Type</Label><Input value={data.reference_type} onChange={(event) => setData('reference_type', event.target.value)} placeholder="order, promo, system..." /></div>
                                <div className="grid gap-2 md:col-span-2"><Label>Title</Label><Input value={data.title} onChange={(event) => setData('title', event.target.value)} /><InputError message={errors.title} /></div>
                            </div>
                            <div className="grid gap-2"><Label>Message</Label><textarea value={data.message} onChange={(event) => setData('message', event.target.value)} className={`${textInputClass()} min-h-32`} /><InputError message={errors.message} /></div>
                            <div className="grid gap-2"><Label>Reference ID</Label><Input value={data.reference_id} onChange={(event) => setData('reference_id', event.target.value)} /></div>
                            <div className="flex justify-end gap-3 border-t pt-5"><Button asChild type="button" variant="outline"><Link href="/admin/notifications">Cancel</Link></Button><Button type="submit" disabled={processing}><Send /> Send Notification</Button></div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
