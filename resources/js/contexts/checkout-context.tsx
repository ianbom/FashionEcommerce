import {
    createContext,
    useCallback,
    useContext,
    useMemo,
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
    total: number;
};

type CheckoutContextValue = {
    addresses: CheckoutAddress[];
    appliedVoucher: Voucher;
    applyVoucher: (code: string) => Promise<void>;
    cartItems: CheckoutItem[];
    errors: Record<string, string>;
    loadShippingRates: (addressId: number) => Promise<void>;
    placeOrder: (notes: string, agreed: boolean) => Promise<string | null>;
    placingOrder: boolean;
    removeVoucher: () => Promise<void>;
    selectAddress: (addressId: number) => Promise<void>;
    selectShippingRate: (rate: ShippingRate) => Promise<void>;
    selectedAddressId: number | null;
    selectedShippingRate: ShippingRate | null;
    shippingRates: ShippingRate[];
    shippingRatesLoading: boolean;
    summary: CheckoutSummary;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

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
    selectedShippingRate,
    summary,
}: {
    addresses: CheckoutAddress[];
    appliedVoucher: Voucher;
    cartItems: CheckoutItem[];
    children: ReactNode;
    defaultAddressId: number | null;
    selectedShippingRate: ShippingRate | null;
    summary: CheckoutSummary;
}) {
    const [currentAddressId, setCurrentAddressId] = useState<number | null>(
        defaultAddressId,
    );
    const [rates, setRates] = useState<ShippingRate[]>(
        selectedShippingRate ? [selectedShippingRate] : [],
    );
    const [currentRate, setCurrentRate] = useState<ShippingRate | null>(
        selectedShippingRate,
    );
    const [currentVoucher, setCurrentVoucher] =
        useState<Voucher>(appliedVoucher);
    const [currentSummary, setCurrentSummary] = useState(summary);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shippingRatesLoading, setShippingRatesLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const loadShippingRates = useCallback(async (addressId: number) => {
        setErrors({});
        setCurrentAddressId(addressId);
        setCurrentRate(null);
        setCurrentSummary((current) => ({
            ...current,
            shipping: 0,
            total: Math.max(
                0,
                current.subtotal + current.service_fee - current.discount,
            ),
        }));
        setShippingRatesLoading(true);

        try {
            const payload = await jsonRequest(shippingRates.url(), 'POST', {
                customer_address_id: addressId,
            });
            setRates(payload.rates ?? []);
        } catch (error) {
            setRates([]);
            setErrors(error as Record<string, string>);
        } finally {
            setShippingRatesLoading(false);
        }
    }, []);

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
                total: Math.max(
                    0,
                    current.subtotal +
                        rate.price +
                        current.service_fee -
                        current.discount,
                ),
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
        async (notes: string, agreed: boolean) => {
            if (!currentAddressId || !currentRate) {
                setErrors({
                    checkout: 'Pilih alamat dan ongkir terlebih dahulu.',
                });

                return null;
            }

            setPlacingOrder(true);
            setErrors({});

            try {
                const payload = await jsonRequest(
                    placeOrderRoute.url(),
                    'POST',
                    {
                        customer_address_id: currentAddressId,
                        shipping_rate_id: currentRate.id,
                        voucher_code: currentVoucher?.code ?? null,
                        notes,
                        no_return_refund_agreed: agreed,
                    },
                );

                return payload.redirect_url ?? null;
            } catch (error) {
                setErrors(error as Record<string, string>);

                return null;
            } finally {
                setPlacingOrder(false);
            }
        },
        [currentAddressId, currentRate, currentVoucher],
    );

    const value = useMemo<CheckoutContextValue>(
        () => ({
            addresses,
            appliedVoucher: currentVoucher,
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
            placeOrder,
            placingOrder,
            rates,
            removeVoucher,
            selectAddress,
            selectShippingRate,
            shippingRatesLoading,
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
