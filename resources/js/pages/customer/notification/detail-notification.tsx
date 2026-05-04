import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Calendar,
    Check,
    Clock,
    CreditCard,
    ExternalLink,
    Gift,
    Info,
    MapPin,
    Package,
    ShoppingBag,
    Star,
    Tag,
    Truck,
} from 'lucide-react';
import React from 'react';
import ProfileLayout from '@/layouts/profile-layout';

type NotificationTimelineItem = {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    happened_at: string | null;
    is_current: boolean;
};

type NotificationOrderItem = {
    id: number;
    product_name: string;
    product_image_url: string | null;
    quantity: number;
    subtotal: number;
    color_name: string | null;
    size: string | null;
};

type NotificationOrder = {
    id: number;
    order_number: string;
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
    created_at: string | null;
    paid_at: string | null;
    completed_at: string | null;
    expired_at: string | null;
    cancelled_at: string | null;
    items_count: number;
    items: NotificationOrderItem[];
    address: {
        recipient_name: string;
        recipient_phone: string;
        full_address: string;
        city: string;
        province: string;
        postal_code: string;
    } | null;
};

type NotificationPayment = {
    payment_provider: string | null;
    payment_method: string | null;
    transaction_status: string | null;
    fraud_status: string | null;
    gross_amount: number;
    currency: string | null;
    midtrans_order_id: string | null;
    midtrans_transaction_id: string | null;
    midtrans_redirect_url: string | null;
    paid_at: string | null;
    expired_at: string | null;
    logs: Array<{
        id: number;
        event_type: string | null;
        transaction_status: string | null;
        processed_at: string | null;
        created_at: string | null;
    }>;
};

type NotificationShipment = {
    shipping_provider: string | null;
    courier_company: string | null;
    courier_type: string | null;
    courier_service_name: string | null;
    delivery_type: string | null;
    waybill_id: string | null;
    biteship_order_id: string | null;
    biteship_tracking_id: string | null;
    label_url: string | null;
    shipping_cost: number;
    insurance_cost: number;
    estimated_delivery: string | null;
    shipping_status: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    trackings: Array<{
        id: number;
        status: string;
        description: string | null;
        location: string | null;
        happened_at: string | null;
    }>;
};

type NotificationDetail = {
    id: number;
    type: string;
    detail_type: 'payment' | 'shipping' | 'order' | 'general';
    type_label: string;
    title: string;
    message: string;
    time: string;
    created_at: string | null;
    read_at: string | null;
    is_read: boolean;
    status_badge: string;
    is_important: boolean;
    reference_type: string | null;
    reference_id: number | null;
    order: NotificationOrder | null;
    payment: NotificationPayment | null;
    shipment: NotificationShipment | null;
    timeline: NotificationTimelineItem[];
    actions: {
        back_url: string;
        order_url: string | null;
        payment_url: string | null;
        track_url: string | null;
    };
};

type Props = {
    notification: NotificationDetail;
};

type TypeConfig = {
    icon: React.ComponentType<any>;
    accent: string;
    badge: string;
    iconWrap: string;
    panel: string;
    ctaLabel: string;
};

const FALLBACK_IMAGE = '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp';

const formatPrice = (amount: number) =>
    `Rp ${new Intl.NumberFormat('id-ID').format(Number(amount ?? 0))}`;

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

const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
};

const labelValue = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return value
        .split(/[_-]/g)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const typeConfig: Record<NotificationDetail['detail_type'], TypeConfig> = {
    general: {
        icon: Bell,
        accent: 'text-[#8C5A41]',
        badge: 'bg-[#F6EEE7] text-[#8C5A41]',
        iconWrap: 'bg-[#F1E6E2] text-[#8C5A41]',
        panel: 'bg-[#FAF8F5]',
        ctaLabel: 'View Notification',
    },
    order: {
        icon: Package,
        accent: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700',
        iconWrap: 'bg-emerald-100 text-emerald-700',
        panel: 'bg-emerald-50/50',
        ctaLabel: 'View Order',
    },
    payment: {
        icon: CreditCard,
        accent: 'text-violet-700',
        badge: 'bg-violet-50 text-violet-700',
        iconWrap: 'bg-violet-100 text-violet-700',
        panel: 'bg-violet-50/60',
        ctaLabel: 'View Payment',
    },
    shipping: {
        icon: Truck,
        accent: 'text-sky-700',
        badge: 'bg-sky-50 text-sky-700',
        iconWrap: 'bg-sky-100 text-sky-700',
        panel: 'bg-sky-50/60',
        ctaLabel: 'Track Shipment',
    },
};

function DetailRow({
    icon: Icon,
    label,
    value,
    valueClassName,
}: {
    icon: React.ComponentType<any>;
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] text-[#8A6B62]">
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className="mb-1 text-xs text-[#8A6B62]">{label}</p>
                <div
                    className={`text-sm font-semibold break-words text-[#4A2525] ${valueClassName ?? ''}`}
                >
                    {value}
                </div>
            </div>
        </div>
    );
}

function SidebarRow({
    icon: Icon,
    label,
    value,
    valueClassName,
}: {
    icon: React.ComponentType<any>;
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center text-[#8A6B62]">
                <Icon size={14} className="mr-2 shrink-0" />
                <span>{label}</span>
            </div>
            <span className={`text-right font-medium text-[#4A2525] ${valueClassName ?? ''}`}>
                {value}
            </span>
        </div>
    );
}

export default function DetailNotification({ notification }: Props) {
    const config = typeConfig[notification.detail_type] ?? typeConfig.general;
    const Icon = config.icon;
    const order = notification.order;
    const payment = notification.payment;
    const shipment = notification.shipment;
    const shippingLatest = shipment?.trackings?.[0] ?? null;
    const primaryActionHref =
        notification.detail_type === 'shipping'
            ? notification.actions.track_url || notification.actions.order_url
            : notification.detail_type === 'payment'
              ? notification.actions.payment_url || notification.actions.order_url
              : notification.actions.order_url;

    const markAsRead = () => {
        if (notification.is_read) {
            return;
        }

        router.post(
            `/notifications/${notification.id}/read`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <ProfileLayout
            title={
                <div className="flex flex-col items-start">
                    <Link
                        href={notification.actions.back_url}
                        className="group mb-4 flex items-center font-sans text-sm not-italic text-[#4A2525] transition-colors hover:text-black"
                    >
                        <ArrowLeft
                            size={16}
                            className="mr-2 transition-transform group-hover:-translate-x-1"
                        />
                        Back to Notifications
                    </Link>
                    <span>Notification Detail</span>
                </div>
            }
            pageTitle="Notification Detail"
            subtitle="Review full detail for this notification update."
            activePath="notifications"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Notifications', href: '/notifications' },
                { label: 'Notification Detail' },
            ]}
        >
            <Head title={notification.title} />

            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                    <div
                        className={`flex flex-col justify-between gap-4 rounded-2xl border border-[#EADBD8] p-6 shadow-sm transition-all hover:shadow-md md:flex-row md:items-start ${config.panel}`}
                    >
                        <div className="flex gap-4">
                            <div className="relative shrink-0">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${config.iconWrap}`}
                                >
                                    <Icon size={24} />
                                </div>
                                <div className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#8C5A41]"></div>
                            </div>
                            <div>
                                <p className={`mb-1 text-xs font-semibold ${config.accent}`}>
                                    {notification.type_label}
                                </p>
                                <h2 className="mb-2 font-serif text-lg text-[#4A2525] md:text-xl">
                                    {notification.title}
                                </h2>
                                <div className="flex items-center text-xs text-[#8A6B62]">
                                    <Clock size={14} className="mr-1" />
                                    {formatDateTime(notification.created_at)}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                            <span className="rounded-full bg-[#FDF0EE] px-3 py-1 text-xs font-semibold text-[#D46B5A]">
                                {notification.status_badge}
                            </span>
                            {notification.is_important && (
                                <span
                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
                                >
                                    <Star size={12} fill="currentColor" /> Important
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#EADBD8] bg-white p-6 shadow-sm">
                        <h3 className="mb-3 font-serif text-xl text-[#4A2525]">
                            Message Details
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-[#5C564D]">
                            {notification.message}
                        </p>

                        {notification.detail_type === 'shipping' && (
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-[#EADBD8] pt-6 md:grid-cols-2">
                                <DetailRow
                                    icon={ShoppingBag}
                                    label="Order Number"
                                    value={order?.order_number ? `#${order.order_number}` : '-'}
                                />
                                <DetailRow
                                    icon={Truck}
                                    label="Shipping Status"
                                    value={labelValue(shipment?.shipping_status ?? order?.shipping_status ?? null)}
                                />
                                <DetailRow
                                    icon={Package}
                                    label="Courier Service"
                                    value={`${shipment?.courier_company ?? '-'} ${shipment?.courier_service_name ? `- ${shipment.courier_service_name}` : ''}`}
                                />
                                <DetailRow
                                    icon={Calendar}
                                    label="Estimated Delivery"
                                    value={formatDate(shipment?.estimated_delivery ?? null)}
                                />
                                <DetailRow
                                    icon={Tag}
                                    label="Tracking Number"
                                    value={shipment?.waybill_id ?? shipment?.biteship_tracking_id ?? '-'}
                                />
                                <DetailRow
                                    icon={Info}
                                    label="Latest Update"
                                    value={shippingLatest?.description ?? shippingLatest?.status ?? '-'}
                                />
                            </div>
                        )}

                        {notification.detail_type === 'payment' && (
                            <div className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-[#EADBD8] pt-6 md:grid-cols-2">
                                <DetailRow
                                    icon={ShoppingBag}
                                    label="Order Number"
                                    value={order?.order_number ? `#${order.order_number}` : '-'}
                                />
                                <DetailRow
                                    icon={Check}
                                    label="Payment Status"
                                    value={labelValue(payment?.transaction_status ?? order?.payment_status ?? null)}
                                />
                                <DetailRow
                                    icon={CreditCard}
                                    label="Provider"
                                    value={labelValue(payment?.payment_provider ?? null)}
                                />
                                <DetailRow
                                    icon={Gift}
                                    label="Payment Method"
                                    value={labelValue(payment?.payment_method ?? null)}
                                />
                                <DetailRow
                                    icon={Tag}
                                    label="Payment Amount"
                                    value={formatPrice(payment?.gross_amount ?? order?.grand_total ?? 0)}
                                    valueClassName="text-violet-700"
                                />
                                <DetailRow
                                    icon={Calendar}
                                    label={payment?.paid_at ? 'Paid At' : 'Expires At'}
                                    value={formatDateTime(payment?.paid_at ?? payment?.expired_at ?? null)}
                                />
                                <DetailRow
                                    icon={Info}
                                    label="Transaction ID"
                                    value={payment?.midtrans_transaction_id ?? payment?.midtrans_order_id ?? '-'}
                                />
                                <DetailRow
                                    icon={Bell}
                                    label="Fraud Status"
                                    value={labelValue(payment?.fraud_status ?? null)}
                                />
                            </div>
                        )}

                        {notification.detail_type !== 'payment' &&
                            notification.detail_type !== 'shipping' && (
                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-[#EADBD8] pt-6 md:grid-cols-2">
                                    <DetailRow
                                        icon={Bell}
                                        label="Notification Type"
                                        value={notification.type_label}
                                    />
                                    <DetailRow
                                        icon={Clock}
                                        label="Created At"
                                        value={formatDateTime(notification.created_at)}
                                    />
                                    <DetailRow
                                        icon={Info}
                                        label="Reference Type"
                                        value={notification.reference_type ?? '-'}
                                    />
                                    <DetailRow
                                        icon={Tag}
                                        label="Reference ID"
                                        value={notification.reference_id ?? '-'}
                                    />
                                    {order && (
                                        <>
                                            <DetailRow
                                                icon={ShoppingBag}
                                                label="Order Number"
                                                value={`#${order.order_number}`}
                                            />
                                            <DetailRow
                                                icon={Package}
                                                label="Order Status"
                                                value={labelValue(order.order_status)}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                    </div>

                    {order && (
                        <div className="rounded-2xl border border-[#EADBD8] bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <h3 className="font-serif text-xl text-[#4A2525]">
                                    Order Summary
                                </h3>
                                <span className="rounded-full bg-[#F8EDED] px-3 py-1 text-xs font-semibold text-[#6B5C4B]">
                                    {order.items_count} item
                                </span>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-xl border border-[#EFEAE3] bg-[#FCFBF9] p-4">
                                    <p className="text-xs text-[#8A6B62]">Subtotal</p>
                                    <p className="mt-1 text-sm font-semibold text-[#4A2525]">
                                        {formatPrice(order.subtotal)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#EFEAE3] bg-[#FCFBF9] p-4">
                                    <p className="text-xs text-[#8A6B62]">Shipping</p>
                                    <p className="mt-1 text-sm font-semibold text-[#4A2525]">
                                        {formatPrice(order.shipping_cost)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#EFEAE3] bg-[#FCFBF9] p-4">
                                    <p className="text-xs text-[#8A6B62]">Service Fee</p>
                                    <p className="mt-1 text-sm font-semibold text-[#4A2525]">
                                        {formatPrice(order.service_fee)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-[#EFEAE3] bg-[#FCFBF9] p-4">
                                    <p className="text-xs text-[#8A6B62]">Grand Total</p>
                                    <p className="mt-1 text-sm font-semibold text-[#4A2525]">
                                        {formatPrice(order.grand_total)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-[#EADBD8] pt-6">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 rounded-xl border border-[#EFEAE3] p-4 sm:flex-row sm:items-center"
                                    >
                                        <img
                                            src={item.product_image_url || FALLBACK_IMAGE}
                                            alt={item.product_name}
                                            className="h-20 w-20 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[#4A2525]">
                                                {item.product_name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#8A6B62]">
                                                {[
                                                    item.color_name,
                                                    item.size ? `Size ${item.size}` : null,
                                                    `Qty ${item.quantity}`,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' • ')}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-[#4A2525]">
                                            {formatPrice(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {order.address && (
                                <div className="mt-6 rounded-xl border border-[#EFEAE3] bg-[#FCFBF9] p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4A2525]">
                                        <MapPin size={16} /> Shipping Address
                                    </div>
                                    <p className="text-sm text-[#5C564D]">
                                        {order.address.recipient_name} ({order.address.recipient_phone})
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-[#5C564D]">
                                        {order.address.full_address}, {order.address.city},{' '}
                                        {order.address.province} {order.address.postal_code}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={notification.actions.back_url}
                            className="flex items-center gap-2 rounded-lg border border-[#EADBD8] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]"
                        >
                            <ArrowLeft size={16} /> Back to Notifications
                        </Link>

                        {!notification.is_read && (
                            <button
                                type="button"
                                onClick={markAsRead}
                                className="flex items-center gap-2 rounded-lg border border-[#EADBD8] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]"
                            >
                                <Check size={16} /> Mark as Read
                            </button>
                        )}

                        {/* {notification.actions.order_url && (
                            <Link
                                href={notification.actions.order_url}
                                className="flex items-center gap-2 rounded-lg border border-[#EADBD8] bg-white px-4 py-2.5 text-sm font-medium text-[#5C564D] shadow-sm transition-colors hover:bg-[#FAF8F5]"
                            >
                                <Package size={16} /> View Order
                            </Link>
                        )} */}

                        {primaryActionHref && (
                            <a
                                href={primaryActionHref}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-auto flex items-center gap-2 rounded-lg bg-[#4A2525] px-6 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2A241C]"
                            >
                                <Icon size={16} /> {config.ctaLabel}
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-6 lg:w-[320px] xl:w-[360px]">
                    <div className="rounded-2xl border border-[#EADBD8] bg-white p-6 shadow-sm">
                        <h3 className="mb-5 font-serif text-lg text-[#4A2525]">
                            Related Information
                        </h3>

                        {notification.detail_type === 'shipping' ? (
                            <div className="mb-6 space-y-4">
                                <SidebarRow
                                    icon={Truck}
                                    label="Courier"
                                    value={shipment?.courier_company ?? '-'}
                                />
                                <SidebarRow
                                    icon={Tag}
                                    label="Tracking Number"
                                    value={shipment?.waybill_id ?? shipment?.biteship_tracking_id ?? '-'}
                                />
                                <SidebarRow
                                    icon={Info}
                                    label="Shipping Progress"
                                    value={labelValue(shipment?.shipping_status ?? null)}
                                    valueClassName="text-sky-700"
                                />
                                <SidebarRow
                                    icon={Calendar}
                                    label="Estimated Delivery"
                                    value={formatDate(shipment?.estimated_delivery ?? null)}
                                />
                            </div>
                        ) : notification.detail_type === 'payment' ? (
                            <div className="mb-6 space-y-4">
                                <SidebarRow
                                    icon={CreditCard}
                                    label="Provider"
                                    value={labelValue(payment?.payment_provider ?? null)}
                                />
                                <SidebarRow
                                    icon={Gift}
                                    label="Method"
                                    value={labelValue(payment?.payment_method ?? null)}
                                />
                                <SidebarRow
                                    icon={Tag}
                                    label="Amount"
                                    value={formatPrice(payment?.gross_amount ?? order?.grand_total ?? 0)}
                                    valueClassName="text-violet-700"
                                />
                                <SidebarRow
                                    icon={Check}
                                    label="Status"
                                    value={labelValue(payment?.transaction_status ?? order?.payment_status ?? null)}
                                />
                            </div>
                        ) : (
                            <div className="mb-6 space-y-4">
                                <SidebarRow
                                    icon={Bell}
                                    label="Category"
                                    value={notification.type_label}
                                />
                                <SidebarRow
                                    icon={Clock}
                                    label="Created"
                                    value={formatDateTime(notification.created_at)}
                                />
                                <SidebarRow
                                    icon={Info}
                                    label="Reference"
                                    value={notification.reference_type ?? '-'}
                                />
                                <SidebarRow
                                    icon={Package}
                                    label="Order"
                                    value={order?.order_number ?? '-'}
                                />
                            </div>
                        )}

                        {primaryActionHref && (
                            <a
                                href={primaryActionHref}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4A2525] py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[#2A241C]"
                            >
                                {config.ctaLabel} <ExternalLink size={16} />
                            </a>
                        )}
                    </div>

                    <div className="rounded-2xl border border-[#EADBD8] bg-white p-6 shadow-sm">
                        <h3 className="mb-6 font-serif text-lg text-[#4A2525]">
                            Activity Timeline
                        </h3>
                        <div className="relative ml-2 space-y-7 border-l border-[#EADBD8]">
                            {notification.timeline.length === 0 ? (
                                <div className="pl-6 text-sm text-[#8A6B62]">
                                    No activity recorded yet.
                                </div>
                            ) : (
                                notification.timeline.map((item) => (
                                    <div key={item.id} className="relative pl-6">
                                        <div
                                            className={
                                                item.is_current
                                                    ? 'absolute -left-[9px] top-0 h-[18px] w-[18px] rounded-full border-[4px] border-[#FAF8F5] bg-[#4A2525] shadow-[0_0_0_1px_#4A2525]'
                                                    : 'absolute -left-[7px] top-1 h-[14px] w-[14px] rounded-full border-2 border-[#B6574B] bg-white'
                                            }
                                        ></div>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p
                                                    className={`text-sm ${item.is_current ? 'font-bold text-[#4A2525]' : 'font-medium text-[#4A2525]'}`}
                                                >
                                                    {item.title}
                                                </p>
                                                {item.description && (
                                                    <p className="mt-1 text-xs leading-relaxed text-[#8A6B62]">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.location && (
                                                    <p className="mt-1 text-xs text-[#8A6B62]">
                                                        {item.location}
                                                    </p>
                                                )}
                                            </div>
                                            <p
                                                className={`shrink-0 text-xs ${item.is_current ? 'font-bold text-[#4A2525]' : 'text-[#8A6B62]'}`}
                                            >
                                                {formatDateTime(item.happened_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    );
}
