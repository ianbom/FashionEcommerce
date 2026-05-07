import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';

export default function AuthLayout({
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-center">
                    <Link href={home()} className="flex items-center gap-3">
                        <AppLogo className="h-36 brightness-100 invert-0" />
                       
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
            </div>

            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/img/shedrack-salami-DRjeesi2kFM-unsplash.webp"
                    alt="Aurea Syari modest fashion"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
                <div className="absolute inset-0 bg-black/10" />
            </div>
        </div>
    );
}
