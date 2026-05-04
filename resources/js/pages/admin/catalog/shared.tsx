import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PerPageSelect } from '../pagination';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
    per_page?: number;
};

export function formatPrice(value: string | number | null | undefined) {
    return `Rp ${new Intl.NumberFormat('id-ID').format(Number(value ?? 0))}`;
}

export function cleanPageLabel(label: string) {
    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
}

export function PageHeader({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <p className="text-sm font-medium text-muted-foreground">
                    {eyebrow}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}

export function TableShell({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export function Pagination<T>({ paginator }: { paginator: Paginated<T> }) {
    return (
        <div className="mt-6 flex flex-col justify-between gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
            <span>
                Showing {paginator.from ?? 0}-{paginator.to ?? 0} of{' '}
                {paginator.total}
            </span>
            <div className="flex flex-wrap items-center gap-2">
                {paginator.links.map((link) =>
                    link.url ? (
                        <Button
                            key={`${link.label}-${link.url}`}
                            asChild
                            size="sm"
                            variant={link.active ? 'secondary' : 'outline'}
                        >
                            <Link href={link.url}>
                                {cleanPageLabel(link.label)}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            key={link.label}
                            size="sm"
                            variant="outline"
                            disabled
                        >
                            {cleanPageLabel(link.label)}
                        </Button>
                    ),
                )}
                <PerPageSelect paginator={paginator} />
            </div>
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                status === 'published' &&
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                status === 'draft' &&
                    'border-amber-200 bg-amber-50 text-amber-700',
                status === 'archived' &&
                    'border-zinc-200 bg-zinc-50 text-zinc-600',
            )}
        >
            {status}
        </Badge>
    );
}

export function ActiveBadge({ active }: { active: boolean }) {
    return (
        <Badge
            variant="outline"
            className={
                active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600'
            }
        >
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
}

export function FlagBadge({
    active,
    children,
}: {
    active: boolean;
    children: ReactNode;
}) {
    return <Badge variant={active ? 'secondary' : 'outline'}>{children}</Badge>;
}

export function Thumbnail({ src, alt }: { src?: string | null; alt: string }) {
    return src ? (
        <img
            src={src}
            alt={alt}
            className="size-12 rounded-md border object-cover"
        />
    ) : (
        <div className="flex size-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
            No img
        </div>
    );
}

export function EmptyState({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            {children}
        </div>
    );
}
