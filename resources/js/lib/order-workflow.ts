export type ShippingIssue = {
    status: string;
    label: string;
    description: string | null;
    reason?: string | null;
    is_terminal: boolean;
};

type WorkflowOrder = {
    payment_status: string;
    order_status: string;
    shipping_status: string;
    paid_at?: string | null;
    completed_at?: string | null;
    booking_uncertain?: boolean;
    shipping_issue?: ShippingIssue | null;
    shipment?: {
        shipping_status?: string | null;
        shipped_at?: string | null;
        delivered_at?: string | null;
    } | null;
    status_history?: { status: string | null }[];
};

export function getOrderWorkflow(order: WorkflowOrder) {
    const paid =
        Boolean(order.paid_at) ||
        ['paid', 'refunded', 'partially_refunded'].includes(
            order.payment_status,
        );
    const delivered =
        Boolean(order.shipment?.delivered_at) ||
        (order.shipping_status === 'delivered' &&
            (!order.shipment ||
                order.shipment.shipping_status === 'delivered'));
    const stages: Record<string, number> = {
        paid: 1,
        processing: 2,
        ready_to_ship: 3,
        shipped: 4,
        picked: 4,
        in_transit: 4,
        delivered: 5,
        completed: 6,
    };
    const evidence = [
        order.order_status,
        order.shipping_status,
        order.shipment?.shipping_status,
        ...(order.status_history ?? []).map((entry) => entry.status),
    ];
    let currentStep = paid ? 1 : 0;

    for (const status of evidence) {
        const stage = stages[status ?? ''] ?? 0;

        if (
            paid &&
            (stage < 5 || delivered) &&
            (stage < 6 ||
                order.completed_at ||
                order.order_status === 'completed')
        ) {
            currentStep = Math.max(currentStep, stage);
        }
    }

    if (paid && order.shipment?.shipped_at) {
        currentStep = Math.max(currentStep, 4);
    }

    if (paid && delivered) {
        currentStep = Math.max(currentStep, 5);
    }

    if (paid && delivered && order.completed_at) {
        currentStep = 6;
    }

    const paymentIssues: Record<string, string> = {
        manual_review:
            'Pembayaran memerlukan pemeriksaan. Jangan lanjutkan fulfillment sebelum terverifikasi.',
        failed: 'Pembayaran gagal.',
        expired: 'Pembayaran kedaluwarsa.',
        cancelled: 'Pembayaran dibatalkan.',
        refunded: 'Pembayaran telah direfund.',
        partially_refunded: 'Pembayaran telah direfund sebagian.',
    };
    const issue =
        paymentIssues[order.payment_status] ??
        (order.order_status === 'cancelled' ? 'Pesanan dibatalkan.' : null) ??
        (order.order_status === 'shipment_failed'
            ? 'Pesanan ditandai gagal dikirim.'
            : null) ??
        order.shipping_issue?.description ??
        order.shipping_issue?.label ??
        (order.booking_uncertain
            ? 'Hasil booking belum dapat dipastikan. Periksa Biteship sebelum mencoba kembali.'
            : null) ??
        (order.order_status === 'completed' && (!paid || !delivered)
            ? 'Penyelesaian pesanan belum didukung pembayaran dan pengiriman terkonfirmasi.'
            : null);

    return {
        currentStep,
        completed:
            order.order_status === 'completed' && paid && delivered && !issue,
        issue,
    };
}
