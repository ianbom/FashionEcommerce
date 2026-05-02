import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Code,
    CreditCard,
    ExternalLink,
    FileText,
    Mail,
    Map,
    MapPin,
    MessageCircle,
    PackagePlus,
    Printer,
    Save,
    ShieldCheck,
    StickyNote,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import InputError from '@/components/input-error';
import { formatPrice } from '@/pages/admin/sales/shared';

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) {
        return '—';
    }

    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

type OrderItem = {
    id: number;
    product_name: string;
    product_sku: string | null;
    variant_sku: string | null;
    color_name: string | null;
    size: string | null;
    price: string;
    quantity: number;
    subtotal: string;
    product_image_url: string | null;
    weight?: number;
    dimensions?: string;
};

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    subtotal: string;
    discount_amount: string;
    shipping_cost: string;
    service_fee: string;
    grand_total: string;
    voucher_code: string | null;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    notes: string | null;
    no_return_refund_agreed: boolean;
    no_return_refund_agreed_at: string | null;
    items: OrderItem[];
    address: Record<string, string | number | null> | null;
    payment: Record<string, string | number | null> | null;
    payment_logs: {
        id: number;
        event_type: string | null;
        transaction_status: string | null;
        processed_at: string | null;
    }[];
    shipment: Record<string, string | number | null> | null;
    trackings: {
        id: number;
        status: string;
        description: string | null;
        location: string | null;
        happened_at: string | null;
    }[];
};

type Props = {
    order: Order;
};

type BadgeVariant = 'green' | 'blue' | 'gray' | 'red' | 'yellow' | 'outline';

const badgeColors: Record<BadgeVariant, string> = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    gray: 'border-zinc-200 bg-zinc-50 text-zinc-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
    yellow: 'border-amber-200 bg-amber-50 text-amber-700',
    outline: 'border-zinc-200 bg-white text-zinc-700',
};

function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}
        >
            {children}
        </section>
    );
}

function CardHeader({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof FileText;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50/50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-900">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 max-w-2xl text-xs text-zinc-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

function Badge({
    children,
    variant = 'gray',
    className = '',
}: {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${badgeColors[variant]} ${className}`}
        >
            <span className="truncate">{children}</span>
        </span>
    );
}

function DetailRow({ label, value }: { label: ReactNode; value: ReactNode }) {
    return (
        <div className="grid gap-1 text-sm sm:grid-cols-[140px_minmax(0,1fr)]">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="min-w-0 font-medium break-words text-zinc-900">
                {value}
            </dd>
        </div>
    );
}

function DetailList({ children }: { children: ReactNode }) {
    return <dl className="space-y-3">{children}</dl>;
}

function ActionLink({
    children,
    href,
    external = false,
}: {
    children: ReactNode;
    href: string;
    external?: boolean;
}) {
    const className =
        'group inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/20';

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={className}
            >
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}

function ActionButton({
    children,
    onClick,
    danger = false,
}: {
    children: ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:outline-none ${
                danger
                    ? 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50 focus:ring-rose-500/20'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-900/20'
            }`}
        >
            {children}
        </button>
    );
}

function Accordion({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-zinc-900/20 focus:outline-none focus:ring-inset"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="flex min-w-0 items-center gap-2">
                    <Code size={16} className="shrink-0 text-zinc-400" />
                    <span className="truncate">{title}</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && children && (
                <div className="max-h-80 overflow-auto border-t border-zinc-200 bg-zinc-950 p-4">
                    <pre className="font-mono text-[11px] leading-5 break-words whitespace-pre-wrap text-zinc-100">
                        {children}
                    </pre>
                </div>
            )}
        </div>
    );
}

function EmptyState({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            {children}
        </div>
    );
}

function getShipmentValue(shipment: Order['shipment'], key: string): unknown {
    return shipment?.[key];
}

function getRawOrderValue(shipment: Order['shipment'], path: string): unknown {
    const raw = getShipmentValue(shipment, 'raw_order_response');

    if (!raw || typeof raw !== 'object') {
        return null;
    }

    return path.split('.').reduce<unknown>((value, key) => {
        if (!value || typeof value !== 'object') {
            return null;
        }

        return (value as Record<string, unknown>)[key] ?? null;
    }, raw);
}

function getShipmentLabelUrl(shipment: Order['shipment']): string | null {
    const labelUrl = getShipmentValue(shipment, 'label_url');
    const courierLink = getRawOrderValue(shipment, 'courier.link');

    if (typeof labelUrl === 'string' && labelUrl.length > 0) {
        return labelUrl;
    }

    if (typeof courierLink === 'string' && courierLink.length > 0) {
        return courierLink;
    }

    return null;
}

export default function OrderShow({ order }: Props) {
    const noteForm = useForm({ notes: order.notes ?? '' });
    const shipmentForm = useForm<{
        courier_company: string;
        courier_type: string;
        courier_service_name: string;
        waybill_id: string;
        estimated_delivery: string;
        label_photo: File | null;
    }>({
        courier_company: '',
        courier_type: 'reg',
        courier_service_name: '',
        waybill_id: '',
        estimated_delivery: '',
        label_photo: null,
    });

    const submitNotes = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        noteForm.post(`/admin/orders/${order.id}/notes`, {
            preserveScroll: true,
        });
    };

    const submitShipment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        shipmentForm.post(`/admin/orders/${order.id}/shipments`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const updateStatus = (newStatus: string) => {
        router.post(
            `/admin/orders/${order.id}/status`,
            { status: newStatus },
            { preserveScroll: true },
        );
    };

    const getStatusBadge = (status: string) => {
        if (!status) {
            return <Badge variant="gray">Unknown</Badge>;
        }

        const lower = status.toLowerCase();
        const label = status.replace(/_/g, ' ').toUpperCase();

        if (
            ['paid', 'completed', 'settlement', 'capture', 'accept'].includes(
                lower,
            )
        ) {
            return <Badge variant="green">{label}</Badge>;
        }

        if (['pending', 'processing', 'ready_to_ship'].includes(lower)) {
            return <Badge variant="yellow">{label}</Badge>;
        }

        if (['shipped', 'shipping'].includes(lower)) {
            return <Badge variant="blue">{label}</Badge>;
        }

        if (['cancelled', 'failed', 'expired', 'deny'].includes(lower)) {
            return <Badge variant="red">{label}</Badge>;
        }

        return <Badge variant="gray">{label}</Badge>;
    };

    const totalItems = order.items.length;
    const totalQuantity = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );
    const customerPhone = order.customer_phone?.replace(/\D/g, '');
    const shipmentLabelUrl = getShipmentLabelUrl(order.shipment);

    return (
        <>
            <Head title={`Order Detail - ${order.order_number}`} />

            <main className="min-h-screen bg-zinc-50/50 px-4 py-5 text-zinc-900 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-5">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/admin/orders"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:bg-zinc-50 hover:text-zinc-700"
                                >
                                    <ArrowLeft size={16} />
                                </Link>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                                    Order {order.order_number}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <ActionButton onClick={() => window.print()}>
                                <Printer size={14} /> Print invoice
                            </ActionButton>
                            <ActionLink href={`mailto:${order.customer_email}`}>
                                <MessageCircle size={14} /> Contact customer
                            </ActionLink>
                            <ActionButton
                                onClick={() => updateStatus('processing')}
                            >
                                <Clock size={14} /> Processing
                            </ActionButton>
                            <ActionButton
                                onClick={() => updateStatus('ready_to_ship')}
                            >
                                <PackagePlus size={14} /> Ready to ship
                            </ActionButton>
                            <ActionButton
                                onClick={() => updateStatus('completed')}
                            >
                                <CheckCircle2 size={14} /> Completed
                            </ActionButton>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <div className="p-5">
                                <p className="text-sm font-medium text-zinc-500">
                                    Payment Status
                                </p>
                                <div className="mt-2">
                                    {getStatusBadge(order.payment_status)}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-5">
                                <p className="text-sm font-medium text-zinc-500">
                                    Order Status
                                </p>
                                <div className="mt-2">
                                    {getStatusBadge(order.order_status)}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-5">
                                <p className="text-sm font-medium text-zinc-500">
                                    Shipping Status
                                </p>
                                <div className="mt-2">
                                    {getStatusBadge(order.shipping_status)}
                                </div>
                            </div>
                        </Card>
                    </section>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="flex min-w-0 flex-col gap-5">
                            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Card>
                                    <CardHeader
                                        icon={FileText}
                                        title="Order overview"
                                    />
                                    <div className="p-5">
                                        <DetailList>
                                            <DetailRow
                                                label="Order number"
                                                value={
                                                    <span className="font-mono break-all">
                                                        {order.order_number}
                                                    </span>
                                                }
                                            />
                                            <DetailRow
                                                label="Customer"
                                                value={order.customer_name}
                                            />
                                            <DetailRow
                                                label="Email"
                                                value={
                                                    <a
                                                        className="break-all text-[#3E3222] hover:underline"
                                                        href={`mailto:${order.customer_email}`}
                                                    >
                                                        {order.customer_email}
                                                    </a>
                                                }
                                            />
                                            <DetailRow
                                                label="Phone"
                                                value={
                                                    order.customer_phone || '—'
                                                }
                                            />
                                            {order.payment?.processed_at && (
                                                <DetailRow
                                                    label="Paid at"
                                                    value={formatDate(
                                                        String(
                                                            order.payment
                                                                .processed_at,
                                                        ),
                                                    )}
                                                />
                                            )}
                                        </DetailList>
                                        <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-700">
                                                <StickyNote size={14} />{' '}
                                                Internal notes
                                            </p>
                                            <p className="text-sm break-words whitespace-pre-wrap text-zinc-600">
                                                {order.notes ||
                                                    'No internal notes for this order.'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader
                                        icon={ShieldCheck}
                                        title="Operational controls"
                                        action={
                                            <Badge
                                                variant={
                                                    order.no_return_refund_agreed
                                                        ? 'yellow'
                                                        : 'outline'
                                                }
                                            >
                                                No return/refund:{' '}
                                                {order.no_return_refund_agreed
                                                    ? 'YES'
                                                    : 'NO'}
                                            </Badge>
                                        }
                                        description={
                                            order.no_return_refund_agreed_at
                                                ? `Agreed at ${formatDate(order.no_return_refund_agreed_at)}`
                                                : undefined
                                        }
                                    />
                                    <div className="p-5">
                                        <form
                                            onSubmit={submitNotes}
                                            className="space-y-3"
                                        >
                                            <label
                                                className="text-xs font-medium text-zinc-600"
                                                htmlFor="notes"
                                            >
                                                Update internal note
                                            </label>
                                            <textarea
                                                id="notes"
                                                value={noteForm.data.notes}
                                                onChange={(event) =>
                                                    noteForm.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Write internal note here..."
                                                className="min-h-24 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none"
                                            />
                                            {noteForm.errors.notes && (
                                                <p className="text-xs text-rose-600">
                                                    {noteForm.errors.notes}
                                                </p>
                                            )}
                                            <button
                                                disabled={noteForm.processing}
                                                type="submit"
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                            >
                                                <Save size={15} /> Save note
                                            </button>
                                        </form>
                                    </div>
                                </Card>
                            </section>

                            {!order.shipment &&
                                order.payment_status === 'paid' && (
                                    <Card>
                                        <CardHeader
                                            icon={PackagePlus}
                                            title="Create shipment"
                                            description="Shipment dibuat sekali untuk order paid. Foto label disimpan ke Laravel public storage."
                                        />
                                        <form
                                            onSubmit={submitShipment}
                                            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"
                                        >
                                            {[
                                                [
                                                    'Courier company',
                                                    'courier_company',
                                                    'jne',
                                                ],
                                                [
                                                    'Courier type',
                                                    'courier_type',
                                                    'reg',
                                                ],
                                                [
                                                    'Service name',
                                                    'courier_service_name',
                                                    'JNE Reguler',
                                                ],
                                                [
                                                    'Waybill ID / Resi',
                                                    'waybill_id',
                                                    'JD0123456789',
                                                ],
                                                [
                                                    'Estimated delivery',
                                                    'estimated_delivery',
                                                    '2-3 Days',
                                                ],
                                            ].map(
                                                ([
                                                    label,
                                                    field,
                                                    placeholder,
                                                ]) => (
                                                    <div
                                                        key={field}
                                                        className="space-y-1.5"
                                                    >
                                                        <label className="text-xs font-medium text-zinc-600">
                                                            {label}
                                                        </label>
                                                        <input
                                                            value={String(
                                                                shipmentForm
                                                                    .data[
                                                                    field as keyof typeof shipmentForm.data
                                                                ] ?? '',
                                                            )}
                                                            onChange={(event) =>
                                                                shipmentForm.setData(
                                                                    field as never,
                                                                    event.target
                                                                        .value as never,
                                                                )
                                                            }
                                                            placeholder={
                                                                placeholder
                                                            }
                                                            className="flex h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none"
                                                        />
                                                        {shipmentForm.errors[
                                                            field as keyof typeof shipmentForm.errors
                                                        ] && (
                                                            <InputError
                                                                message={
                                                                    shipmentForm
                                                                        .errors[
                                                                        field as keyof typeof shipmentForm.errors
                                                                    ] as string
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-zinc-600">
                                                    Label photo (optional)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) =>
                                                        shipmentForm.setData(
                                                            'label_photo',
                                                            event.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                    className="flex w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium file:text-zinc-900 hover:file:bg-zinc-200"
                                                />
                                                {shipmentForm.errors
                                                    .label_photo && (
                                                    <InputError
                                                        message={
                                                            shipmentForm.errors
                                                                .label_photo
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div className="md:col-span-2 xl:col-span-3">
                                                <button
                                                    disabled={
                                                        shipmentForm.processing
                                                    }
                                                    type="submit"
                                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-900/20 focus:outline-none disabled:opacity-50"
                                                >
                                                    <PackagePlus size={15} />{' '}
                                                    Create shipment
                                                </button>
                                            </div>
                                        </form>
                                    </Card>
                                )}

                            <Card className="overflow-hidden">
                                <CardHeader
                                    icon={Box}
                                    title="Ordered items"
                                    description={`${totalItems} item type, ${totalQuantity} total quantity`}
                                />
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[860px] text-left text-sm">
                                        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
                                            <tr>
                                                <th className="px-5 py-3 font-medium">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Product SKU
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Variant
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Color
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Size
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Unit price
                                                </th>
                                                <th className="px-4 py-3 text-center font-medium">
                                                    Qty
                                                </th>
                                                <th className="px-5 py-3 text-right font-medium">
                                                    Subtotal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100">
                                            {order.items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="align-top hover:bg-zinc-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex min-w-0 gap-3">
                                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                                                                {item.product_image_url ? (
                                                                    <img
                                                                        src={
                                                                            item.product_image_url
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        alt={
                                                                            item.product_name
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Box
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-zinc-400"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[320px] font-medium break-words text-zinc-900">
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </p>
                                                                {item.dimensions && (
                                                                    <p className="mt-1 text-xs text-zinc-500">
                                                                        {
                                                                            item.dimensions
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 font-mono text-xs break-all text-zinc-600">
                                                        {item.product_sku ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-4 font-mono text-xs break-all text-zinc-600">
                                                        {item.variant_sku ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-4 break-words text-zinc-600">
                                                        {item.color_name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-4 text-zinc-600">
                                                        {item.size ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-zinc-900 tabular-nums">
                                                        {formatPrice(
                                                            item.price,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center text-zinc-900 tabular-nums">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-medium text-zinc-900 tabular-nums">
                                                        {formatPrice(
                                                            item.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {order.items.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-5 py-8 text-center text-sm text-zinc-500"
                                                    >
                                                        No items found in this
                                                        order.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Card>
                                    <CardHeader
                                        icon={User}
                                        title="Customer information"
                                    />
                                    <div className="space-y-5 p-5">
                                        <DetailList>
                                            <DetailRow
                                                label="Name"
                                                value={order.customer_name}
                                            />
                                            <DetailRow
                                                label="Email"
                                                value={
                                                    <a
                                                        className="break-all text-[#3E3222] hover:underline"
                                                        href={`mailto:${order.customer_email}`}
                                                    >
                                                        {order.customer_email}
                                                    </a>
                                                }
                                            />
                                            <DetailRow
                                                label="Phone"
                                                value={
                                                    order.customer_phone || '—'
                                                }
                                            />
                                        </DetailList>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <ActionLink
                                                href={`mailto:${order.customer_email}`}
                                            >
                                                <Mail size={14} /> Email
                                            </ActionLink>
                                            {customerPhone && (
                                                <ActionLink
                                                    href={`https://wa.me/${customerPhone}`}
                                                    external
                                                >
                                                    <MessageCircle size={14} />{' '}
                                                    WhatsApp
                                                </ActionLink>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader
                                        icon={MapPin}
                                        title="Shipping address"
                                        action={
                                            order.address?.latitude &&
                                            order.address?.longitude ? (
                                                <ActionLink
                                                    href={`https://maps.google.com/?q=${order.address.latitude},${order.address.longitude}`}
                                                    external
                                                >
                                                    <Map size={14} /> Open map
                                                </ActionLink>
                                            ) : null
                                        }
                                    />
                                    <div className="p-5">
                                        <DetailList>
                                            <DetailRow
                                                label="Recipient"
                                                value={String(
                                                    order.address
                                                        ?.recipient_name ?? '—',
                                                )}
                                            />
                                            <DetailRow
                                                label="Phone"
                                                value={String(
                                                    order.address
                                                        ?.recipient_phone ??
                                                        '—',
                                                )}
                                            />
                                            <DetailRow
                                                label="City"
                                                value={String(
                                                    order.address?.city ?? '—',
                                                )}
                                            />
                                            <DetailRow
                                                label="Postal code"
                                                value={String(
                                                    order.address
                                                        ?.postal_code ?? '—',
                                                )}
                                            />
                                            <DetailRow
                                                label="Full address"
                                                value={String(
                                                    order.address
                                                        ?.full_address ?? '—',
                                                )}
                                            />
                                            <DetailRow
                                                label="Address note"
                                                value={String(
                                                    order.address
                                                        ?.address_note ?? '—',
                                                )}
                                            />
                                        </DetailList>
                                    </div>
                                </Card>
                            </section>

                            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Card>
                                    <CardHeader
                                        icon={CreditCard}
                                        title="Payment information"
                                    />
                                    <div className="space-y-4 p-5">
                                        {order.payment ? (
                                            <>
                                                <DetailList>
                                                    <DetailRow
                                                        label="Provider"
                                                        value={String(
                                                            order.payment
                                                                .payment_provider ??
                                                                '—',
                                                        )}
                                                    />
                                                    <DetailRow
                                                        label="Method"
                                                        value={String(
                                                            order.payment
                                                                .payment_method ??
                                                                '—',
                                                        )}
                                                    />
                                                    <DetailRow
                                                        label="Transaction ID"
                                                        value={
                                                            <span className="font-mono break-all">
                                                                {String(
                                                                    order
                                                                        .payment
                                                                        .midtrans_transaction_id ??
                                                                        '—',
                                                                )}
                                                            </span>
                                                        }
                                                    />
                                                    <DetailRow
                                                        label="Gross amount"
                                                        value={formatPrice(
                                                            String(
                                                                order.payment
                                                                    .gross_amount ??
                                                                    0,
                                                            ),
                                                        )}
                                                    />
                                                </DetailList>
                                                <Accordion title="Raw payment data">
                                                    {JSON.stringify(
                                                        order.payment,
                                                        null,
                                                        2,
                                                    )}
                                                </Accordion>
                                            </>
                                        ) : (
                                            <EmptyState>
                                                No payment record found.
                                            </EmptyState>
                                        )}
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader
                                        icon={Truck}
                                        title="Shipment information"
                                    />
                                    <div className="space-y-4 p-5">
                                        {order.shipment ? (
                                            <>
                                                <DetailList>
                                                    <DetailRow
                                                        label="Courier"
                                                        value={`${order.shipment.courier_company ?? '—'} ${order.shipment.courier_type ?? ''}`}
                                                    />
                                                    <DetailRow
                                                        label="Service"
                                                        value={String(
                                                            order.shipment
                                                                .courier_service_name ??
                                                                '—',
                                                        )}
                                                    />
                                                    <DetailRow
                                                        label="Waybill ID"
                                                        value={
                                                            <span className="font-mono break-all">
                                                                {String(
                                                                    order
                                                                        .shipment
                                                                        .waybill_id ??
                                                                        '—',
                                                                )}
                                                            </span>
                                                        }
                                                    />
                                                    <DetailRow
                                                        label="Est. delivery"
                                                        value={String(
                                                            order.shipment
                                                                .estimated_delivery ??
                                                                '—',
                                                        )}
                                                    />
                                                </DetailList>
                                                 <div className="grid gap-2 sm:grid-cols-2">
                                                    {shipmentLabelUrl && (
                                                        <ActionLink
                                                            href={
                                                                shipmentLabelUrl
                                                            }
                                                            external
                                                        >
                                                            <Printer
                                                                size={14}
                                                            />{' '}
                                                            Print resi
                                                        </ActionLink>
                                                    )}
                                                     {order.shipment
                                                         .tracking_url && (
                                                        <ActionLink
                                                            href={String(
                                                                order.shipment
                                                                    .tracking_url,
                                                            )}
                                                            external
                                                        >
                                                            <MapPin size={14} />{' '}
                                                            Track online
                                                        </ActionLink>
                                                    )}
                                                    <ActionLink
                                                        href={`/admin/shipments/${order.shipment.id}`}
                                                    >
                                                        <ExternalLink
                                                            size={14}
                                                        />{' '}
                                                        View shipment
                                                    </ActionLink>
                                                </div>
                                                <Accordion title="Raw shipment data">
                                                    {JSON.stringify(
                                                        order.shipment,
                                                        null,
                                                        2,
                                                    )}
                                                </Accordion>
                                            </>
                                        ) : (
                                            <EmptyState>
                                                No shipment created yet.
                                            </EmptyState>
                                        )}
                                    </div>
                                </Card>
                            </section>

                            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Card>
                                    <CardHeader
                                        icon={Clock}
                                        title="Tracking timeline"
                                    />
                                    <div className="p-5">
                                        {order.trackings?.length > 0 ? (
                                            <div className="space-y-0">
                                                {order.trackings.map(
                                                    (track, index) => (
                                                        <div
                                                            key={track.id}
                                                            className="grid grid-cols-[20px_minmax(0,1fr)] gap-3"
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <div className="mt-1.5 h-2 w-2 rounded-full bg-zinc-400 ring-4 ring-zinc-50" />
                                                                {index !==
                                                                    order
                                                                        .trackings
                                                                        .length -
                                                                        1 && (
                                                                    <div className="mt-1 h-full min-h-10 w-px bg-zinc-200" />
                                                                )}
                                                            </div>
                                                            <div className="pb-5">
                                                                <p className="text-sm font-medium break-words text-zinc-900">
                                                                    {
                                                                        track.status
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs break-words text-zinc-500">
                                                                    {track.description ||
                                                                        'No description'}
                                                                    {track.location
                                                                        ? ` - ${track.location}`
                                                                        : ''}
                                                                </p>
                                                                <p className="mt-1 text-xs text-zinc-400">
                                                                    {formatDate(
                                                                        track.happened_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <EmptyState>
                                                No tracking updates available.
                                            </EmptyState>
                                        )}
                                    </div>
                                </Card>

                                <Card>
                                    <CardHeader
                                        icon={Code}
                                        title="Technical data"
                                        description="Expandable raw data for support and debugging."
                                    />
                                    <div className="space-y-3 p-5">
                                        <Accordion title="Raw order object">
                                            {JSON.stringify(order, null, 2)}
                                        </Accordion>
                                        <Accordion title="Payment logs">
                                            {JSON.stringify(
                                                order.payment_logs,
                                                null,
                                                2,
                                            )}
                                        </Accordion>
                                        <Accordion title="Tracking logs">
                                            {JSON.stringify(
                                                order.trackings,
                                                null,
                                                2,
                                            )}
                                        </Accordion>
                                    </div>
                                </Card>
                            </section>
                        </div>

                        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-5 xl:self-start">
                            <Card>
                                <CardHeader
                                    icon={FileText}
                                    title="Billing summary"
                                />
                                <div className="space-y-3 p-5 text-sm">
                                    <div className="flex items-center justify-between gap-4 text-zinc-500">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-zinc-900 tabular-nums">
                                            {formatPrice(order.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-zinc-500">
                                        <span>Discount</span>
                                        <span className="font-medium text-rose-600 tabular-nums">
                                            -{' '}
                                            {formatPrice(order.discount_amount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-zinc-500">
                                        <span>Shipping</span>
                                        <span className="font-medium text-zinc-900 tabular-nums">
                                            {formatPrice(order.shipping_cost)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-zinc-500">
                                        <span>Service fee</span>
                                        <span className="font-medium text-zinc-900 tabular-nums">
                                            {formatPrice(order.service_fee)}
                                        </span>
                                    </div>
                                    <div className="border-t border-zinc-200 pt-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="text-sm font-medium text-zinc-900">
                                                Grand total
                                            </span>
                                            <span className="text-right text-xl font-bold text-zinc-900 tabular-nums">
                                                {formatPrice(order.grand_total)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500">
                                        Voucher:{' '}
                                        <span className="font-mono font-medium break-all text-zinc-900">
                                            {order.voucher_code || '—'}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader
                                    icon={CheckCircle2}
                                    title="Status summary"
                                />
                                <div className="space-y-3 p-5">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-zinc-600">
                                            <CreditCard size={14} /> Payment
                                        </span>
                                        {getStatusBadge(order.payment_status)}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-zinc-600">
                                            <Box size={14} /> Order
                                        </span>
                                        {getStatusBadge(order.order_status)}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 text-zinc-600">
                                            <Truck size={14} /> Shipping
                                        </span>
                                        {getStatusBadge(order.shipping_status)}
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader
                                    icon={PackagePlus}
                                    title="Quick actions"
                                />
                                <div className="divide-y divide-zinc-100 p-2 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left font-medium text-zinc-700 transition hover:bg-zinc-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Printer
                                                size={15}
                                                className="text-zinc-400"
                                            />{' '}
                                            Print invoice
                                        </span>
                                        <ChevronRight
                                            size={15}
                                            className="text-zinc-300"
                                        />
                                    </button>
                                    <a
                                        href={`mailto:${order.customer_email}`}
                                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <MessageCircle
                                                size={15}
                                                className="text-zinc-400"
                                            />{' '}
                                            Contact customer
                                        </span>
                                        <ChevronRight
                                            size={15}
                                            className="text-zinc-300"
                                        />
                                    </a>
                                    {order.shipment && (
                                        <Link
                                            href={`/admin/shipments/${order.shipment.id}`}
                                            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50"
                                        >
                                            <span className="flex items-center gap-2">
                                                <ExternalLink
                                                    size={15}
                                                    className="text-zinc-400"
                                                />{' '}
                                                View shipment
                                            </span>
                                            <ChevronRight
                                                size={15}
                                                className="text-zinc-300"
                                            />
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateStatus('completed')
                                        }
                                        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left font-medium text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 size={15} /> Mark as
                                            completed
                                        </span>
                                        <ChevronRight size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateStatus('cancelled')
                                        }
                                        className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left font-medium text-rose-700 transition hover:bg-rose-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <XCircle size={15} /> Cancel order
                                        </span>
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
