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

type IconComponent = ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
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
    payment_logs: Array<{ id: number; event_type: string | null; transaction_status: string | null; processed_at: string | null; created_at: string | null }>;
    shipment: Shipment | null;
    trackings: Tracking[];
};

type Props = { order: Order };

const FALLBACK_IMAGE = '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp';

const formatPrice = (amount: number) => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

const formatDateTime = (value: string | null) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const labelStatus = (status: string | null) => {
    if (!status) return '-';

    return status
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

function StatusPill({ children, tone = 'green' }: { children: ReactNode; tone?: StatusTone }) {
    const tones = {
        amber: 'bg-[#fff0d6] text-[#b57525]',
        blue: 'bg-[#e8f1fb] text-[#496b8f]',
        gray: 'bg-[#eeeeec] text-[#6f6860]',
        green: 'bg-[#e5f3df] text-[#537a42]',
        red: 'bg-[#fde8e2] text-[#b7604f]',
    };

    return <span className={`inline-flex rounded px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function SmallIconButton({ icon: Icon, label, href, external = false }: { icon: IconComponent; label: string; href?: string | null; external?: boolean }) {
    const className = 'inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-[#e5d7ca] bg-white px-5 text-[12px] font-semibold text-[#4a392c] transition hover:border-[#c9a983] hover:bg-[#fbf4ed]';

    if (!href) {
        return <button type="button" disabled className={`${className} cursor-not-allowed opacity-50`}><Icon size={15} strokeWidth={1.7} />{label}</button>;
    }

    if (external) {
        return <a href={href} target="_blank" rel="noreferrer" className={className}><Icon size={15} strokeWidth={1.7} />{label}</a>;
    }

    return <Link href={href} className={className}><Icon size={15} strokeWidth={1.7} />{label}</Link>;
}

function InfoLine({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-3 text-[12px] leading-relaxed">
            <Icon className="mt-0.5 text-[#9b8777]" size={15} strokeWidth={1.65} />
            <span className="text-[#8b7b6e]">{label}</span>
            <span className="font-semibold text-[#3f3025]">{value || '-'}</span>
        </div>
    );
}

function buildProgress(order: Order) {
    const paidAt = order.paid_at ?? order.payment?.paid_at ?? order.payment_logs.find((log) => log.transaction_status === 'settlement')?.processed_at ?? null;
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
    const currentRank = rank[current] ?? (current === 'cancelled' || current === 'expired' ? 0 : 1);

    return [
        { icon: ClipboardList, label: 'Order Placed', time: formatDateTime(order.created_at), complete: true },
        { icon: Check, label: 'Payment Confirmed', time: formatDateTime(paidAt), complete: currentRank >= 1 },
        { icon: ShieldCheck, label: 'Order Processed', time: currentRank >= 2 ? labelStatus(order.order_status) : '-', complete: currentRank >= 2 },
        { icon: Package, label: 'Packed', time: currentRank >= 3 ? labelStatus(order.order_status) : '-', complete: currentRank >= 3 },
        { icon: Truck, label: 'Shipped', time: formatDateTime(order.shipment?.shipped_at ?? null), complete: currentRank >= 4, active: currentRank === 4 },
        { icon: Check, label: 'Delivered', time: formatDateTime(order.shipment?.delivered_at ?? order.completed_at), complete: currentRank >= 5, active: currentRank >= 5 },
    ];
}

export default function DetailOrder({ order }: Props) {
    const progressSteps = buildProgress(order);
    const courier = [order.shipment?.courier_company, order.shipment?.courier_type || order.shipment?.courier_service_name].filter(Boolean).join(' ');
    const address = order.address;
    const paymentMethod = [order.payment?.payment_provider, order.payment?.payment_method].filter(Boolean).join(' / ') || '-';
    const transactionId = order.payment?.midtrans_transaction_id ?? order.payment?.midtrans_order_id ?? '-';
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
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(130px,0.9fr)_minmax(110px,0.65fr)_minmax(110px,0.65fr)_minmax(120px,0.65fr)]">
                            <div>
                                <p className="text-[11px] font-semibold text-[#9a8575]">Order Number</p>
                                <h2 className="mt-1 font-serif text-[24px] leading-none text-[#2d2119]">{order.order_number}</h2>
                                <p className="mt-2 text-[12px] font-medium text-[#7f6d60]">{order.created_date ?? '-'} • {order.created_time ?? '-'}</p>
                            </div>
                            <div><p className="text-[11px] font-semibold text-[#9a8575]">Payment Method</p><p className="mt-2 text-[13px] font-semibold text-[#3d3027]">{paymentMethod}</p></div>
                            <div><p className="text-[11px] font-semibold text-[#9a8575]">Payment Status</p><div className="mt-2"><StatusPill tone={statusTone(order.payment_status)}>{labelStatus(order.payment_status)}</StatusPill></div></div>
                            <div><p className="text-[11px] font-semibold text-[#9a8575]">Order Status</p><div className="mt-2"><StatusPill tone={statusTone(order.order_status)}>{labelStatus(order.order_status)}</StatusPill></div></div>
                            <div><p className="text-[11px] font-semibold text-[#9a8575]">Est. Arrival</p><p className="mt-2 text-[13px] font-semibold text-[#3d3027]">{order.shipment?.estimated_delivery ?? '-'}</p></div>
                        </div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <SmallIconButton href={order.shipment?.label_url ?? null} external icon={Truck} label="Track Order" />
                            <SmallIconButton href="/list" icon={RefreshCcw} label="Buy Again" />
                            <SmallIconButton href={order.shipment?.label_url ?? null} external icon={Download} label="Shipping Label" />
                            <SmallIconButton href="/notifications" icon={Headphones} label="Contact Support" />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="font-serif text-[22px] text-[#2d2119]">Order Progress</h2>
                        <div className="hide-scrollbar mt-7 overflow-x-auto pb-1">
                            <div className="relative grid min-w-[760px] grid-cols-6 gap-0">
                                <div className="absolute top-[22px] right-[8.5%] left-[8.5%] h-px bg-[#d8ae8f]" />
                                {progressSteps.map((step) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.label} className="relative flex flex-col items-center text-center">
                                            <div className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border bg-white transition-all ${step.active ? 'border-[#2f2016] bg-[#2f2016] text-white shadow-md' : step.complete ? 'border-[#d4b79d] text-[#8a6b55]' : 'border-[#e2ddd8] text-[#c6bdb4]'}`}>
                                                <Icon size={17} strokeWidth={1.65} />
                                            </div>
                                            <p className="mt-4 text-[12px] font-bold text-[#4b3a2d]">{step.label}</p>
                                            <p className="mt-1 text-[11px] font-medium text-[#867366]">{step.time}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {order.trackings.length > 0 && (
                            <div className="mt-6 space-y-3 border-t border-[#eee3da] pt-5">
                                {order.trackings.map((tracking) => (
                                    <div key={tracking.id} className="grid gap-1 text-[12px] sm:grid-cols-[150px_1fr]">
                                        <span className="font-semibold text-[#7f6d60]">{formatDateTime(tracking.happened_at)}</span>
                                        <span className="text-[#3f3025]">{labelStatus(tracking.status)}{tracking.location ? ` - ${tracking.location}` : ''}{tracking.description ? `: ${tracking.description}` : ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-sm">
                        <div className="p-5 pb-3 sm:p-6 sm:pb-4"><h2 className="font-serif text-[22px] text-[#2d2119]">Ordered Items</h2></div>
                        <div className="hide-scrollbar overflow-x-auto px-5 pb-5 sm:px-6">
                            <table className="w-full min-w-[840px] border-collapse overflow-hidden rounded-[10px] text-left text-[12px]">
                                <thead><tr className="bg-[#f5ebe3] text-[#6d5c50]"><th className="w-[38%] rounded-tl-lg px-4 py-3 font-semibold">Item</th><th className="px-4 py-3 font-semibold">Details</th><th className="px-4 py-3 font-semibold">Unit Price</th><th className="px-4 py-3 text-center font-semibold">Qty</th><th className="rounded-tr-lg px-4 py-3 text-right font-semibold">Subtotal</th></tr></thead>
                                <tbody className="divide-y divide-[#eee3da] rounded-b-lg border-x border-b border-[#eee3da]">
                                    {order.items.map((item) => {
                                        const productUrl = item.product_slug ? productShow.url({ product: item.product_slug }) : '#';
                                        return (
                                        <tr key={item.id} className="bg-white align-middle transition-colors hover:bg-[#FAF9F6]">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Link href={productUrl} className="h-[74px] w-[74px] flex-shrink-0 overflow-hidden rounded-[8px] bg-[#f4ebe4]"><img src={item.product_image_url ?? FALLBACK_IMAGE} alt={item.product_name} className="h-full w-full object-cover object-top" /></Link>
                                                    <div><Link href={productUrl} className="text-[13px] font-bold text-[#3d3027] transition hover:text-[#8f684b]">{item.product_name}</Link><p className="mt-1 text-[11px] text-[#8b7b6e]">SKU: {item.variant_sku ?? item.product_sku ?? '-'}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[#6d5c50]"><p>Color: <span className="font-semibold text-[#3d3027]">{item.color_name ?? '-'}</span></p><p className="mt-2">Size: <span className="font-semibold text-[#3d3027]">{item.size ?? '-'}</span></p><p className="mt-2">Weight: <span className="font-semibold text-[#3d3027]">{item.weight ? `${item.weight} gr` : '-'}</span></p></td>
                                            <td className="px-4 py-4 font-semibold text-[#3d3027]">{formatPrice(item.price)}</td>
                                            <td className="px-4 py-4 text-center font-semibold text-[#3d3027]">{item.quantity}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-[#3d3027]">{formatPrice(item.subtotal)}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                            <h2 className="font-serif text-[20px] text-[#2d2119]">Shipping Information</h2>
                            <div className="mt-5 space-y-3">
                                <InfoLine icon={UserRound} label="Recipient" value={address?.recipient_name ?? order.customer_name} />
                                <InfoLine icon={Headphones} label="Phone" value={address?.recipient_phone ?? order.customer_phone} />
                                <InfoLine icon={MapPin} label="Address" value={address ? `${address.full_address}, ${address.district}, ${address.city}, ${address.province} ${address.postal_code}` : '-'} />
                                <InfoLine icon={Truck} label="Courier" value={courier || '-'} />
                                <InfoLine icon={ReceiptText} label="Tracking No." value={order.shipment?.waybill_id ?? '-'} />
                                <InfoLine icon={FileText} label="Delivery Note" value={address?.note ?? '-'} />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                            <h2 className="font-serif text-[20px] text-[#2d2119]">Payment Information</h2>
                            <div className="mt-5 space-y-3">
                                <InfoLine icon={CreditCard} label="Method" value={paymentMethod} />
                                <InfoLine icon={ReceiptText} label="Transaction" value={transactionId} />
                                <InfoLine icon={ClipboardList} label="Payment Date" value={formatDateTime(order.paid_at ?? order.payment?.paid_at ?? null)} />
                                <div className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-3 text-[12px] leading-relaxed">
                                    <WalletCards className="mt-0.5 text-[#9b8777]" size={15} strokeWidth={1.65} />
                                    <span className="text-[#8b7b6e]">Status</span>
                                    <StatusPill tone={statusTone(order.payment_status)}>{labelStatus(order.payment_status)}</StatusPill>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                        <h2 className="font-serif text-[22px] text-[#2d2119]">Order Summary</h2>
                        <div className="mt-6 space-y-4">
                            <SummaryRow label="Subtotal" value={formatPrice(order.subtotal)} />
                            <SummaryRow label="Shipping Cost" value={formatPrice(order.shipping_cost)} />
                            <SummaryRow label="Discount" value={`- ${formatPrice(order.discount_amount)}`} danger={order.discount_amount > 0} />
                            <SummaryRow label="Voucher / Promo" value={order.voucher_code ?? '-'} />
                            <SummaryRow label="Service Fee" value={formatPrice(order.service_fee)} />
                        </div>
                        <div className="mt-7 border-t border-[#eee3da] pt-6">
                            <p className="text-[13px] font-semibold text-[#7b6758]">Total Payment</p>
                            <p className="mt-2 font-serif text-[32px] leading-none text-[#221914]">{formatPrice(order.grand_total)}</p>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                        <h2 className="font-serif text-[20px] text-[#2d2119]">Invoice & Documents</h2>
                        <div className="mt-5 text-[12px]"><p className="text-[#8b7b6e]">Invoice No.</p><p className="mt-1 text-[13px] font-bold text-[#3d3027]">{invoiceNumber}</p></div>
                        <div className="mt-5 space-y-3">
                            <SmallIconButton href={order.shipment?.label_url ?? null} external icon={Download} label="Shipping Label" />
                            <SmallIconButton href={order.payment?.midtrans_redirect_url ?? null} external icon={FileText} label="Payment Page" />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-sm">
                        <h2 className="font-serif text-[20px] text-[#2d2119]">Order Notes</h2>
                        <p className="mt-3 border-l-2 border-[#EAE8E3] pl-3 text-[12px] leading-5 text-[#716155] italic">{order.notes ?? 'No notes for this order.'}</p>
                    </section>
                </aside>
            </div>
        </ProfileLayout>
    );
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6f5e52]">{label}</span>
            <span className={danger ? 'font-semibold text-[#c45745]' : 'font-semibold text-[#3d3027]'}>{value}</span>
        </div>
    );
}
