import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MapPin, ReceiptText, Truck, UserRound, WalletCards } from 'lucide-react';
import type { ComponentType, CSSProperties } from 'react';

export type PaymentProofOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    created_at: string | null;
    created_date: string | null;
    created_time: string | null;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    grand_total: number;
    paid_at: string | null;
    items: Array<{
        id: number;
        product_name: string;
        color_name: string | null;
        size: string | null;
        price: number;
        quantity: number;
        subtotal: number;
        product_image_url: string | null;
    }>;
    address: {
        recipient_name: string;
        recipient_phone: string;
        province: string;
        city: string;
        district: string;
        postal_code: string;
        full_address: string;
    } | null;
    payment: {
        payment_method: string | null;
        paid_at: string | null;
    } | null;
    shipment: {
        courier_company: string | null;
        courier_type: string | null;
        courier_service_name: string | null;
    } | null;
};

type IconComponent = ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
}>;

type DocumentProps = {
    fallbackImage: string;
    order: PaymentProofOrder;
};

const ink = '#201714';
const muted = '#5f5752';
const line = '#ded8d3';

const formatPrice = (amount: number) =>
    `Rp${new Intl.NumberFormat('id-ID').format(amount)}`;

const formatInvoiceDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
};

const formatPaymentDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return `${new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value))}, ${new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value))} WIB`;
};

export const invoiceNumber = (order: PaymentProofOrder) => {
    const source = order.paid_at ?? order.payment?.paid_at ?? order.created_at;
    const date = source
        ? new Intl.DateTimeFormat('en-CA', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
              .format(new Date(source))
              .replaceAll('-', '')
        : String(order.id).padStart(8, '0');

    return `INV-${date}-${String(order.id).padStart(3, '0')}`;
};

const courierName = (order: PaymentProofOrder) =>
    [
        order.shipment?.courier_company?.toUpperCase(),
        order.shipment?.courier_service_name ?? order.shipment?.courier_type,
    ]
        .filter(Boolean)
        .join(' ') || '-';

const itemVariant = (item: PaymentProofOrder['items'][number]) =>
    [item.color_name, item.size].filter(Boolean).join(' / ') || '-';

const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.querySelectorAll('img'));

    await Promise.all(
        images.map(
            (image) =>
                new Promise<void>((resolve) => {
                    if (image.complete) {
                        resolve();

                        return;
                    }

                    image.onload = () => resolve();
                    image.onerror = () => resolve();
                }),
        ),
    );
};

export async function downloadPaymentProofPdf(
    element: HTMLElement,
    order: PaymentProofOrder,
) {
    await waitForImages(element);

    const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        onclone: (documentClone) => {
            documentClone.documentElement.style.backgroundColor = '#ffffff';
            documentClone.documentElement.style.color = ink;
            documentClone.body.style.backgroundColor = '#ffffff';
            documentClone.body.style.color = ink;
        },
        scale: 2,
        useCORS: true,
    });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const offsetY = Math.max(0, (pageHeight - imageHeight) / 2);

    pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        offsetY,
        imageWidth,
        Math.min(imageHeight, pageHeight),
    );
    pdf.save(`invoice-${order.order_number}.pdf`);
}

export function PaymentProofInvoiceDocument({
    fallbackImage,
    order,
}: DocumentProps) {
    const paidAt = order.paid_at ?? order.payment?.paid_at ?? order.created_at;
    const address = order.address;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.brand}>Shayda Modest</div>
                <div style={styles.headerMeta}>
                    <p style={styles.invoiceLabel}>Invoice</p>
                    <p style={styles.invoiceNumber}>{invoiceNumber(order)}</p>
                    <p style={styles.invoiceDate}>{formatInvoiceDate(paidAt)}</p>
                </div>
            </div>

            <div style={styles.metaGrid}>
                <InvoiceMeta
                    icon={ReceiptText}
                    label="Order ID"
                    value={order.order_number}
                />
                <InvoiceMeta
                    icon={WalletCards}
                    label="Metode Pembayaran"
                    value={order.payment?.payment_method ?? '-'}
                />
                <InvoiceMeta
                    last
                    icon={ReceiptText}
                    label="Tanggal Pembayaran"
                    value={formatPaymentDate(paidAt)}
                />
            </div>

            <div style={styles.infoGrid}>
                <section>
                    <h3 style={styles.sectionTitle}>Informasi Pelanggan</h3>
                    <InfoRow icon={UserRound} value={order.customer_name} />
                    <InfoRow icon={WalletCards} value={order.customer_phone} />
                    <InfoRow icon={ReceiptText} value={order.customer_email} />
                </section>
                <section>
                    <h3 style={styles.sectionTitle}>Informasi Pengiriman</h3>
                    <InfoRow
                        icon={MapPin}
                        value={
                            address
                                ? `${address.full_address}, ${address.city}, ${address.province}, ${address.postal_code}`
                                : '-'
                        }
                    />
                    <InfoRow icon={Truck} value={`Kurir\n${courierName(order)}`} />
                </section>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHead}>
                        <th style={{ ...styles.th, width: 96 }} />
                        <th style={styles.th}>Produk</th>
                        <th style={styles.th}>Varian</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Qty</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Harga</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item) => (
                        <tr key={item.id} style={styles.tr}>
                            <td style={styles.td}>
                                <img
                                    alt={item.product_name}
                                    crossOrigin="anonymous"
                                    src={item.product_image_url ?? fallbackImage}
                                    style={styles.productImage}
                                />
                            </td>
                            <td style={{ ...styles.td, fontWeight: 500 }}>
                                {item.product_name}
                            </td>
                            <td style={styles.td}>{itemVariant(item)}</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                {item.quantity}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                {formatPrice(item.price)}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                {formatPrice(item.subtotal)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={styles.totalBox}>
                <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} />
                <TotalRow
                    label="Ongkos Kirim"
                    value={formatPrice(order.shipping_cost)}
                />
                {order.discount_amount > 0 && (
                    <TotalRow
                        danger
                        label="Diskon"
                        value={`-${formatPrice(order.discount_amount)}`}
                    />
                )}
                <div style={styles.grandTotal}>
                    <span>Total Pembayaran</span>
                    <span>{formatPrice(order.grand_total)}</span>
                </div>
            </div>

            <div style={styles.footer}>
                <p style={styles.footerText}>
                    Invoice ini diterbitkan secara otomatis oleh sistem dan sah
                    sebagai bukti pembayaran.
                </p>
            </div>
        </div>
    );
}

function InvoiceMeta({
    icon: Icon,
    label,
    last = false,
    value,
}: {
    icon: IconComponent;
    label: string;
    last?: boolean;
    value: string;
}) {
    return (
        <div style={{ ...styles.metaItem, borderRight: last ? 'none' : `1px solid ${line}` }}>
            <Icon size={24} strokeWidth={1.4} style={styles.metaIcon} />
            <div>
                <p style={styles.metaLabel}>{label}</p>
                <p style={styles.metaValue}>{value}</p>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, value }: { icon: IconComponent; value: string }) {
    return (
        <div style={styles.infoRow}>
            <Icon size={17} strokeWidth={1.5} style={styles.infoIcon} />
            <span>{value}</span>
        </div>
    );
}

function TotalRow({
    danger = false,
    label,
    value,
}: {
    danger?: boolean;
    label: string;
    value: string;
}) {
    return (
        <div style={{ ...styles.totalRow, color: danger ? '#b84a43' : ink }}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

const styles = {
    page: {
        width: 1000,
        backgroundColor: '#ffffff',
        color: ink,
        padding: '20px 20px 16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
    },
    header: {
        alignItems: 'flex-start',
        borderBottom: `1px solid ${line}`,
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: 32,
    },
    brand: {
        color: '#312119',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontSize: 36,
        lineHeight: 1,
    },
    headerMeta: {
        textAlign: 'right',
    },
    invoiceLabel: {
        color: '#7b5a45',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 2,
        margin: 0,
        textTransform: 'uppercase',
    },
    invoiceNumber: {
        color: '#100f0d',
        fontSize: 17,
        fontWeight: 800,
        margin: '4px 0 0',
    },
    invoiceDate: {
        color: '#4b433f',
        fontSize: 12,
        margin: '4px 0 0',
    },
    metaGrid: {
        borderBottom: `1px solid ${line}`,
        display: 'grid',
        gap: 28,
        gridTemplateColumns: '1fr 1fr 1.35fr',
        padding: '24px 0',
    },
    metaItem: {
        display: 'flex',
        gap: 16,
    },
    metaIcon: {
        color: '#3c3632',
        flexShrink: 0,
        marginTop: 4,
    },
    metaLabel: {
        color: '#3f332d',
        fontSize: 11,
        margin: 0,
    },
    metaValue: {
        fontSize: 13,
        fontWeight: 700,
        margin: '4px 0 0',
        whiteSpace: 'pre-line',
    },
    infoGrid: {
        borderBottom: `1px solid ${line}`,
        display: 'grid',
        gap: 32,
        gridTemplateColumns: '1fr 1fr',
        padding: '20px 0',
    },
    sectionTitle: {
        color: '#8a6f5f',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        margin: '0 0 16px',
        textTransform: 'uppercase',
    },
    infoRow: {
        display: 'flex',
        fontSize: 13,
        gap: 12,
        marginBottom: 12,
        whiteSpace: 'pre-line',
    },
    infoIcon: {
        color: '#3c3632',
        flexShrink: 0,
        marginTop: 2,
    },
    table: {
        borderCollapse: 'collapse',
        marginTop: 20,
        width: '100%',
    },
    tableHead: {
        backgroundColor: '#f1ebe8',
        color: '#6c5144',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.5,
        textAlign: 'left',
        textTransform: 'uppercase',
    },
    th: {
        padding: '8px 16px',
    },
    tr: {
        borderBottom: '1px solid #e3ded9',
        fontSize: 13,
    },
    td: {
        padding: '12px 16px',
    },
    productImage: {
        borderRadius: 3,
        height: 64,
        objectFit: 'cover',
        objectPosition: 'top',
        width: 80,
    },
    totalBox: {
        marginLeft: 'auto',
        paddingTop: 16,
        width: 430,
    },
    totalRow: {
        alignItems: 'center',
        display: 'flex',
        fontSize: 13,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    grandTotal: {
        alignItems: 'center',
        borderTop: '1px solid #d8d0ca',
        display: 'flex',
        fontSize: 18,
        fontWeight: 800,
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 16,
    },
    footer: {
        alignItems: 'flex-end',
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    footerText: {
        color: muted,
        fontSize: 10,
        margin: 0,
    },
} satisfies Record<string, CSSProperties>;
