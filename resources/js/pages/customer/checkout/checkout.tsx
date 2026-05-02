import { Head, Link } from '@inertiajs/react';
import { Box, Check, Lock, ShieldCheck, Ticket, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CheckoutProvider, useCheckout } from '@/contexts/checkout-context';
import type {
    CheckoutAddress,
    CheckoutItem,
    CheckoutSummary,
    ShippingRate,
    Voucher,
} from '@/contexts/checkout-context';
import ShopLayout from '@/layouts/shop-layout';

type Props = {
    addresses: CheckoutAddress[];
    appliedVoucher: Voucher;
    cartItems: CheckoutItem[];
    defaultAddressId: number | null;
    selectedShippingRate: ShippingRate | null;
    summary: CheckoutSummary;
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(price)
        .replace('Rp', 'Rp ');

export default function Checkout(props: Props) {
    return (
        <CheckoutProvider {...props}>
            <CheckoutScreen />
        </CheckoutProvider>
    );
}

function CheckoutScreen() {
    const {
        addresses,
        appliedVoucher,
        applyVoucher,
        cartItems,
        errors,
        loadShippingRates,
        placeOrder,
        placingOrder,
        removeVoucher,
        selectAddress,
        selectShippingRate,
        selectedAddressId,
        selectedShippingRate,
        shippingRates,
        shippingRatesLoading,
        summary,
    } = useCheckout();
    const [voucherCode, setVoucherCode] = useState(appliedVoucher?.code ?? '');
    const [notes, setNotes] = useState('');
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (selectedAddressId && shippingRates.length === 0) {
            void loadShippingRates(selectedAddressId);
        }
    }, [loadShippingRates, selectedAddressId, shippingRates.length]);

    const submitOrder = async () => {
        const redirectUrl = await placeOrder(notes, agreed);

        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    };

    return (
        <ShopLayout>
            <Head title="Checkout - Aurea Syari" />

            <main className="mx-auto min-h-screen max-w-[1200px] bg-[#FAF9F6] px-4 py-8 md:px-8 md:py-12">
                <div className="mb-8 flex items-center space-x-2 text-[10px] font-medium tracking-wide text-[#8C8578] md:text-xs">
                    <Link
                        href="/"
                        className="transition-colors hover:text-black"
                    >
                        Home
                    </Link>
                    <span>/</span>
                    <Link
                        href="/my-cart"
                        className="transition-colors hover:text-black"
                    >
                        Cart
                    </Link>
                    <span>/</span>
                    <span className="text-[#333333]">Checkout</span>
                </div>

                <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <h1 className="mb-2 font-serif text-3xl text-[#3C3428] italic md:text-4xl">
                            Checkout
                        </h1>
                        <p className="text-xs text-[#8C8578] md:text-sm">
                            Pilih alamat tersimpan, ongkir Biteship, voucher,
                            lalu bayar via Midtrans.
                        </p>
                    </div>
                    <div className="flex max-w-[380px] items-center">
                        {['Cart', 'Checkout', 'Payment'].map((label, index) => (
                            <div key={label} className="flex items-center">
                                <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${index < 2 ? 'bg-[#3C3428] text-white' : 'bg-white text-[#A89F91] ring-1 ring-[#EAE8E3]'}`}
                                >
                                    {index === 0 ? (
                                        <Check size={14} />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <span className="mx-2 hidden text-[11px] text-[#8C8578] sm:inline">
                                    {label}
                                </span>
                                {index < 2 && (
                                    <div className="mx-2 h-px w-10 bg-[#EAE8E3]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="rounded-2xl border border-[#EAE8E3] bg-white p-10 text-center">
                        <p className="mb-4 font-serif text-2xl text-[#3C3428]">
                            Keranjang kosong
                        </p>
                        <Link
                            href="/list"
                            className="text-sm font-semibold text-[#3C3428] underline"
                        >
                            Belanja dulu
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="space-y-6">
                            <section className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-xl text-[#3C3428]">
                                            Alamat Pengiriman
                                        </h2>
                                        <p className="mt-1 text-[12px] text-[#8C8578]">
                                            Data berasal dari
                                            customer_addresses.
                                        </p>
                                    </div>
                                    <Link
                                        href="/address?redirect_to=/checkout"
                                        className="text-[12px] font-bold text-[#3C3428] underline"
                                    >
                                        Kelola alamat
                                    </Link>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {addresses.map((address) => (
                                        <button
                                            key={address.id}
                                            type="button"
                                            onClick={() =>
                                                void selectAddress(address.id)
                                            }
                                            className={`rounded-xl border p-4 text-left transition-all ${selectedAddressId === address.id ? 'border-[#C2AA92] bg-[#FAF8F5] ring-1 ring-[#C2AA92]' : 'border-[#EAE8E3] hover:border-[#C4BDB1]'}`}
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-3">
                                                <p className="text-[13px] font-bold text-[#333]">
                                                    {address.label ?? 'Address'}
                                                </p>
                                                {address.is_default && (
                                                    <span className="rounded bg-[#F5F2E6] px-2 py-1 text-[10px] font-bold text-[#3C3428]">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[12px] font-semibold text-[#4A4A4A]">
                                                {address.recipient_name}
                                            </p>
                                            <p className="mt-1 text-[11px] text-[#8C8578]">
                                                {address.recipient_phone}
                                            </p>
                                            <p className="mt-2 text-[12px] leading-relaxed text-[#4A4A4A]">
                                                {address.full_address}
                                            </p>
                                            {!address.postal_code && (
                                                <p className="mt-2 text-[11px] font-semibold text-[#B24B4B]">
                                                    Lengkapi postal code di
                                                    Address Book.
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2">
                                    <Truck
                                        size={18}
                                        className="text-[#3C3428]"
                                    />
                                    <h2 className="font-serif text-xl text-[#3C3428]">
                                        Ongkir
                                    </h2>
                                </div>
                                {errors.shipping && (
                                    <p className="mb-3 text-[12px] font-semibold text-[#B24B4B]">
                                        {errors.shipping}
                                    </p>
                                )}
                                {errors.customer_address_id && (
                                    <p className="mb-3 text-[12px] font-semibold text-[#B24B4B]">
                                        {errors.customer_address_id}
                                    </p>
                                )}
                                {shippingRatesLoading ? (
                                    <div className="rounded-xl border border-dashed border-[#EAE8E3] p-6 text-[12px] text-[#8C8578]">
                                        Memuat harga ongkir...
                                    </div>
                                ) : shippingRates.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#EAE8E3] p-6 text-[12px] text-[#8C8578]">
                                        Pilih alamat dengan postal code untuk
                                        melihat harga ongkir.
                                    </div>
                                ) : (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {shippingRates.map((rate) => (
                                            <button
                                                key={rate.id}
                                                type="button"
                                                onClick={() =>
                                                    void selectShippingRate(
                                                        rate,
                                                    )
                                                }
                                                className={`rounded-xl border p-4 text-left transition-all ${selectedShippingRate?.id === rate.id ? 'border-[#C2AA92] bg-[#FAF8F5] ring-1 ring-[#C2AA92]' : 'border-[#EAE8E3] hover:border-[#C4BDB1]'}`}
                                            >
                                                <p className="text-[13px] font-bold text-[#3C3428]">
                                                    {rate.courier_company.toUpperCase()}{' '}
                                                    {rate.courier_type}
                                                </p>
                                                <p className="mt-1 text-[11px] text-[#8C8578]">
                                                    {rate.courier_service_name ??
                                                        rate.description ??
                                                        'Delivery service'}{' '}
                                                    · {rate.duration ?? '-'}
                                                </p>
                                                <p className="mt-3 text-[15px] font-bold text-[#333]">
                                                    {formatPrice(rate.price)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2">
                                    <Ticket
                                        size={18}
                                        className="text-[#3C3428]"
                                    />
                                    <h2 className="font-serif text-xl text-[#3C3428]">
                                        Voucher
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={voucherCode}
                                        onChange={(event) =>
                                            setVoucherCode(event.target.value)
                                        }
                                        placeholder="Masukkan kode voucher"
                                        className="flex-1 rounded-md border border-[#EAE8E3] bg-[#FAF9F6] px-4 py-2.5 text-[12px] focus:border-[#C4BDB1] focus:ring-1 focus:ring-[#C4BDB1] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void applyVoucher(voucherCode)
                                        }
                                        className="rounded-md bg-[#3C3428] px-5 py-2.5 text-[12px] font-bold text-white"
                                    >
                                        Apply
                                    </button>
                                    {appliedVoucher && (
                                        <button
                                            type="button"
                                            onClick={() => void removeVoucher()}
                                            className="rounded-md border border-[#EAE8E3] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A]"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {appliedVoucher && (
                                    <p className="mt-2 text-[12px] font-semibold text-emerald-700">
                                        {appliedVoucher.name}: -
                                        {formatPrice(appliedVoucher.discount)}
                                    </p>
                                )}
                                {errors.voucher_code && (
                                    <p className="mt-2 text-[12px] font-semibold text-[#B24B4B]">
                                        {errors.voucher_code}
                                    </p>
                                )}
                            </section>

                            <section className="rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 font-serif text-xl text-[#3C3428]">
                                    Catatan Order
                                </h2>
                                <textarea
                                    value={notes}
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    maxLength={2000}
                                    placeholder="Opsional"
                                    className="h-24 w-full resize-none rounded-md border border-[#EAE8E3] bg-white px-4 py-3 text-[13px] focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] focus:outline-none"
                                />
                                <label className="mt-4 flex items-start gap-2 text-[12px] text-[#4A4A4A]">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(event) =>
                                            setAgreed(event.target.checked)
                                        }
                                        className="mt-0.5 h-4 w-4 rounded border-[#EAE8E3] text-[#3C3428]"
                                    />
                                    <span>
                                        Saya menyetujui no return/refund policy,
                                        Terms & Conditions, dan Privacy Policy.
                                    </span>
                                </label>
                                {errors.no_return_refund_agreed && (
                                    <p className="mt-2 text-[12px] font-semibold text-[#B24B4B]">
                                        {errors.no_return_refund_agreed}
                                    </p>
                                )}
                                {errors.checkout && (
                                    <p className="mt-2 text-[12px] font-semibold text-[#B24B4B]">
                                        {errors.checkout}
                                    </p>
                                )}
                            </section>
                        </div>

                        <aside className="h-fit rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-xl shadow-black/5 lg:sticky lg:top-24">
                            <h2 className="mb-5 border-b border-[#EAE8E3] pb-4 font-serif text-xl text-[#3C3428]">
                                Order Summary
                            </h2>
                            <div className="mb-5 max-h-[300px] space-y-4 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#F5F2E6]">
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-bl bg-white/90 text-[10px] font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-[12px] font-bold text-[#333]">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[#8C8578]">
                                                {[item.color, item.size]
                                                    .filter(Boolean)
                                                    .join(' / ') || '-'}
                                            </p>
                                            {!item.is_available && (
                                                <p className="mt-1 text-[10px] font-bold text-[#B24B4B]">
                                                    Stok berubah. Update cart.
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-right text-[12px] font-semibold text-[#333]">
                                            {formatPrice(item.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <SummaryRow
                                label="Subtotal"
                                value={summary.subtotal}
                            />
                            <SummaryRow
                                label="Shipping"
                                value={summary.shipping}
                            />
                            <SummaryRow
                                label="Service Fee"
                                value={summary.service_fee}
                            />
                            <SummaryRow
                                label="Discount"
                                value={-summary.discount}
                                danger
                            />
                            <div className="mt-4 border-t border-[#EAE8E3] pt-4">
                                <div className="flex items-end justify-between">
                                    <span className="text-[13px] font-semibold text-[#333]">
                                        Total Payment
                                    </span>
                                    <span className="font-serif text-2xl text-[#333]">
                                        {formatPrice(summary.total)}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => void submitOrder()}
                                disabled={
                                    placingOrder ||
                                    !selectedShippingRate ||
                                    !agreed ||
                                    cartItems.some((item) => !item.is_available)
                                }
                                className="mt-6 flex w-full items-center justify-center rounded-lg bg-[#3C3428] py-4 text-[13px] font-bold tracking-wider text-white transition-all hover:bg-[#2D261C] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Lock size={16} className="mr-2" />
                                {placingOrder
                                    ? 'Creating Payment...'
                                    : 'Pay with Midtrans'}
                            </button>
                            <div className="mt-6 space-y-3 rounded-xl bg-[#FAF9F6] p-4 text-[11px] text-[#8C8578]">
                                <p className="flex items-center gap-2">
                                    <ShieldCheck size={16} /> Secure payment
                                    powered by Midtrans
                                </p>
                                <p className="flex items-center gap-2">
                                    <Box size={16} /> Shipping calculated by
                                    Biteship
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </ShopLayout>
    );
}

function SummaryRow({
    label,
    value,
    danger = false,
}: {
    label: string;
    value: number;
    danger?: boolean;
}) {
    return (
        <div
            className={`mb-3 flex items-center justify-between text-[12px] ${danger ? 'text-[#C05D5D]' : 'text-[#4A4A4A]'}`}
        >
            <span>{label}</span>
            <span className="font-semibold">
                {value < 0 ? '-' : ''}
                {formatPrice(Math.abs(value))}
            </span>
        </div>
    );
}
