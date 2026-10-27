import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import {
    placeOrder as placeOrderRoute,
    shippingRate,
    shippingRates,
} from '@/routes/checkout';
import {
    apply as applyVoucherRoute,
    remove as removeVoucherRoute,
} from '@/routes/checkout/voucher';

export type CheckoutItem = {
    id: number;
    title: string;
    sku: string | null;
    variant_sku: string | null;
    color: string | null;
    size: string | null;
    image: string | null;
    price: number;
    quantity: number;
    available_stock: number;
    weight: number;
    subtotal: number;
    is_available: boolean;
};

export type CheckoutAddress = {
    id: number;
    label: string | null;
    recipient_name: string;
    recipient_phone: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string | null;
    postal_code: string;
    biteship_area_id: string | null;
    latitude: string | null;
    longitude: string | null;
    full_address: string;
    note: string | null;
    is_default: boolean;
};

export type ShippingRate = {
    id: string;
    courier_company: string;
    courier_type: string;
    courier_service_name: string | null;
    description: string | null;
    duration: string | null;
    price: number;
};

export type Voucher = {
    code: string;
    name: string;
    discount: number;
} | null;

export type CheckoutSummary = {
    item_count: number;
    subtotal: number;
    shipping: number;
    discount: number;
    service_fee: number;
    rounding_adjustment?: number;
    total: number;
};

export type CheckoutStoreLocation = {
    latitude: string | null;
    longitude: string | null;
};

export type PaymentGateway = {
    provider: 'midtrans';
    methods: { id: string; label: string; group: string }[];
};

type CheckoutContextValue = {
    addresses: CheckoutAddress[];
    appliedVoucher: Voucher;
    applyVoucher: (code: string) => Promise<void>;
    cartItems: CheckoutItem[];
    paymentGateway: PaymentGateway;
    errors: Record<string, string>;
    loadShippingRates: (
        addressId: number,
        options?: { preserveSelectedRate?: boolean },
    ) => Promise<void>;
    placeOrder: (
        notes: string,
        agreed: boolean,
        paymentMethod: string | null,
    ) => Promise<string | null>;
    placingOrder: boolean;
    removeVoucher: () => Promise<void>;
    selectAddress: (addressId: number) => Promise<void>;
    selectShippingRate: (rate: ShippingRate) => Promise<void>;
    selectedAddressId: number | null;
    selectedShippingRate: ShippingRate | null;
    shippingRates: ShippingRate[];
    shippingRatesLoading: boolean;
    storeLocation: CheckoutStoreLocation;
    summary: CheckoutSummary;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

function checkoutIdempotencyKey() {
    const storageKey = 'checkout.idempotency_key';
    const existing = window.sessionStorage.getItem(storageKey);

    if (existing) {
        return existing;
    }

    const generated =
        window.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(storageKey, generated);

    return generated;
}

function csrfHeaders() {
    const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}),
    };
}

async function jsonRequest(
    url: string,
    method: string,
    body?: Record<string, unknown>,
) {
    const response = await fetch(url, {
        method,
        headers: csrfHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errors = payload.errors ?? {
            checkout: payload.message ?? 'Request failed.',
        };

        throw errors;
    }

    return payload;
}

export function CheckoutProvider({
    addresses,
    appliedVoucher,
    cartItems,
    children,
    defaultAddressId,
    paymentGateway,
    selectedShippingRate,
    storeLocation,
    summary,
}: {
    addresses: CheckoutAddress[];
    appliedVoucher: Voucher;
    cartItems: CheckoutItem[];
    children: ReactNode;
    defaultAddressId: number | null;
    paymentGateway: PaymentGateway;
    selectedShippingRate: ShippingRate | null;
    storeLocation: CheckoutStoreLocation;
    summary: CheckoutSummary;
}) {
    const [currentAddressId, setCurrentAddressId] = useState<number | null>(
        defaultAddressId,
    );
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [currentRate, setCurrentRate] = useState<ShippingRate | null>(
        selectedShippingRate,
    );
    const [currentVoucher, setCurrentVoucher] =
        useState<Voucher>(appliedVoucher);
    const [currentSummary, setCurrentSummary] = useState(summary);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shippingRatesLoading, setShippingRatesLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const placingOrderRef = useRef(false);
    const [idempotencyKey] = useState(checkoutIdempotencyKey);

    const resetShippingSummary = useCallback(() => {
        setCurrentSummary((current) => ({
            ...current,
            shipping: 0,
            total: Math.max(
                0,
                current.subtotal + current.service_fee - current.discount,
            ),
        }));
    }, []);

    const loadShippingRates = useCallback(
        async (
            addressId: number,
            options: { preserveSelectedRate?: boolean } = {},
        ) => {
            const preserveSelectedRate = options.preserveSelectedRate ?? false;

            setErrors({});
            setCurrentAddressId(addressId);

            if (!preserveSelectedRate) {
                setCurrentRate(null);
                resetShippingSummary();
            }

            setShippingRatesLoading(true);

            try {
                const payload = await jsonRequest(shippingRates.url(), 'POST', {
                    customer_address_id: addressId,
                });
                const nextRates = payload.rates ?? [];

                setRates(nextRates);

                if (preserveSelectedRate) {
                    setCurrentRate((currentRate) => {
                        if (!currentRate) {
                            return null;
                        }

                        const stillAvailable = nextRates.some(
                            (rate: ShippingRate) => rate.id === currentRate.id,
                        );

                        if (stillAvailable) {
                            return currentRate;
                        }

                        resetShippingSummary();

                        return null;
                    });
                }
            } catch (error) {
                setRates([]);
                setErrors(error as Record<string, string>);

                if (!preserveSelectedRate) {
                    setCurrentRate(null);
                }
            } finally {
                setShippingRatesLoading(false);
            }
        },
        [resetShippingSummary],
    );

    const selectAddress = useCallback(
        async (addressId: number) => {
            await loadShippingRates(addressId);
        },
        [loadShippingRates],
    );

    const selectShippingRate = useCallback(async (rate: ShippingRate) => {
        setErrors({});

        try {
            await jsonRequest(shippingRate.url(), 'POST', {
                shipping_rate_id: rate.id,
            });
            setCurrentRate(rate);
            setCurrentSummary((current) => ({
                ...current,
                shipping: rate.price,
                total: Math.round(
                    Math.max(
                        0,
                        current.subtotal +
                            rate.price +
                            current.service_fee -
                            current.discount,
                    ),
                ),
                rounding_adjustment:
                    Math.round(
                        (Math.round(
                            Math.max(
                                0,
                                current.subtotal +
                                    rate.price +
                                    current.service_fee -
                                    current.discount,
                            ),
                        ) -
                            Math.max(
                                0,
                                current.subtotal +
                                    rate.price +
                                    current.service_fee -
                                    current.discount,
                            )) *
                            100,
                    ) / 100,
            }));
        } catch (error) {
            setErrors(error as Record<string, string>);
        }
    }, []);

    const applyVoucher = useCallback(async (code: string) => {
        setErrors({});

        try {
            const payload = await jsonRequest(applyVoucherRoute.url(), 'POST', {
                voucher_code: code,
            });
            setCurrentVoucher(payload.voucher);
            setCurrentSummary(payload.summary);
        } catch (error) {
            setErrors(error as Record<string, string>);
        }
    }, []);

    const removeVoucher = useCallback(async () => {
        setErrors({});
        const payload = await jsonRequest(removeVoucherRoute.url(), 'DELETE');
        setCurrentVoucher(payload.voucher);
        setCurrentSummary(payload.summary);
    }, []);

    const placeOrder = useCallback(
        async (
            notes: string,
            agreed: boolean,
            paymentMethod: string | null,
        ) => {
            if (placingOrderRef.current) {
                return null;
            }

            if (
                !paymentGateway.methods.some(
                    (method) => method.id === paymentMethod,
                )
            ) {
                setErrors({
                    payment_method: 'Pilih metode pembayaran terlebih dahulu.',
                });

                return null;
            }

            if (!agreed) {
                setErrors({
                    no_return_refund_agreed:
                        'Setujui kebijakan toko terlebih dahulu.',
                });

                return null;
            }

            if (!currentAddressId || !currentRate) {
                setErrors({
                    checkout: 'Pilih alamat dan ongkir terlebih dahulu.',
                });

                return null;
            }

            placingOrderRef.current = true;
            setPlacingOrder(true);
            setErrors({});

            try {
                const payload = await jsonRequest(
                    placeOrderRoute.url(),
                    'POST',
                    {
                        customer_address_id: currentAddressId,
                        shipping_rate_id: currentRate.id,
                        idempotency_key: idempotencyKey,
                        payment_method: paymentMethod,
                        voucher_code: currentVoucher?.code ?? null,
                        notes,
                        no_return_refund_agreed: agreed,
                    },
                );

                if (
                    !payload.order_id ||
                    !payload.payment_id ||
                    !['ready', 'processing', 'failed', 'final'].includes(
                        payload.payment_state,
                    ) ||
                    typeof payload.redirect_url !== 'string'
                ) {
                    throw {
                        payment:
                            'Respons checkout tidak valid. Coba lagi dengan pesanan yang sama.',
                    };
                }

                const redirect = new URL(
                    payload.redirect_url,
                    window.location.origin,
                );
                const local = redirect.origin === window.location.origin;
                const snap =
                    redirect.protocol === 'https:' &&
                    ['app.midtrans.com', 'app.sandbox.midtrans.com'].includes(
                        redirect.hostname,
                    ) &&
                    !redirect.username &&
                    !redirect.password &&
                    !redirect.port;

                if (!local && !snap) {
                    throw { payment: 'Tujuan pembayaran tidak valid.' };
                }

                window.sessionStorage.removeItem('checkout.idempotency_key');

                return payload.redirect_url ?? null;
            } catch (error) {
                setErrors(error as Record<string, string>);

                return null;
            } finally {
                placingOrderRef.current = false;
                setPlacingOrder(false);
            }
        },
        [
            currentAddressId,
            currentRate,
            currentVoucher,
            idempotencyKey,
            paymentGateway.methods,
        ],
    );

    const value = useMemo<CheckoutContextValue>(
        () => ({
            addresses,
            appliedVoucher: currentVoucher,
            paymentGateway,
            applyVoucher,
            cartItems,
            errors,
            loadShippingRates,
            placeOrder,
            placingOrder,
            removeVoucher,
            selectAddress,
            selectShippingRate,
            selectedAddressId: currentAddressId,
            selectedShippingRate: currentRate,
            shippingRates: rates,
            shippingRatesLoading,
            storeLocation,
            summary: currentSummary,
        }),
        [
            addresses,
            applyVoucher,
            cartItems,
            currentAddressId,
            currentRate,
            currentSummary,
            currentVoucher,
            errors,
            loadShippingRates,
            paymentGateway,
            placeOrder,
            placingOrder,
            rates,
            removeVoucher,
            selectAddress,
            selectShippingRate,
            shippingRatesLoading,
            storeLocation,
        ],
    );

    return (
        <CheckoutContext.Provider value={value}>
            {children}
        </CheckoutContext.Provider>
    );
}

export function useCheckout() {
    const context = useContext(CheckoutContext);

    if (!context) {
        throw new Error('useCheckout must be used inside CheckoutProvider');
    }

    return context;
}
