import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export { EmptyState, formatPrice, PageHeader, Pagination, TableShell } from '@/pages/admin/catalog/shared';
export type { Paginated } from '@/pages/admin/catalog/shared';

export function StatusBadge({
    status,
    tone = 'neutral',
}: {
    status: string | null;
    tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info';
}) {
    const value = status ?? '-';
    const resolvedTone =
        tone !== 'neutral'
            ? tone
            : ['paid', 'settlement', 'capture', 'completed', 'delivered'].includes(value)
              ? 'good'
              : ['pending', 'pending_payment', 'processing', 'ready_to_ship', 'confirmed', 'allocated', 'picked', 'in_transit'].includes(value)
                ? 'warn'
                : ['expired', 'failed', 'cancelled', 'cancel', 'deny', 'failure', 'problem'].includes(value)
                  ? 'bad'
                  : 'info';

    return (
        <Badge
            variant="outline"
            className={cn(
                resolvedTone === 'good' &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                resolvedTone === 'warn' &&
                    'border-amber-200 bg-amber-50 text-amber-700',
                resolvedTone === 'bad' &&
                    'border-red-200 bg-red-50 text-red-700',
                resolvedTone === 'info' &&
                    'border-blue-200 bg-blue-50 text-blue-700',
            )}
        >
            {value}
        </Badge>
    );
}

export function JsonBlock({ value }: { value: unknown }) {
    return (
        <pre className="max-h-[520px] overflow-auto rounded-lg border bg-muted/40 p-4 text-xs">
            {JSON.stringify(value ?? {}, null, 2)}
        </pre>
    );
}
