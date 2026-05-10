import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Pengaturan tampilan" />

            <h1 className="sr-only">Pengaturan tampilan</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Pengaturan tampilan"
                    description="Tampilan dikunci ke mode terang untuk seluruh situs"
                />
                <div className="rounded-xl border border-[#EADBD8] bg-[#FAF8F5] p-4 text-sm leading-relaxed text-[#5C564D]">
                    Situs ini sekarang hanya memakai mode terang. Mode gelap dan pengalihan tema sistem telah dinonaktifkan secara global.
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan tampilan',
            href: editAppearance(),
        },
    ],
};
