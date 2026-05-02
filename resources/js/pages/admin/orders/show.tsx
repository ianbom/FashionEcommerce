import React, { FormEvent } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowLeft, Printer, MessageCircle, ChevronDown, 
    FileText, Edit3, Box, User, MapPin, CreditCard, Truck, 
    Clock, StickyNote, Code, ShieldCheck, Mail, Map, 
    Copy, ExternalLink, ChevronRight, CheckCircle2, Circle,
    Check, XCircle, Search, Save, PackagePlus
} from 'lucide-react';
import InputError from '@/components/input-error';
import { formatPrice } from '@/pages/admin/sales/shared';

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
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
    payment_logs: { id: number; event_type: string | null; transaction_status: string | null; processed_at: string | null }[];
    shipment: Record<string, string | number | null> | null;
    trackings: { id: number; status: string; description: string | null; location: string | null; happened_at: string | null }[];
};

type Props = {
    order: Order;
};

// Reusable Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.03)] p-5 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ icon: Icon, title, rightElement, description }: { icon: any, title: React.ReactNode, rightElement?: React.ReactNode, description?: React.ReactNode }) => (
    <div className="border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
                <Icon size={16} className="text-gray-400" />
                {title}
            </div>
            {rightElement}
        </div>
        {description && <p className="text-[11px] text-gray-500 mt-1 ml-6">{description}</p>}
    </div>
);

const DetailRow = ({ label, value, labelWidth = "w-[130px]", valueClass = "text-gray-900 font-medium truncate" }: { label: React.ReactNode, value: React.ReactNode, labelWidth?: string, valueClass?: string }) => (
    <div className="flex text-[12px] mb-2 leading-tight items-start">
        <span className={`text-gray-500 ${labelWidth} flex-shrink-0`}>{label}</span>
        <span className="text-gray-400 mr-2 flex-shrink-0">:</span>
        <span className={valueClass}>{value}</span>
    </div>
);

const Badge = ({ children, variant = 'gray', className = "" }: { children: React.ReactNode, variant?: 'green' | 'blue' | 'gray' | 'red' | 'yellow' | 'outline', className?: string }) => {
    const colors = {
        green: 'bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]',
        blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        red: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]',
        yellow: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]',
        outline: 'bg-white text-gray-600 border-gray-200'
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${colors[variant]} ${className}`}>
            {children}
        </span>
    );
};

const Accordion = ({ title, children }: { title: string, children?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="mt-2">
            <div 
                className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Code size={14} className="text-gray-400" />
                    {title}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && children && (
                <div className="p-3 border border-t-0 border-gray-200 rounded-b-lg bg-gray-50 text-[11px] overflow-auto max-h-[300px]">
                    <pre className="text-gray-600 font-mono whitespace-pre-wrap">{children}</pre>
                </div>
            )}
        </div>
    );
};

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
        noteForm.post(`/admin/orders/${order.id}/notes`, { preserveScroll: true });
    };

    const submitShipment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        shipmentForm.post(`/admin/orders/${order.id}/shipments`, { forceFormData: true, preserveScroll: true });
    };

    const updateStatus = (newStatus: string) => {
        router.post(`/admin/orders/${order.id}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        if (!status) return <Badge variant="gray">Unknown</Badge>;
        const lower = status.toLowerCase();
        if (['paid', 'completed', 'settlement', 'capture', 'accept'].includes(lower)) return <Badge variant="green">{status.toUpperCase()}</Badge>;
        if (['pending', 'processing', 'ready_to_ship'].includes(lower)) return <Badge variant="yellow">{status.replace(/_/g, ' ').toUpperCase()}</Badge>;
        if (['shipped', 'shipping'].includes(lower)) return <Badge variant="blue">{status.toUpperCase()}</Badge>;
        if (['cancelled', 'failed', 'expired', 'deny'].includes(lower)) return <Badge variant="red">{status.toUpperCase()}</Badge>;
        return <Badge variant="gray">{status.toUpperCase()}</Badge>;
    };

    const totalItems = order.items.length;
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Head title={`Order Detail - ${order.order_number}`} />
            
            <div className="max-w-[1600px] mx-auto pb-10 px-4 md:px-8 mt-6">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                            Order Detail
                            <span className="text-[15px] font-bold text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{order.order_number}</span>
                        </h1>
                        <p className="text-[13px] text-gray-500 mt-1">Review complete order information, payment, shipment, and customer details.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        <Link href="/admin/orders" className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <ArrowLeft size={14} /> Back to Orders
                        </Link>
                        <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <Printer size={14} /> Print Invoice
                        </button>
                        <a href={`mailto:${order.customer_email}`} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <MessageCircle size={14} /> Contact Customer
                        </a>
                        
                        <div className="flex gap-1 ml-2 pl-3 border-l border-gray-200">
                            {['processing', 'ready_to_ship', 'completed'].map((st) => (
                                <button 
                                    key={st}
                                    onClick={() => updateStatus(st)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
                                >
                                    {st === 'completed' && <CheckCircle2 size={14} className="text-green-600"/>}
                                    {st === 'processing' && <Clock size={14} className="text-yellow-600"/>}
                                    {st === 'ready_to_ship' && <PackagePlus size={14} className="text-blue-600"/>}
                                    {st.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-5">
                    {/* --- MAIN CONTENT (LEFT) --- */}
                    <div className="flex-1 space-y-5 min-w-0">
                        
                        {/* Row 1: Overview & Status Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            {/* 1. Order Overview */}
                            <Card className="lg:col-span-5">
                                <CardTitle icon={FileText} title="1. Order Overview" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <DetailRow label="Order Number" value={order.order_number} labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Name" value={order.customer_name} labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Email" value={order.customer_email} labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Phone" value={order.customer_phone} labelWidth="w-[90px]" />
                                    </div>
                                    <div>
                                        <DetailRow label="Payment Status" value={getStatusBadge(order.payment_status)} labelWidth="w-[90px]" />
                                        <DetailRow label="Order Status" value={getStatusBadge(order.order_status)} labelWidth="w-[90px]" />
                                        <DetailRow label="Shipping Status" value={getStatusBadge(order.shipping_status)} labelWidth="w-[90px]" />
                                        {order.payment?.processed_at && (
                                            <DetailRow label="Paid At" value={formatDate(String(order.payment.processed_at))} labelWidth="w-[90px]" />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-[11px] text-gray-500 mb-1 font-medium flex items-center gap-1"><StickyNote size={12}/> Internal Order Notes</p>
                                    <p className="text-[12px] text-gray-800 italic">{order.notes || 'No internal notes for this order.'}</p>
                                </div>
                            </Card>

                            {/* 2. Order Status Management */}
                            <Card className="lg:col-span-7">
                                <CardTitle icon={Edit3} title="Order Status Management" rightElement={
                                    <div className="flex flex-col items-end">
                                        <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${order.no_return_refund_agreed ? 'text-[#8C6B4A]' : 'text-gray-400'}`}>
                                            <ShieldCheck size={14} /> No Return / Refund Agreed: {order.no_return_refund_agreed ? 'Yes' : 'No'}
                                        </div>
                                        {order.no_return_refund_agreed_at && (
                                            <p className="text-[10px] text-gray-500">Agreed At {formatDate(order.no_return_refund_agreed_at)}</p>
                                        )}
                                    </div>
                                } />
                                
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Payment Status</label>
                                        <div className="text-[12px] font-semibold text-gray-900 border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5">
                                            {order.payment_status?.toUpperCase() ?? 'PENDING'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Order Status</label>
                                        <div className="text-[12px] font-semibold text-gray-900 border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5">
                                            {order.order_status?.toUpperCase() ?? 'PENDING'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Shipping Status</label>
                                        <div className="text-[12px] font-semibold text-gray-900 border border-gray-100 bg-gray-50 rounded-lg px-3 py-1.5">
                                            {order.shipping_status?.toUpperCase() ?? 'PENDING'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] text-gray-500 mb-1">Update Internal Note</label>
                                    <form onSubmit={submitNotes} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={noteForm.data.notes} 
                                            onChange={(e) => noteForm.setData('notes', e.target.value)}
                                            placeholder="Write internal note here..." 
                                            className="flex-1 text-[12px] border border-gray-200 rounded-lg py-1.5 px-3 bg-white text-gray-800 focus:outline-none focus:border-gray-400" 
                                        />
                                        <button disabled={noteForm.processing} type="submit" className="bg-[#3E3222] text-white text-[12px] font-medium px-4 py-1.5 rounded-lg hover:bg-[#2A2217] transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-2">
                                            <Save size={14} /> Save Note
                                        </button>
                                    </form>
                                    {noteForm.errors.notes && <p className="text-red-500 text-[10px] mt-1">{noteForm.errors.notes}</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Create Shipment Form */}
                        {!order.shipment && order.payment_status === 'paid' && (
                            <Card className="bg-[#F8F9FA] border-[#E5E7EB]">
                                <CardTitle 
                                    icon={PackagePlus} 
                                    title="Create Shipment" 
                                    description="Shipment hanya dapat dibuat sekali untuk order paid. Foto label disimpan ke Laravel public storage." 
                                />
                                <form onSubmit={submitShipment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Courier Company</label>
                                        <input 
                                            value={shipmentForm.data.courier_company} 
                                            onChange={(e) => shipmentForm.setData('courier_company', e.target.value)} 
                                            placeholder="jne"
                                            className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3" 
                                        />
                                        {shipmentForm.errors.courier_company && <InputError message={shipmentForm.errors.courier_company} />}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Courier Type</label>
                                        <input 
                                            value={shipmentForm.data.courier_type} 
                                            onChange={(e) => shipmentForm.setData('courier_type', e.target.value)} 
                                            placeholder="reg"
                                            className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3" 
                                        />
                                        {shipmentForm.errors.courier_type && <InputError message={shipmentForm.errors.courier_type} />}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Service Name</label>
                                        <input 
                                            value={shipmentForm.data.courier_service_name} 
                                            onChange={(e) => shipmentForm.setData('courier_service_name', e.target.value)} 
                                            placeholder="JNE Reguler"
                                            className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3" 
                                        />
                                        {shipmentForm.errors.courier_service_name && <InputError message={shipmentForm.errors.courier_service_name} />}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Waybill ID / Resi</label>
                                        <input 
                                            value={shipmentForm.data.waybill_id} 
                                            onChange={(e) => shipmentForm.setData('waybill_id', e.target.value)} 
                                            placeholder="JD0123456789"
                                            className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3" 
                                        />
                                        {shipmentForm.errors.waybill_id && <InputError message={shipmentForm.errors.waybill_id} />}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Estimated Delivery</label>
                                        <input 
                                            value={shipmentForm.data.estimated_delivery} 
                                            onChange={(e) => shipmentForm.setData('estimated_delivery', e.target.value)} 
                                            placeholder="2-3 Days"
                                            className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3" 
                                        />
                                        {shipmentForm.errors.estimated_delivery && <InputError message={shipmentForm.errors.estimated_delivery} />}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Label Photo (Optional)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => shipmentForm.setData('label_photo', e.target.files?.[0] ?? null)} 
                                            className="w-full text-[11px] border border-gray-200 rounded-lg py-1.5 px-2 bg-white" 
                                        />
                                        {shipmentForm.errors.label_photo && <InputError message={shipmentForm.errors.label_photo} />}
                                    </div>
                                    <div className="lg:col-span-3 flex justify-end mt-2">
                                        <button disabled={shipmentForm.processing} type="submit" className="bg-[#3E3222] flex items-center gap-2 text-white text-[12px] font-medium px-5 py-2 rounded-lg hover:bg-[#2A2217] transition-colors disabled:opacity-50">
                                            <PackagePlus size={14} /> Create Shipment
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* 3. Ordered Items */}
                        <Card className="!p-0 overflow-hidden">
                            <div className="p-4 pb-0">
                                <CardTitle icon={Box} title="3. Ordered Items" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[12px] border-collapse">
                                    <thead className="bg-[#F8F9FA] text-gray-500 border-y border-gray-200 font-medium">
                                        <tr>
                                            <th className="py-2.5 px-4 font-medium w-10 text-center">#</th>
                                            <th className="py-2.5 px-4 font-medium min-w-[180px]">Product Name</th>
                                            <th className="py-2.5 px-4 font-medium">Product SKU</th>
                                            <th className="py-2.5 px-4 font-medium">Variant SKU</th>
                                            <th className="py-2.5 px-4 font-medium">Color</th>
                                            <th className="py-2.5 px-4 font-medium">Size</th>
                                            <th className="py-2.5 px-4 font-medium text-right">Unit Price</th>
                                            <th className="py-2.5 px-4 font-medium text-center">Qty</th>
                                            <th className="py-2.5 px-4 font-medium text-right">Item Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {order.items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 text-center text-gray-500">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.product_image_url ? (
                                                            <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                                <img src={item.product_image_url} className="w-full h-full object-cover" alt={item.product_name} />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                                                <Box size={14} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900 line-clamp-2">{item.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{item.product_sku ?? '-'}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.variant_sku ?? '-'}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.color_name ?? '-'}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.size ?? '-'}</td>
                                                <td className="py-3 px-4 text-gray-900 text-right">{formatPrice(item.price)}</td>
                                                <td className="py-3 px-4 text-gray-900 text-center">{item.quantity}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium text-right">{formatPrice(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                        {order.items.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="py-4 text-center text-gray-500">No items found in this order.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-[#F8F9FA] px-4 py-3 flex justify-between items-center text-[12px] text-gray-600 border-t border-gray-200">
                                <div>Total Items: <span className="font-semibold text-gray-900">{totalItems}</span></div>
                                <div className="flex gap-8">
                                    <div>Total Quantity: <span className="font-semibold text-gray-900">{totalQuantity}</span></div>
                                </div>
                            </div>
                        </Card>

                        {/* Row 4: Customer & Shipping */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 4. Customer Information */}
                            <Card>
                                <CardTitle icon={User} title="4. Customer Information" />
                                <div className="flex flex-col gap-4">
                                    <div className="flex-1">
                                        <DetailRow label="Customer Name" value={order.customer_name} />
                                        <DetailRow label="Customer Email" value={order.customer_email} />
                                        <DetailRow label="Customer Phone" value={order.customer_phone} />
                                    </div>
                                    <div className="flex gap-2">
                                        <a href={`mailto:${order.customer_email}`} className="flex-1 flex items-center gap-2 justify-center px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                                            <Mail size={14}/> Contact via Email
                                        </a>
                                        {order.customer_phone && (
                                            <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center gap-2 justify-center px-3 py-1.5 text-[11px] font-medium border border-[#25D366]/30 bg-[#25D366]/5 rounded-lg text-[#128C7E] hover:bg-[#25D366]/10">
                                                <MessageCircle size={14}/> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* 5. Shipping Address */}
                            <Card>
                                <CardTitle icon={MapPin} title="5. Shipping Address" rightElement={
                                    order.address?.latitude && order.address?.longitude ? (
                                        <a href={`https://maps.google.com/?q=${order.address.latitude},${order.address.longitude}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700">
                                            <Map size={12} /> Open Map
                                        </a>
                                    ) : null
                                } />
                                <div className="flex flex-col gap-2">
                                    <DetailRow label="Recipient" value={String(order.address?.recipient_name ?? '-')} labelWidth="w-[90px]" />
                                    <DetailRow label="Phone" value={String(order.address?.recipient_phone ?? '-')} labelWidth="w-[90px]" />
                                    <DetailRow label="City" value={String(order.address?.city ?? '-')} labelWidth="w-[90px]" />
                                    <DetailRow label="Postal Code" value={String(order.address?.postal_code ?? '-')} labelWidth="w-[90px]" />
                                    <DetailRow label="Full Address" value={String(order.address?.full_address ?? '-')} labelWidth="w-[90px]" valueClass="text-gray-900 font-medium leading-tight whitespace-normal" />
                                    <DetailRow label="Address Note" value={String(order.address?.address_note ?? '-')} labelWidth="w-[90px]" valueClass="text-gray-900 font-medium leading-tight whitespace-normal" />
                                </div>
                            </Card>
                        </div>

                        {/* Row 5: Payment & Shipment Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 6. Payment Information */}
                            <Card>
                                <CardTitle icon={CreditCard} title="6. Payment Information" />
                                {order.payment ? (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <DetailRow label="Provider" value={String(order.payment.payment_provider ?? '-')} labelWidth="w-[110px]" />
                                            <DetailRow label="Method" value={String(order.payment.payment_method ?? '-')} labelWidth="w-[110px]" />
                                            <DetailRow label="Transaction ID" value={String(order.payment.midtrans_transaction_id ?? '-')} labelWidth="w-[110px]" />
                                            <DetailRow label="Gross Amount" value={formatPrice(String(order.payment.gross_amount ?? 0))} labelWidth="w-[110px]" />
                                        </div>
                                        <Accordion title="Raw Payment Data">
                                            {JSON.stringify(order.payment, null, 2)}
                                        </Accordion>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 py-4 text-center">No payment record found.</p>
                                )}
                            </Card>

                            {/* 7. Shipment Information */}
                            <Card>
                                <CardTitle icon={Truck} title="7. Shipment Information" />
                                {order.shipment ? (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <DetailRow label="Courier" value={`${order.shipment.courier_company ?? '-'} ${order.shipment.courier_type ?? ''}`} labelWidth="w-[110px]" />
                                            <DetailRow label="Service Name" value={String(order.shipment.courier_service_name ?? '-')} labelWidth="w-[110px]" />
                                            <DetailRow label="Waybill ID" value={String(order.shipment.waybill_id ?? '-')} labelWidth="w-[110px]" />
                                            <DetailRow label="Est. Delivery" value={String(order.shipment.estimated_delivery ?? '-')} labelWidth="w-[110px]" />
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                            {order.shipment.tracking_url && (
                                                <a href={String(order.shipment.tracking_url)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex-1 justify-center">
                                                    <MapPin size={12} /> Track Online
                                                </a>
                                            )}
                                            <Link href={`/admin/shipments/${order.shipment.id}`} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex-1 justify-center">
                                                <ExternalLink size={12} /> View Shipment Detail
                                            </Link>
                                        </div>
                                        <Accordion title="Raw Shipment Data">
                                            {JSON.stringify(order.shipment, null, 2)}
                                        </Accordion>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 py-4 text-center">No shipment created yet.</p>
                                )}
                            </Card>
                        </div>

                        {/* Row 6: Timeline & Technical */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 8. Tracking Timeline */}
                            <Card className="flex flex-col h-full">
                                <CardTitle icon={Clock} title="8. Tracking Timeline" />
                                {order.trackings && order.trackings.length > 0 ? (
                                    <div className="space-y-4 mt-2">
                                        {order.trackings.map((track, i) => (
                                            <div key={track.id} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-[#3E3222] mt-1"></div>
                                                    {i !== order.trackings.length - 1 && <div className="w-px h-full bg-gray-200 my-1"></div>}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="text-[12px] font-bold text-gray-900">{track.status}</p>
                                                    <p className="text-[11px] text-gray-600 mt-0.5">{track.description} {track.location && `- ${track.location}`}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(track.happened_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-gray-500 italic mt-2">No tracking updates available.</p>
                                )}
                            </Card>

                            <div className="flex flex-col gap-5">
                                {/* 9. Raw Data */}
                                <Card>
                                    <CardTitle icon={Code} title="9. Technical Data" />
                                    <div className="space-y-2">
                                        <Accordion title="Raw Order Object">
                                            {JSON.stringify(order, null, 2)}
                                        </Accordion>
                                        <Accordion title="Payment Logs">
                                            {JSON.stringify(order.payment_logs, null, 2)}
                                        </Accordion>
                                        <Accordion title="Tracking Logs">
                                            {JSON.stringify(order.trackings, null, 2)}
                                        </Accordion>
                                    </div>
                                </Card>
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT SIDEBAR --- */}
                    <div className="w-full xl:w-[320px] space-y-5 flex-shrink-0">
                        {/* A. Billing Summary */}
                        <Card>
                            <CardTitle icon={FileText} title="A. Billing Summary" />
                            <div className="space-y-2.5 text-[12px] mb-4">
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Discount Amount</span><span className="font-medium text-gray-900 text-red-600">- {formatPrice(order.discount_amount)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Shipping Cost</span><span className="font-medium text-gray-900">{formatPrice(order.shipping_cost)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Service Fee</span><span className="font-medium text-gray-900">{formatPrice(order.service_fee)}</span></div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-y border-gray-100 mb-4">
                                <span className="text-[14px] font-semibold text-gray-900">Grand Total</span>
                                <span className="text-[18px] font-bold text-gray-900">{formatPrice(order.grand_total)}</span>
                            </div>
                            <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between"><span className="text-gray-500">Voucher Code</span><span className="font-semibold text-gray-900">{order.voucher_code || '-'}</span></div>
                            </div>
                        </Card>

                        {/* B. Status Summary */}
                        <Card>
                            <CardTitle icon={CheckCircle2} title="B. Status Summary" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><CreditCard size={14}/> Payment</span>{getStatusBadge(order.payment_status)}</div>
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><Box size={14}/> Order</span>{getStatusBadge(order.order_status)}</div>
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><Truck size={14}/> Shipping</span>{getStatusBadge(order.shipping_status)}</div>
                            </div>
                        </Card>

                        {/* C. Quick Actions */}
                        <Card>
                            <CardTitle icon={Edit3} title="C. Quick Actions" />
                            <div className="flex flex-col text-[12px] font-medium text-gray-700">
                                <button onClick={() => window.print()} className="flex justify-between items-center py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                                    <span className="flex items-center gap-2"><Printer size={14} className="text-gray-400" /> Print Invoice</span>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </button>
                                <a href={`mailto:${order.customer_email}`} className="flex justify-between items-center py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                                    <span className="flex items-center gap-2"><MessageCircle size={14} className="text-gray-400" /> Contact Customer</span>
                                    <ChevronRight size={14} className="text-gray-300" />
                                </a>
                                {order.shipment && (
                                    <Link href={`/admin/shipments/${order.shipment.id}`} className="flex justify-between items-center py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                                        <span className="flex items-center gap-2"><ExternalLink size={14} className="text-gray-400" /> View Shipment</span>
                                        <ChevronRight size={14} className="text-gray-300" />
                                    </Link>
                                )}
                                <button onClick={() => updateStatus('cancelled')} className="flex justify-between items-center py-2.5 border-b border-gray-100 hover:bg-red-50 px-2 -mx-2 rounded transition-colors text-red-600">
                                    <span className="flex items-center gap-2"><XCircle size={14} className="text-red-400" /> Cancel Order</span>
                                    <ChevronRight size={14} className="text-red-300" />
                                </button>
                                <button onClick={() => updateStatus('completed')} className="flex justify-between items-center py-2.5 hover:bg-green-50 px-2 -mx-2 rounded transition-colors text-green-600">
                                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Mark as Completed</span>
                                    <ChevronRight size={14} className="text-green-300" />
                                </button>
                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
}
