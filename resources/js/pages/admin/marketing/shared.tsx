import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    ActiveBadge,
    EmptyState,
    formatPrice,
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
} from '@/pages/admin/catalog/shared';
import type { Paginated } from '@/pages/admin/catalog/shared';

export {
    ActiveBadge,
    EmptyState,
    formatPrice,
    PageHeader,
    Pagination,
    TableShell,
    Thumbnail,
};
export type { Paginated };

export function ReadBadge({ read }: { read: boolean }) {
    return (
        <Badge
            variant="outline"
            className={
                read
                    ? 'border-zinc-200 bg-zinc-50 text-zinc-600'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
            }
        >
            {read ? 'Read' : 'Unread'}
        </Badge>
    );
}

export function MetricCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: ReactNode;
    detail?: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-4 shadow-xs">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
                {value}
            </div>
            {detail ? (
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            ) : null}
        </div>
    );
}

export function textInputClass() {
    return 'border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';
}

export function booleanLabel(value: boolean) {
    return value ? 'Active' : 'Inactive';
}
