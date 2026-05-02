import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ArrowLeft, Printer, MessageCircle, ChevronDown, 
    FileText, Edit3, Box, User, MapPin, CreditCard, Truck, 
    Clock, StickyNote, Code, ShieldCheck, Mail, Map, 
    Copy, ExternalLink, ChevronRight, CheckCircle2, Circle,
    Check, XCircle, Search
} from 'lucide-react';

// Reusable Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.03)] p-5 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ icon: Icon, title, rightElement }: { icon: any, title: React.ReactNode, rightElement?: React.ReactNode }) => (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
            <Icon size={16} className="text-gray-400" />
            {title}
        </div>
        {rightElement}
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

const Accordion = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors mt-2">
        <div className="flex items-center gap-2">
            <Code size={14} className="text-gray-400" />
            {title}
        </div>
        <ChevronDown size={14} className="text-gray-400" />
    </div>
);

export default function AdminOrderDetail() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard', url: '/admin/dashboard' },
            { title: 'Orders', href: '/admin/orders', url: '/admin/orders' },
            { title: 'Order Detail', href: '#', url: '#' }
        ]}>
            <Head title="Order Detail - #ORD-2026-00125" />
            
            <div className="max-w-[1600px] mx-auto pb-10">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                            Order Detail
                            <span className="text-[15px] font-bold text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">#ORD-2026-00125</span>
                        </h1>
                        <p className="text-[13px] text-gray-500 mt-1">Review complete order information, payment, shipment, and customer details.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <ArrowLeft size={14} /> Back to Orders
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <Printer size={14} /> Print Invoice
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            <MessageCircle size={14} /> Contact Customer
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-[#3E3222] border border-[#3E3222] rounded-lg shadow-sm hover:bg-[#2A2217] transition-colors text-white">
                            <Edit3 size={14} /> Update Status <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                            More Actions <ChevronDown size={14} />
                        </button>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <DetailRow label="Order Number" value="#ORD-2026-00125" labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Name" value="Siti Aisyah" labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Email" value="siti.aisyah@email.com" labelWidth="w-[90px]" />
                                        <DetailRow label="Customer Phone" value="+62 812-3456-7890" labelWidth="w-[90px]" />
                                    </div>
                                    <div>
                                        <DetailRow label="Created At" value="28 Apr 2026, 10:15" labelWidth="w-[75px]" />
                                        <DetailRow label="Paid At" value="28 Apr 2026, 10:24" labelWidth="w-[75px]" />
                                        <DetailRow label="Completed At" value="—" labelWidth="w-[75px]" valueClass="text-gray-400" />
                                        <DetailRow label="Cancelled At" value="—" labelWidth="w-[75px]" valueClass="text-gray-400" />
                                        <DetailRow label="Expired At" value="—" labelWidth="w-[75px]" valueClass="text-gray-400" />
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-[11px] text-gray-500 mb-1 font-medium flex items-center gap-1"><StickyNote size={12}/> Order Notes</p>
                                    <p className="text-[12px] text-gray-800">Please pack carefully and call before delivery.</p>
                                </div>
                            </Card>

                            {/* 2. Order Status Management */}
                            <Card className="lg:col-span-7">
                                <CardTitle icon={Edit3} title="Order Status Management" rightElement={
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8C6B4A]">
                                            <ShieldCheck size={14} /> No Return / Refund Agreed
                                        </div>
                                        <p className="text-[10px] text-gray-500">Agreed At 28 Apr 2026, 10:16</p>
                                    </div>
                                } />
                                
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Payment Status</label>
                                        <div className="relative">
                                            <select className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3 appearance-none bg-white font-medium text-gray-800">
                                                <option>Paid</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Order Status</label>
                                        <div className="relative">
                                            <select className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3 appearance-none bg-white font-medium text-gray-800">
                                                <option>Shipped</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-gray-500 mb-1">Shipping Status</label>
                                        <div className="relative">
                                            <select className="w-full text-[12px] border border-gray-200 rounded-lg py-1.5 px-3 appearance-none bg-white font-medium text-gray-800">
                                                <option>Shipped</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] text-gray-500 mb-1">Admin Note</label>
                                    <div className="flex gap-2">
                                        <input type="text" value="Status updated: Order has been shipped via JNE Regular." readOnly className="flex-1 text-[12px] border border-gray-200 rounded-lg py-1.5 px-3 bg-gray-50 text-gray-800" />
                                        <button className="bg-[#3E3222] text-white text-[12px] font-medium px-4 py-1.5 rounded-lg hover:bg-[#2A2217] transition-colors whitespace-nowrap">
                                            Save Status Update
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>

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
                                            <th className="py-2.5 px-4 font-medium text-right">Weight</th>
                                            <th className="py-2.5 px-4 font-medium">Dimensions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            { id: 1, name: 'Najran Piping Lace Abaya', pSku: 'ABY-NJRN-001', vSku: 'ABY-NJRN-001-OW-M', color: 'Off White', size: 'M', price: 'Rp 399.000', qty: 2, subtotal: 'Rp 798.000', weight: '500 g', dim: '30×25×5 cm', img: '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp' },
                                            { id: 2, name: 'Kufrah Khimar', pSku: 'KHM-KUFA-002', vSku: 'KHM-KUFA-002-OW-STD', color: 'Off White', size: 'Standard', price: 'Rp 349.000', qty: 1, subtotal: 'Rp 349.000', weight: '250 g', dim: '22×18×4 cm', img: '/img/ike-ellyana-2F70bGqQVa4-unsplash.webp' },
                                            { id: 3, name: 'Sila Scarf', pSku: 'SCF-SILA-003', vSku: 'SCF-SILA-003-BW-STD', color: 'Broken White', size: 'Standard', price: 'Rp 244.300', qty: 1, subtotal: 'Rp 244.300', weight: '120 g', dim: '18×15×2 cm', img: '/img/hasan-almasi-_X2UAmIcpko-unsplash.webp' },
                                        ].map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 text-center text-gray-500">{item.id}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                            <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">{item.pSku}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.vSku}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.color}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.size}</td>
                                                <td className="py-3 px-4 text-gray-900 text-right">{item.price}</td>
                                                <td className="py-3 px-4 text-gray-900 text-center">{item.qty}</td>
                                                <td className="py-3 px-4 text-gray-900 font-medium text-right">{item.subtotal}</td>
                                                <td className="py-3 px-4 text-gray-600 text-right">{item.weight}</td>
                                                <td className="py-3 px-4 text-gray-600">{item.dim}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-[#F8F9FA] px-4 py-3 flex justify-between items-center text-[12px] text-gray-600 border-t border-gray-200">
                                <div>Total Items: <span className="font-semibold text-gray-900">3</span></div>
                                <div className="flex gap-8">
                                    <div>Total Quantity: <span className="font-semibold text-gray-900">4</span></div>
                                    <div>Total Weight: <span className="font-semibold text-gray-900">870 g</span></div>
                                </div>
                            </div>
                        </Card>

                        {/* Row 4: Customer & Shipping */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 4. Customer Information */}
                            <Card>
                                <CardTitle icon={User} title="4. Customer Information" />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <DetailRow label="Customer Name" value="Siti Aisyah" />
                                        <DetailRow label="Customer Email" value="siti.aisyah@email.com" />
                                        <DetailRow label="Customer Phone" value="+62 812-3456-7890" />
                                        <DetailRow label="User ID" value="1042" />
                                        <DetailRow label="Customer Address ID" value="ADR-2026-092" />
                                    </div>
                                    <div className="w-[180px] space-y-2 flex-shrink-0">
                                        <button className="w-full flex items-center gap-2 justify-center px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                                            <User size={14}/> View Customer Profile
                                        </button>
                                        <button className="w-full flex items-center gap-2 justify-center px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                                            <Mail size={14}/> Contact via Email
                                        </button>
                                        <button className="w-full flex items-center gap-2 justify-center px-3 py-1.5 text-[11px] font-medium border border-[#25D366]/30 bg-[#25D366]/5 rounded-lg text-[#128C7E] hover:bg-[#25D366]/10">
                                            <MessageCircle size={14}/> Contact via WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </Card>

                            {/* 5. Shipping Address */}
                            <Card>
                                <CardTitle icon={MapPin} title="5. Shipping Address" rightElement={
                                    <button className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-700">
                                        <Map size={12} /> Open Map
                                    </button>
                                } />
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <DetailRow label="Recipient Name" value="Siti Aisyah" labelWidth="w-[110px]" />
                                        <DetailRow label="Recipient Phone" value="+62 812-3456-7890" labelWidth="w-[110px]" />
                                        <DetailRow label="Province" value="Jawa Timur" labelWidth="w-[110px]" />
                                        <DetailRow label="City" value="Surabaya" labelWidth="w-[110px]" />
                                        <DetailRow label="District" value="Wonokromo" labelWidth="w-[110px]" />
                                        <DetailRow label="Subdistrict" value="Darmo" labelWidth="w-[110px]" />
                                        <DetailRow label="Postal Code" value="60241" labelWidth="w-[110px]" />
                                    </div>
                                    <div className="flex-1">
                                        <DetailRow label="Biteship Area ID" value="BTS-AREA-00988" labelWidth="w-[100px]" />
                                        <DetailRow label="Full Address" value="Jl. Raya Maslinah No. 25, Darmo, Wonokromo, Surabaya, East Java, Indonesia" labelWidth="w-[100px]" valueClass="text-gray-900 font-medium leading-tight" />
                                        <DetailRow label="Address Note" value="Near Al-Falah Mosque, ring the bell at front gate" labelWidth="w-[100px]" valueClass="text-gray-900 font-medium leading-tight" />
                                        <DetailRow label="Latitude" value="-7.2912" labelWidth="w-[100px]" />
                                        <DetailRow label="Longitude" value="112.7348" labelWidth="w-[100px]" />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Row 5: Payment & Shipment Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 6. Payment Information */}
                            <Card>
                                <CardTitle icon={CreditCard} title="6. Payment Information" />
                                <div className="flex gap-1.5 mb-4 border-b border-gray-100 pb-3 overflow-x-auto hide-scrollbar">
                                    <Badge variant="outline">Pending</Badge>
                                    <Badge variant="green">Settlement</Badge>
                                    <Badge variant="outline">Capture</Badge>
                                    <Badge variant="outline">Expired</Badge>
                                    <Badge variant="outline">Cancelled</Badge>
                                    <Badge variant="outline">Failed</Badge>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <DetailRow label="Payment Provider" value="Midtrans" labelWidth="w-[130px]" />
                                        <DetailRow label="Payment Method" value="Virtual Account" labelWidth="w-[130px]" />
                                        <DetailRow label="Midtrans Order ID" value="ORD-2026-00125-MT" labelWidth="w-[130px]" />
                                        <DetailRow label="Midtrans Transaction ID" value="TXN-20260428-88124" labelWidth="w-[130px]" />
                                        <DetailRow label="Transaction Status" value={<Badge variant="green">Settlement</Badge>} labelWidth="w-[130px]" />
                                        <DetailRow label="Fraud Status" value="Accept" labelWidth="w-[130px]" />
                                    </div>
                                    <div className="flex-1">
                                        <DetailRow label="Gross Amount" value="Rp 1.428.300" labelWidth="w-[90px]" />
                                        <DetailRow label="Currency" value="IDR" labelWidth="w-[90px]" />
                                        <DetailRow label="Paid At" value="28 Apr 2026, 10:24" labelWidth="w-[90px]" />
                                        <DetailRow label="Expired At" value="29 Apr 2026, 10:24" labelWidth="w-[90px]" />
                                        <DetailRow label="Snap Token" value="1a2d*****************" labelWidth="w-[90px]" />
                                        <DetailRow label="Redirect URL" value={<a href="#" className="text-blue-600 hover:underline">https://app.midtrans.com/snap/v2/vtweb/*****</a>} labelWidth="w-[90px]" />
                                    </div>
                                </div>
                                <div className="mt-2 pt-2">
                                    <Accordion title="Raw Payment Response" />
                                </div>
                            </Card>

                            {/* 7. Shipment Information */}
                            <Card>
                                <CardTitle icon={Truck} title="7. Shipment Information" />
                                <div className="flex gap-2">
                                    <div className="flex-[1.2]">
                                        <DetailRow label="Shipping Provider" value="Biteship" labelWidth="w-[110px]" />
                                        <DetailRow label="Biteship Order ID" value="BSH-ORD-991254" labelWidth="w-[110px]" />
                                        <DetailRow label="Biteship Tracking ID" value="BSH-TRK-220401" labelWidth="w-[110px]" />
                                        <DetailRow label="Waybill ID" value="JNE-02091234567" labelWidth="w-[110px]" />
                                        <DetailRow label="Courier Company" value="JNE" labelWidth="w-[110px]" />
                                        <DetailRow label="Courier Type" value="REG" labelWidth="w-[110px]" />
                                    </div>
                                    <div className="flex-1">
                                        <DetailRow label="Courier Service Name" value="JNE Regular" labelWidth="w-[125px]" />
                                        <DetailRow label="Delivery Type" value="Door to Door" labelWidth="w-[125px]" />
                                        <DetailRow label="Shipping Cost" value="Rp 18.000" labelWidth="w-[125px]" />
                                        <DetailRow label="Insurance Cost" value="Rp 0" labelWidth="w-[125px]" />
                                        <DetailRow label="Estimated Delivery" value="30 Apr - 2 May 2026" labelWidth="w-[125px]" />
                                        <DetailRow label="Shipping Status" value={<Badge variant="blue">Shipped</Badge>} labelWidth="w-[125px]" />
                                    </div>
                                    <div className="flex-1 pl-4 border-l border-gray-100">
                                        <DetailRow label="Shipped At" value="29 Apr 2026, 08:35" labelWidth="w-[80px]" />
                                        <DetailRow label="Delivered At" value="—" labelWidth="w-[80px]" valueClass="text-gray-400" />
                                        <DetailRow label="Cancelled At" value="—" labelWidth="w-[80px]" valueClass="text-gray-400" />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex-1 justify-center">
                                        <MapPin size={12} /> Track Shipment
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex-1 justify-center">
                                        <Copy size={12} /> Copy Tracking ID
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 flex-[1.5] justify-center">
                                        <ExternalLink size={12} /> View Shipment Raw Data
                                    </button>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <div className="flex-1"><Accordion title="Raw Rate Response" /></div>
                                    <div className="flex-1"><Accordion title="Raw Order Response" /></div>
                                </div>
                            </Card>
                        </div>

                        {/* Row 6: Timeline & Notes & Raw */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* 8. Tracking Timeline */}
                            <Card className="flex flex-col h-full">
                                <CardTitle icon={Clock} title="8. Tracking Timeline" />
                                <div className="flex justify-between items-start mt-2 relative w-full overflow-x-auto hide-scrollbar pb-4 flex-1">
                                    <div className="absolute top-[8px] left-[20px] right-[20px] h-[2px] bg-gray-200 -z-10"></div>
                                    <div className="absolute top-[8px] left-[20px] w-[75%] h-[2px] bg-[#3E3222] -z-10"></div>
                                    
                                    {[
                                        { status: 'Order Picked Up', loc: 'Surabaya Warehouse', date: '29 Apr 2026, 08:35', state: 'done' },
                                        { status: 'In Transit', loc: 'Surabaya Sorting Center', date: '29 Apr 2026, 12:20', state: 'done' },
                                        { status: 'Arrived at Sorting Center', loc: 'Sidoarjo Hub', date: '29 Apr 2026, 10:05', state: 'done' },
                                        { status: 'Out for Delivery', loc: 'Surabaya Route', date: '30 Apr 2026, 08:10', state: 'active' },
                                        { status: 'Delivered', loc: '—', date: '—', state: 'pending' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center text-center w-20 flex-shrink-0">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center mb-2 
                                                ${step.state === 'done' ? 'bg-[#3E3222] text-white' : 
                                                  step.state === 'active' ? 'bg-white border-[3px] border-[#3E3222]' : 
                                                  'bg-white border-2 border-gray-200'}`}>
                                                {step.state === 'done' && <Check size={10} strokeWidth={3} />}
                                            </div>
                                            <p className={`text-[10px] leading-tight font-bold ${step.state === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{step.status}</p>
                                            <p className={`text-[9px] leading-tight mt-1 ${step.state === 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>{step.loc}</p>
                                            <p className={`text-[9px] leading-tight mt-1 ${step.state === 'pending' ? 'text-gray-300' : 'text-gray-500 font-medium'}`}>{step.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="flex flex-col gap-5">
                                {/* 9. Internal Notes */}
                                <Card>
                                    <CardTitle icon={User} title="9. Internal Notes" />
                                    <div className="space-y-4 mb-4">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src="/img/hasan-almasi-_X2UAmIcpko-unsplash.webp" className="w-full h-full object-cover" /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-800">Admin Hana <span className="text-gray-400 font-normal ml-2">28 Apr 2026, 10:40</span></p>
                                                <p className="text-[12px] text-gray-600 mt-0.5 bg-gray-50 p-2 rounded-r-lg rounded-bl-lg">Customer requested careful packaging for gift purposes.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src="/img/ike-ellyana-2F70bGqQVa4-unsplash.webp" className="w-full h-full object-cover" /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-800">Admin Siti <span className="text-gray-400 font-normal ml-2">29 Apr 2026, 08:40</span></p>
                                                <p className="text-[12px] text-gray-600 mt-0.5 bg-gray-50 p-2 rounded-r-lg rounded-bl-lg">Shipment created successfully in Biteship.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Add internal note..." className="flex-1 text-[12px] border border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-[#3E3222]" />
                                        <button className="bg-[#3E3222] text-white text-[12px] font-medium px-4 rounded-lg hover:bg-[#2A2217] transition-colors">Save Note</button>
                                    </div>
                                </Card>

                                {/* 10. Raw Data */}
                                <Card>
                                    <CardTitle icon={Code} title="10. Raw Data / Technical Data" />
                                    <div className="space-y-2">
                                        <Accordion title="Raw Order Data" />
                                        <Accordion title="Raw Shipment Data" />
                                        <Accordion title="Raw Midtrans Data" />
                                        <Accordion title="Raw Biteship Data" />
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
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">Rp 1.391.300</span></div>
                                <div className="flex justify-between text-gray-600"><span>Discount Amount</span><span className="font-medium text-gray-900">Rp 0</span></div>
                                <div className="flex justify-between text-gray-600"><span>Shipping Cost</span><span className="font-medium text-gray-900">Rp 18.000</span></div>
                                <div className="flex justify-between text-gray-600"><span>Service Fee</span><span className="font-medium text-gray-900">Rp 19.000</span></div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-y border-gray-100 mb-4">
                                <span className="text-[14px] font-semibold text-gray-900">Grand Total</span>
                                <span className="text-[18px] font-bold text-gray-900">Rp 1.428.300</span>
                            </div>
                            <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between"><span className="text-gray-500">Voucher Code</span><span className="font-semibold text-gray-900">WELCOME10</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Voucher ID</span><span className="text-gray-900">VCR-00102</span></div>
                            </div>
                        </Card>

                        {/* B. Status Summary */}
                        <Card>
                            <CardTitle icon={CheckCircle2} title="B. Status Summary" />
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><CreditCard size={14}/> Payment</span><Badge variant="green">Paid</Badge></div>
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><Box size={14}/> Order</span><Badge variant="blue">Shipped</Badge></div>
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><Truck size={14}/> Shipping</span><Badge variant="blue">Shipped</Badge></div>
                                <div className="flex justify-between items-center text-[12px]"><span className="flex items-center gap-2 text-gray-600"><ShieldCheck size={14}/> Policy Agreement</span><Badge variant="green">Yes</Badge></div>
                            </div>
                        </Card>

                        {/* C. Quick Actions */}
                        <Card>
                            <CardTitle icon={Edit3} title="C. Quick Actions" />
                            <div className="flex flex-col text-[12px] font-medium text-gray-700">
                                {[
                                    { label: 'Edit Order Status', icon: Edit3 },
                                    { label: 'Print Invoice', icon: Printer },
                                    // { label: 'Download Receipt', icon: Download },
                                    { label: 'Contact Customer', icon: MessageCircle },
                                    { label: 'Open Shipment Tracker', icon: ExternalLink },
                                    { label: 'View Customer Profile', icon: User },
                                ].map((item, i) => (
                                    <button key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0 hover:text-[#3E3222] hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                                        <span className="flex items-center gap-2"><item.icon size={14} className="text-gray-400" /> {item.label}</span>
                                        <ChevronRight size={14} className="text-gray-300" />
                                    </button>
                                ))}
                                <button className="flex justify-between items-center py-2.5 border-b border-gray-100 hover:bg-red-50 px-2 -mx-2 rounded transition-colors text-red-600">
                                    <span className="flex items-center gap-2"><XCircle size={14} className="text-red-400" /> Cancel Order</span>
                                    <ChevronRight size={14} className="text-red-300" />
                                </button>
                                <button className="flex justify-between items-center py-2.5 hover:bg-green-50 px-2 -mx-2 rounded transition-colors text-green-600">
                                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Mark as Completed</span>
                                    <ChevronRight size={14} className="text-green-300" />
                                </button>
                            </div>
                        </Card>

                        {/* D. Shipment Status */}
                        <Card>
                            <CardTitle icon={Truck} title="D. Shipment Status" />
                            <p className="text-[12px] text-gray-800 font-medium mb-4">Shipment is on the way to customer.</p>
                            
                            <div className="flex justify-between items-center relative mb-6">
                                <div className="absolute top-1/2 -translate-y-1/2 left-[10%] right-[10%] h-0.5 bg-gray-200 -z-10"></div>
                                <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-[55%] h-0.5 bg-[#3E3222] -z-10"></div>
                                
                                <div className="flex flex-col items-center gap-1 w-12"><div className="w-4 h-4 rounded-full bg-[#3E3222] text-white flex items-center justify-center"><Check size={10} strokeWidth={3}/></div><span className="text-[9px] text-center font-bold text-gray-800">Picked Up</span></div>
                                <div className="flex flex-col items-center gap-1 w-12"><div className="w-4 h-4 rounded-full bg-[#3E3222] text-white flex items-center justify-center"><Check size={10} strokeWidth={3}/></div><span className="text-[9px] text-center font-bold text-gray-800">In Transit</span></div>
                                <div className="flex flex-col items-center gap-1 w-12"><div className="w-4 h-4 rounded-full bg-white border-[3px] border-[#3E3222] flex items-center justify-center"></div><span className="text-[9px] text-center font-bold text-gray-800">Out for Delivery</span></div>
                                <div className="flex flex-col items-center gap-1 w-12"><div className="w-4 h-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center"></div><span className="text-[9px] text-center text-gray-400">Delivered</span></div>
                            </div>

                            <div className="space-y-2.5">
                                {[
                                    'Payment successful',
                                    'Shipment is active',
                                    'No return/refund policy agreed',
                                    'Raw shipment data available'
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                                        <div className="w-3 h-3 rounded-full bg-[#ECFDF5] flex items-center justify-center border border-[#D1FAE5]">
                                            <Check size={8} className="text-[#059669]" strokeWidth={3} />
                                        </div>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
