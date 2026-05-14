import { cn } from '@/lib/utils';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <img
            src="/logo-shay/shayda-logo-text-hitam.png"
            alt="Shayda"
            className={cn('h-8 w-auto object-contain', className)}
        />
    );
}
