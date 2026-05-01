import { Head, Link, useForm } from '@inertiajs/react';
import { ImageIcon, Save, Upload, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader, textInputClass } from '@/pages/admin/marketing/shared';

type Banner = Record<string, string | number | boolean | null> & { id: number };
type Props = { mode: 'create' | 'edit'; banner: Banner | null; placements: string[] };

export default function BannerForm({ mode, banner, placements }: Props) {
    const isEdit = mode === 'edit' && banner !== null;
    const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
    const [mobilePreview, setMobilePreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        title: String(banner?.title ?? ''),
        subtitle: String(banner?.subtitle ?? ''),
        image_desktop: null as File | null,
        image_mobile: null as File | null,
        button_text: String(banner?.button_text ?? ''),
        button_url: String(banner?.button_url ?? ''),
        placement: String(banner?.placement ?? 'homepage'),
        sort_order: String(banner?.sort_order ?? 0),
        starts_at: String(banner?.starts_at ?? ''),
        ends_at: String(banner?.ends_at ?? ''),
        is_active: Boolean(banner?.is_active ?? true),
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault(); post(isEdit ? `/admin/banners/${banner.id}` : '/admin/banners', { forceFormData: true }); 
};

    return (
        <>
            <Head title={isEdit ? 'Edit Banner' : 'Create Banner'} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader eyebrow="Content Management" title={isEdit ? 'Edit Banner' : 'Create Banner'} description="Upload banner melalui Laravel public storage agar bisa diakses dari customer landing page." />
                <Card className="max-w-4xl">
                    <CardHeader><CardTitle>Banner Information</CardTitle><CardDescription>Desktop image wajib untuk banner baru. Mobile image opsional.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Title" value={data.title} onChange={(value) => setData('title', value)} error={errors.title} />
                                <Field label="Subtitle" value={data.subtitle} onChange={(value) => setData('subtitle', value)} error={errors.subtitle} />
                                <Field label="Button Text" value={data.button_text} onChange={(value) => setData('button_text', value)} error={errors.button_text} />
                                <Field label="Button URL" value={data.button_url} onChange={(value) => setData('button_url', value)} error={errors.button_url} />
                                <div className="grid gap-2"><Label>Placement</Label><select value={data.placement} onChange={(event) => setData('placement', event.target.value)} className={textInputClass()}>{placements.map((placement) => <option key={placement} value={placement}>{placement}</option>)}</select><InputError message={errors.placement} /></div>
                                <Field label="Sort Order" value={data.sort_order} onChange={(value) => setData('sort_order', value)} error={errors.sort_order} />
                                <Field label="Starts At" type="datetime-local" value={data.starts_at} onChange={(value) => setData('starts_at', value)} error={errors.starts_at} />
                                <Field label="Ends At" type="datetime-local" value={data.ends_at} onChange={(value) => setData('ends_at', value)} error={errors.ends_at} />
                            </div>
                            <ImageUpload label="Desktop Image" currentUrl={String(banner?.image_desktop_url ?? '')} preview={desktopPreview} onPreview={setDesktopPreview} onFile={(file) => setData('image_desktop', file)} error={errors.image_desktop} />
                            <ImageUpload label="Mobile Image" currentUrl={String(banner?.image_mobile_url ?? '')} preview={mobilePreview} onPreview={setMobilePreview} onFile={(file) => setData('image_mobile', file)} error={errors.image_mobile} />
                            <label className="flex items-start gap-3 rounded-lg border p-4 text-sm"><input type="checkbox" checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)} className="mt-1" /><span><span className="block font-medium">Active banner</span><span className="text-muted-foreground">Banner hanya tampil jika aktif dan berada dalam periode tanggal.</span></span></label>
                            <div className="flex justify-end gap-3 border-t pt-5"><Button asChild type="button" variant="outline"><Link href="/admin/banners">Cancel</Link></Button><Button type="submit" disabled={processing}><Save /> Save Banner</Button></div>
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

function ImageUpload({ label, currentUrl, preview, onPreview, onFile, error }: { label: string; currentUrl: string; preview: string | null; onPreview: (value: string | null) => void; onFile: (file: File | null) => void; error?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const display = preview || currentUrl;
    const clear = () => {
 onFile(null); onPreview(null);

 if (inputRef.current) {
inputRef.current.value = '';
} 
};

    return <div className="grid gap-2"><Label>{label}</Label><div className="flex flex-col gap-3 sm:flex-row sm:items-start"><div className="relative flex h-32 w-56 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">{display ? <><img src={display} alt={label} className="h-full w-full object-cover" /><button type="button" onClick={clear} className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"><X className="size-3" /></button></> : <ImageIcon className="size-10 text-muted-foreground/40" />}</div><button type="button" onClick={() => inputRef.current?.click()} className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground hover:border-primary/60 hover:bg-muted/50"><Upload className="size-5" /> Upload JPG/PNG/WEBP<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
 const file = event.target.files?.[0] ?? null; onFile(file);

 if (file) {
onPreview(URL.createObjectURL(file));
} 
}} /></button></div><InputError message={error} /></div>;
}
