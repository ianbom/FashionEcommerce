import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Appearance locked to light mode for whole website"
                />
                <div className="rounded-xl border border-[#EAE8E3] bg-[#FAF8F5] p-4 text-sm leading-relaxed text-[#5C564D]">
                    This website now uses light mode only. Dark mode and system theme switching have been disabled globally.
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
