import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { paginationDirection } from '@/lib/pagination';

export function PaginationLabel({ label }: { label: string }) {
    const direction = paginationDirection(label);

    if (!direction) {
        return <span>{label}</span>;
    }

    const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;

    return (
        <>
            <Icon
                className="inline-block h-3.5 w-3.5 align-middle"
                aria-hidden="true"
            />
            <span className="sr-only">
                {direction === 'previous'
                    ? 'Halaman sebelumnya'
                    : 'Halaman berikutnya'}
            </span>
        </>
    );
}

type Paginator = {
    per_page?: number;
};

const perPageOptions = [10, 50, 100];

export function PerPageSelect({ paginator }: { paginator: Paginator }) {
    return (
        <Select
            value={String(paginator.per_page ?? 10)}
            onValueChange={(value) => {
                const url = new URL(window.location.href);

                url.searchParams.set('per_page', value);
                url.searchParams.set('page', '1');

                router.get(
                    `${url.pathname}${url.search}`,
                    {},
                    { preserveState: true, replace: true },
                );
            }}
        >
            <SelectTrigger className="h-8 w-[92px] rounded-lg border-zinc-200 bg-white text-xs text-zinc-600 shadow-none">
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" side="top">
                {perPageOptions.map((perPage) => (
                    <SelectItem key={perPage} value={String(perPage)}>
                        {perPage}/page
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
