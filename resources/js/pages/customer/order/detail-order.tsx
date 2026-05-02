import { Link } from '@inertiajs/react';
import {
    Check,
    ClipboardList,
    CreditCard,
    Download,
    FileText,
    Headphones,
    MapPin,
    Package,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
    Truck,
    UserRound,
    WalletCards,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { index as orderIndex } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { show as productShow } from '@/actions/App/Http/Controllers/Customer/ProductController';
import ProfileLayout from '@/layouts/profile-layout';

type IconComponent = ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
}>;
type StatusTone = 'green' | 'blue' | 'amber' | 'red' | 'gray';

type OrderItem = {
    id: number;
    product_name: string;
    product_slug: string | null;
    product_sku: string | null;
    variant_sku: string | null;
    color_name: string | null;
    size: string | null;
    price: number;
    quantity: number;
    subtotal: number;
    weight: number | null;
    product_image_url: string | null;
};

type Address = {
    recipient_name: string;
    recipient_phone: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string | null;
    postal_code: string;
    full_address: string;
    note: string | null;
};

type Payment = {
    payment_provider: string;
    payment_method: string | null;
    midtrans_order_id: string | null;
    midtrans_transaction_id: string | null;
    midtrans_redirect_url: string | null;
    transaction_status: string | null;
    fraud_status: string | null;
    gross_amount: number;
    currency: string;
    paid_at: string | null;
    expired_at: string | null;
};

type Shipment = {
    shipping_provider: string;
    biteship_order_id: string | null;
    biteship_tracking_id: string | null;
    waybill_id: string | null;
    label_url: string | null;
    courier_company: string | null;
    courier_type: string | null;
    courier_service_name: string | null;
    delivery_type: string | null;
    shipping_cost: number;
    insurance_cost: number;
    estimated_delivery: string | null;
    shipping_status: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
};

type Tracking = {
    id: number;
    status: string;
    description: string | null;
    location: string | null;
    happened_at: string | null;
};

type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    created_at: string | null;
    created_date: string | null;
    created_time: string | null;
    payment_status: string;
    order_status: string;
    shipping_status: string;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    service_fee: number;
    grand_total: number;
    voucher_code: string | null;
    notes: string | null;
    paid_at: string | null;
    cancelled_at: string | null;
    expired_at: string | null;
    completed_at: string | null;
    items: OrderItem[];
    address: Address | null;
    payment: Payment | null;
    payment_logs: Array<{
        id: number;
        event_type: string | null;
        transaction_status: string | null;
        processed_at: string | null;
        created_at: string | null;
    }>;
    shipment: Shipment | null;
    trackings: Tracking[];
};

type Props = { order: Order };

const FALLBACK_IMAGE = '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp';

const formatPrice = (amount: number) =>
    `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

const formatDateTime = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const labelStatus = (status: string | null) => {
    if (!status) {
        return '-';
    }

    return status
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

const statusTone = (status: string | null): StatusTone => {
    switch (status) {
        case 'paid':
        case 'delivered':
        case 'completed':
            return 'green';
        case 'processing':
        case 'ready_to_ship':
        case 'shipped':
        case 'in_transit':
            return 'blue';
        case 'pending':
        case 'pending_payment':
        case 'not_created':
        case 'confirmed':
        case 'allocated':
        case 'picked':
            return 'amber';
        case 'cancelled':
        case 'expired':
        case 'failed':
        case 'problem':
            return 'red';
        default:
            return 'gray';
    }
};

function StatusPill({
    children,
    tone = 'green',
}: {
    children: ReactNode;
    tone?: StatusTone;
}) {
    const tones: Record<StatusTone, string> = {
        amber: 'bg-amber-50 text-amber-700 border border-amber-200',
        blue: 'bg-blue-50  text-blue-700  border border-blue-200',
        gray: 'bg-stone-100 text-stone-500 border border-stone-200',
        green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        red: 'bg-red-50   text-red-600    border border-red-200',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]}`}
        >
            {children}
        </span>
    );
}

function ActionButton({
    icon: Icon,
    label,
    href,
    external = false,
}: {
    icon: IconComponent;
    label: string;
    href?: string | null;
    external?: boolean;
}) {
    const base =
        'group flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5d7ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#4a392c] transition-all duration-150 hover:border-[#c9a983] hover:bg-[#fbf4ed] hover:shadow-sm active:scale-[0.98]';

    if (!href) {
        return (
            <button
                type="button"
                disabled
                className={`${base} cursor-not-allowed opacity-40`}
            >
                <Icon size={14} strokeWidth={1.8} />
                <span>{label}</span>
            </button>
        );
    }

    if (external) {
        return (
            <a href={href} target="_blank" rel="noreferrer" className={base}>
                <Icon size={14} strokeWidth={1.8} />
                <span>{label}</span>
            </a>
        );
    }

    return (
        <Link href={href} className={base}>
            <Icon size={14} strokeWidth={1.8} />
            <span>{label}</span>
        </Link>
    );
}

function InfoLine({
    icon: Icon,
    label,
    value,
}: {
    icon: IconComponent;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5 text-sm">
            <Icon
                className="mt-0.5 shrink-0 text-[#9b8777]"
                size={15}
                strokeWidth={1.65}
            />
            <span className="w-28 shrink-0 text-xs text-[#8b7b6e]">
                {label}
            </span>
            <span className="min-w-0 text-sm font-medium break-words text-[#3f3025]">
                {value || '-'}
            </span>
        </div>
    );
}

function SectionCard({
    title,
    children,
    noPad = false,
}: {
    title: string;
    children: ReactNode;
    noPad?: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-sm">
            <div className="border-b border-[#f0ebe4] px-5 py-4 sm:px-6">
                <h2 className="font-serif text-lg text-[#2d2119] sm:text-xl">
                    {title}
                </h2>
            </div>
            <div className={noPad ? '' : 'p-5 sm:p-6'}>{children}</div>
        </div>
    );
}

function MetaChip({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold tracking-widest text-[#9a8575] uppercase">
                {label}
            </span>
            <div className="text-sm font-semibold text-[#3d3027]">
                {children}
            </div>
        </div>
    );
}

function buildProgress(order: Order) {
    const paidAt =
        order.paid_at ??
        order.payment?.paid_at ??
        order.payment_logs.find(
            (log) => log.transaction_status === 'settlement',
        )?.processed_at ??
        null;
    const current = order.order_status;
    const rank: Record<string, number> = {
        pending_payment: 0,
        paid: 1,
        processing: 2,
        ready_to_ship: 3,
        shipped: 4,
        delivered: 5,
        completed: 5,
    };
    const currentRank =
        rank[current] ??
        (current === 'cancelled' || current === 'expired' ? 0 : 1);

    return [
        {
            icon: ClipboardList,
            label: 'Order Placed',
            time: formatDateTime(order.created_at),
            complete: true,
            active: false,
        },
        {
            icon: Check,
            label: 'Payment',
            time: formatDateTime(paidAt),
            complete: currentRank >= 1,
            active: currentRank === 1,
        },
        {
            icon: ShieldCheck,
            label: 'Processing',
            time: currentRank >= 2 ? labelStatus(order.order_status) : '-',
            complete: currentRank >= 2,
            active: currentRank === 2,
        },
        {
            icon: Package,
            label: 'Packed',
            time: currentRank >= 3 ? labelStatus(order.order_status) : '-',
            complete: currentRank >= 3,
            active: currentRank === 3,
        },
        {
            icon: Truck,
            label: 'Shipped',
            time: formatDateTime(order.shipment?.shipped_at ?? null),
            complete: currentRank >= 4,
            active: currentRank === 4,
        },
        {
            icon: Check,
            label: 'Delivered',
            time: formatDateTime(
                order.shipment?.delivered_at ?? order.completed_at,
            ),
            complete: currentRank >= 5,
            active: currentRank >= 5,
        },
    ];
}

export default function DetailOrder({ order }: Props) {
    const progressSteps = buildProgress(order);
    const courier = [
        order.shipment?.courier_company,
        order.shipment?.courier_type || order.shipment?.courier_service_name,
    ]
        .filter(Boolean)
        .join(' ');
    const address = order.address;
    const paymentMethod =
        [order.payment?.payment_provider, order.payment?.payment_method]
            .filter(Boolean)
            .join(' / ') || '-';
    const transactionId =
        order.payment?.midtrans_transaction_id ??
        order.payment?.midtrans_order_id ??
        '-';
    const invoiceNumber = `INV-${order.order_number.replace(/^#?ORD-?/i, '')}`;

    return (
        <ProfileLayout
            title={`Order ${order.order_number}`}
            pageTitle="Order Detail"
            subtitle="View your order information, shipment progress, and payment summary."
            activePath="list-order"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'My Orders', href: orderIndex.url() },
                { label: order.order_number },
            ]}
        >
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* Left column */}
                <div className="space-y-5">
                    {/* Order Header */}
                    <div className="overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-sm">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-widest text-[#9a8575] uppercase">
                                        Order Number
                                    </p>
                                    <h2 className="mt-1 font-serif text-2xl leading-tight text-[#2d2119] sm:text-3xl">
                                        {order.order_number}
                                    </h2>
                                    <p className="mt-1 text-xs text-[#7f6d60]">
                                        {order.created_date ?? '-'} &bull;{' '}
                                        {order.created_time ?? '-'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <StatusPill
                                        tone={statusTone(order.payment_status)}
                                    >
                                        {labelStatus(order.payment_status)}
                                    </StatusPill>
                                    <StatusPill
                                        tone={statusTone(order.order_status)}
                                    >
                                        {labelStatus(order.order_status)}
                                    </StatusPill>
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#f0ebe4] pt-5 sm:grid-cols-3">
                                <MetaChip label="Payment Method">
                                    {paymentMethod}
                                </MetaChip>
                                <MetaChip label="Est. Arrival">
                                    {order.shipment?.estimated_delivery ?? '-'}
                                </MetaChip>
                                <MetaChip label="Tracking No.">
                                    {order.shipment?.waybill_id ?? '-'}
                                </MetaChip>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 border-t border-[#f0ebe4] p-4 sm:grid-cols-4 sm:p-5">
                            <ActionButton
                                href={
                                    order.shipment?.waybill_id
                                        ? `https://cekresi.com/?noresi=${order.shipment.waybill_id}`
                                        : null
                                }
                                external
                                icon={Truck}
                                label="Track Order"
                            />
                            <ActionButton
                                href="/list"
                                icon={RefreshCcw}
                                label="Buy Again"
                            />
                            <ActionButton
                                href={order.shipment?.label_url ?? null}
                                external
                                icon={Download}
                                label="Shipping Label"
                            />
                            <ActionButton
                                href="/notifications"
                                icon={Headphones}
                                label="Support"
                            />
                        </div>
                    </div>

                    {/* Order Progress */}
                    <SectionCard title="Order Progress">
                        <div className="hide-scrollbar overflow-x-auto pb-1">
                            <div className="relative grid min-w-[520px] grid-cols-6">
                                <div className="absolute top-[21px] right-[8%] left-[8%] h-px bg-gradient-to-r from-[#d8ae8f] to-[#e5ddd6]" />
                                {progressSteps.map((step) => {
                                    const Icon = step.icon;

                                    return (
                                        <div
                                            key={step.label}
                                            className="relative flex flex-col items-center px-1 text-center"
                                        >
                                            <div
                                                className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${step.active ? 'border-[#2f2016] bg-[#2f2016] text-white shadow-lg shadow-[#2f2016]/20' : step.complete ? 'border-[#c9a983] bg-[#fdf6ee] text-[#8a6b55]' : 'border-[#e2ddd8] bg-white text-[#c6bdb4]'}`}
                                            >
                                                <Icon
                                                    size={16}
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                            <p className="mt-3 text-[11px] leading-tight font-bold text-[#4b3a2d]">
                                                {step.label}
                                            </p>
                                            <p className="mt-0.5 text-[10px] leading-tight font-medium text-[#a08d80]">
                                                {step.time}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {order.trackings.length > 0 && (
                            <div className="mt-5 border-t border-[#f0ebe4] pt-4">
                                {order.trackings.map((tracking, idx) => (
                                    <div
                                        key={tracking.id}
                                        className={`relative flex gap-3 pb-4 ${idx < order.trackings.length - 1 ? 'before:absolute before:top-5 before:left-[6px] before:h-full before:w-px before:bg-[#ede5dc]' : ''}`}
                                    >
                                        <div className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-[#c9a983] bg-white" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-[#9a8575]">
                                                {formatDateTime(
                                                    tracking.happened_at,
                                                )}
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-[#3f3025]">
                                                {labelStatus(tracking.status)}
                                                {tracking.location
                                                    ? ` — ${tracking.location}`
                                                    : ''}
                                                {tracking.description
                                                    ? `: ${tracking.description}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Ordered Items */}
                    <SectionCard title="Ordered Items" noPad={true}>
                        {/* Desktop table */}
                        <div className="hidden sm:block">
                            <div className="hide-scrollbar overflow-x-auto">
                                <table className="w-full min-w-[580px] border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-[#f0ebe4] bg-[#faf6f2] text-[11px] tracking-wide text-[#9a8575] uppercase">
                                            <th className="px-5 py-3 font-semibold sm:px-6">
                                                Item
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Details
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-center font-semibold">
                                                Qty
                                            </th>
                                            <th className="px-5 py-3 text-right font-semibold sm:px-6">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f0ebe4]">
                                        {order.items.map((item) => {
                                            const productUrl = item.product_slug
                                                ? productShow.url({
                                                      product:
                                                          item.product_slug,
                                                  })
                                                : '#';

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="bg-white transition-colors hover:bg-[#fdfaf7]"
                                                >
                                                    <td className="px-5 py-4 sm:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                href={
                                                                    productUrl
                                                                }
                                                                className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4ebe4]"
                                                            >
                                                                <img
                                                                    src={
                                                                        item.product_image_url ??
                                                                        FALLBACK_IMAGE
                                                                    }
                                                                    alt={
                                                                        item.product_name
                                                                    }
                                                                    className="h-full w-full object-cover object-top"
                                                                />
                                                            </Link>
                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={
                                                                        productUrl
                                                                    }
                                                                    className="line-clamp-2 text-[13px] font-semibold text-[#3d3027] transition hover:text-[#8f684b]"
                                                                >
                                                                    {
                                                                        item.product_name
                                                                    }
                                                                </Link>
                                                                <p className="mt-0.5 text-[11px] text-[#9a8575]">
                                                                    SKU:{' '}
                                                                    {item.variant_sku ??
                                                                        item.product_sku ??
                                                                        '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1 text-[12px] text-[#6d5c50]">
                                                            <p>
                                                                Color:{' '}
                                                                <span className="font-semibold text-[#3d3027]">
                                                                    {item.color_name ??
                                                                        '-'}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Size:{' '}
                                                                <span className="font-semibold text-[#3d3027]">
                                                                    {item.size ??
                                                                        '-'}
                                                                </span>
                                                            </p>
                                                            <p>
                                                                Weight:{' '}
                                                                <span className="font-semibold text-[#3d3027]">
                                                                    {item.weight
                                                                        ? `${item.weight} gr`
                                                                        : '-'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-[13px] font-semibold text-[#3d3027]">
                                                        {formatPrice(
                                                            item.price,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ebe4] text-[12px] font-semibold text-[#4a392c]">
                                                            {item.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right text-[13px] font-semibold text-[#3d3027] sm:px-6">
                                                        {formatPrice(
                                                            item.subtotal,
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Mobile cards */}
                        <div className="space-y-3 p-4 sm:hidden">
                            {order.items.map((item) => {
                                const productUrl = item.product_slug
                                    ? productShow.url({
                                          product: item.product_slug,
                                      })
                                    : '#';

                                return (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 rounded-xl border border-[#f0ebe4] bg-white p-3"
                                    >
                                        <Link
                                            href={productUrl}
                                            className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4ebe4]"
                                        >
                                            <img
                                                src={
                                                    item.product_image_url ??
                                                    FALLBACK_IMAGE
                                                }
                                                alt={item.product_name}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </Link>
                                        <div className="min-w-0 flex-1">
                                            <Link
                                                href={productUrl}
                                                className="line-clamp-2 text-[13px] font-semibold text-[#3d3027] hover:text-[#8f684b]"
                                            >
                                                {item.product_name}
                                            </Link>
                                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[#9a8575]">
                                                {item.color_name && (
                                                    <span>
                                                        Color:{' '}
                                                        <strong className="text-[#4a392c]">
                                                            {item.color_name}
                                                        </strong>
                                                    </span>
                                                )}
                                                {item.size && (
                                                    <span>
                                                        Size:{' '}
                                                        <strong className="text-[#4a392c]">
                                                            {item.size}
                                                        </strong>
                                                    </span>
                                                )}
                                                {item.weight && (
                                                    <span>
                                                        Weight:{' '}
                                                        <strong className="text-[#4a392c]">
                                                            {item.weight} gr
                                                        </strong>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-[#9a8575]">
                                                SKU:{' '}
                                                {item.variant_sku ??
                                                    item.product_sku ??
                                                    '-'}
                                            </p>
                                            <div className="mt-2.5 flex items-center justify-between">
                                                <span className="text-xs text-[#9a8575]">
                                                    Qty:{' '}
                                                    <strong className="text-[#4a392c]">
                                                        {item.quantity}
                                                    </strong>
                                                </span>
                                                <span className="text-[13px] font-bold text-[#3d3027]">
                                                    {formatPrice(item.subtotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    {/* Shipping + Payment Info */}
                    <div className="grid gap-5 md:grid-cols-2">
                        <SectionCard title="Shipping Info">
                            <div className="divide-y divide-[#f5ede6]">
                                <InfoLine
                                    icon={UserRound}
                                    label="Recipient"
                                    value={
                                        address?.recipient_name ??
                                        order.customer_name
                                    }
                                />
                                <InfoLine
                                    icon={Headphones}
                                    label="Phone"
                                    value={
                                        address?.recipient_phone ??
                                        order.customer_phone
                                    }
                                />
                                <InfoLine
                                    icon={MapPin}
                                    label="Address"
                                    value={
                                        address
                                            ? `${address.full_address}, ${address.district}, ${address.city}, ${address.province} ${address.postal_code}`
                                            : '-'
                                    }
                                />
                                <InfoLine
                                    icon={Truck}
                                    label="Courier"
                                    value={courier || '-'}
                                />
                                <InfoLine
                                    icon={ReceiptText}
                                    label="Tracking No."
                                    value={order.shipment?.waybill_id ?? '-'}
                                />
                                <InfoLine
                                    icon={FileText}
                                    label="Delivery Note"
                                    value={address?.note ?? '-'}
                                />
                            </div>
                        </SectionCard>
                        <SectionCard title="Payment Info">
                            <div className="divide-y divide-[#f5ede6]">
                                <InfoLine
                                    icon={CreditCard}
                                    label="Method"
                                    value={paymentMethod}
                                />
                                <InfoLine
                                    icon={ReceiptText}
                                    label="Transaction"
                                    value={transactionId}
                                />
                                <InfoLine
                                    icon={ClipboardList}
                                    label="Payment Date"
                                    value={formatDateTime(
                                        order.paid_at ??
                                            order.payment?.paid_at ??
                                            null,
                                    )}
                                />
                                <div className="flex items-center gap-3 py-2.5">
                                    <WalletCards
                                        className="shrink-0 text-[#9b8777]"
                                        size={15}
                                        strokeWidth={1.65}
                                    />
                                    <span className="w-28 shrink-0 text-xs text-[#8b7b6e]">
                                        Status
                                    </span>
                                    <StatusPill
                                        tone={statusTone(order.payment_status)}
                                    >
                                        {labelStatus(order.payment_status)}
                                    </StatusPill>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* Right sidebar */}
                <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
                    {/* Order Summary */}
                    <SectionCard title="Order Summary">
                        <div className="space-y-2.5">
                            <SummaryRow
                                label="Subtotal"
                                value={formatPrice(order.subtotal)}
                            />
                            <SummaryRow
                                label="Shipping Cost"
                                value={formatPrice(order.shipping_cost)}
                            />
                            {order.discount_amount > 0 && (
                                <SummaryRow
                                    label="Discount"
                                    value={`− ${formatPrice(order.discount_amount)}`}
                                    danger
                                />
                            )}
                            {order.voucher_code && (
                                <SummaryRow
                                    label="Voucher"
                                    value={order.voucher_code}
                                />
                            )}
                            <SummaryRow
                                label="Service Fee"
                                value={formatPrice(order.service_fee)}
                            />
                        </div>
                        <div className="mt-5 rounded-xl bg-[#faf6f1] px-4 py-4">
                            <p className="text-[10px] font-semibold tracking-widest text-[#9a8575] uppercase">
                                Total Payment
                            </p>
                            <p className="mt-1 font-serif text-2xl leading-none font-medium text-[#221914] sm:text-3xl">
                                {formatPrice(order.grand_total)}
                            </p>
                        </div>
                    </SectionCard>

                    {/* Invoice & Documents */}
                    <SectionCard title="Invoice & Docs">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <span className="text-xs text-[#8b7b6e]">
                                Invoice No.
                            </span>
                            <span className="truncate text-[13px] font-bold text-[#3d3027]">
                                {invoiceNumber}
                            </span>
                        </div>
                        <div className="space-y-2.5">
                            <ActionButton
                                href={order.shipment?.label_url ?? null}
                                external
                                icon={Download}
                                label="Shipping Label"
                            />
                            <ActionButton
                                href={
                                    order.payment?.midtrans_redirect_url ?? null
                                }
                                external
                                icon={FileText}
                                label="Payment Page"
                            />
                        </div>
                    </SectionCard>

                    {/* Order Notes */}
                    <SectionCard title="Order Notes">
                        <p className="border-l-2 border-[#e5d7ca] pl-3 text-sm leading-relaxed text-[#716155] italic">
                            {order.notes ?? 'No notes for this order.'}
                        </p>
                    </SectionCard>
                </aside>
            </div>
        </ProfileLayout>
    );
}

function SummaryRow({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: string;
    danger?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-[#6f5e52]">{label}</span>
            <span
                className={`${danger ? 'font-semibold text-[#c45745]' : 'font-semibold text-[#3d3027]'}`}
            >
                {value}
            </span>
        </div>
    );
}
