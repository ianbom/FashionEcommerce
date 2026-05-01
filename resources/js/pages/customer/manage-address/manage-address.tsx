import { router, useForm } from '@inertiajs/react';
import { AlertCircle, Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/Customer/AddressController';
import ProfileLayout from '@/layouts/profile-layout';

type Address = {
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
    latitude: number | string | null;
    longitude: number | string | null;
    full_address: string;
    note: string | null;
    is_default: boolean;
};

type Props = {
    addresses: Address[];
};

type AddressFormData = {
    label: string;
    recipient_name: string;
    recipient_phone: string;
    full_address: string;
    province: string;
    city: string;
    district: string;
    subdistrict: string;
    postal_code: string;
    biteship_area_id: string;
    latitude: string;
    longitude: string;
    note: string;
    is_default: boolean;
};

const EMPTY_FORM: AddressFormData = {
    label: '',
    recipient_name: '',
    recipient_phone: '',
    full_address: '',
    province: '',
    city: '',
    district: '',
    subdistrict: '',
    postal_code: '',
    biteship_area_id: '',
    latitude: '',
    longitude: '',
    note: '',
    is_default: false,
};

const asText = (value: number | string | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

const formDataFromAddress = (address?: Address): AddressFormData => {
    if (!address) {
        return { ...EMPTY_FORM };
    }

    return {
        label: address.label ?? '',
        recipient_name: address.recipient_name,
        recipient_phone: address.recipient_phone,
        full_address: address.full_address,
        province: address.province,
        city: address.city,
        district: address.district,
        subdistrict: address.subdistrict ?? '',
        postal_code: address.postal_code,
        biteship_area_id: address.biteship_area_id ?? '',
        latitude: asText(address.latitude),
        longitude: asText(address.longitude),
        note: address.note ?? '',
        is_default: address.is_default,
    };
};

const normalizePayload = (data: AddressFormData) => ({
    ...data,
    label: data.label.trim() === '' ? null : data.label.trim(),
    subdistrict: data.subdistrict.trim() === '' ? null : data.subdistrict.trim(),
    note: data.note.trim() === '' ? null : data.note.trim(),
    biteship_area_id:
        data.biteship_area_id.trim() === '' ? null : data.biteship_area_id.trim(),
    latitude: data.latitude.trim() === '' ? null : Number(data.latitude),
    longitude: data.longitude.trim() === '' ? null : Number(data.longitude),
});

const payloadFromAddress = (
    address: Address,
    overrides: Partial<AddressFormData> = {},
) => normalizePayload({
    ...formDataFromAddress(address),
    ...overrides,
});

export default function ManageAddress({ addresses }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [defaultingId, setDefaultingId] = useState<number | null>(null);

    const form = useForm<AddressFormData>({ ...EMPTY_FORM });
    const editingAddress = useMemo(
        () =>
            editingId === null
                ? null
                : addresses.find((address) => address.id === editingId) ?? null,
        [addresses, editingId],
    );
    const canMutateCard = deletingId === null && defaultingId === null;

    const openModal = (id: number | null = null) => {
        const selectedAddress =
            id === null
                ? undefined
                : addresses.find((address) => address.id === id);

        setEditingId(id);
        setShowDeleteConfirm(null);
        form.clearErrors();
        form.setData(formDataFromAddress(selectedAddress));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.clearErrors();
        form.setData({ ...EMPTY_FORM });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const action = editingAddress ? update(editingAddress.id) : store();

        form.transform((data) => normalizePayload(data));
        form.submit(action, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
            onFinish: () => {
                form.transform((data) => data);
            },
        });
    };

    const handleDelete = (addressId: number) => {
        if (!canMutateCard) {
            return;
        }

        setDeletingId(addressId);

        router.delete(destroy(addressId), {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setShowDeleteConfirm(null);
            },
        });
    };

    const setAsDefault = (address: Address) => {
        if (!canMutateCard || address.is_default) {
            return;
        }

        setDefaultingId(address.id);

        router.put(update(address.id), payloadFromAddress(address, { is_default: true }), {
            preserveScroll: true,
            onFinish: () => {
                setDefaultingId(null);
            },
        });
    };

    return (
        <ProfileLayout
            title="Address Book"
            pageTitle="Manage Addresses"
            subtitle="Manage your shipping and billing addresses for a faster checkout."
            activePath="address"
            breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'My Account', href: '/my-profile' },
                { label: 'Address Book' },
            ]}
        >
            <div
                className="animate-fade-in-up mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"
                style={{ animationDelay: '150ms' }}
            >
                <div>
                    <h2 className="font-serif text-xl text-[#3C3428]">Saved Addresses</h2>
                    <p className="mt-1 text-[12px] text-[#8C8578]">
                        You have {addresses.length} saved address
                        {addresses.length !== 1 ? 'es' : ''}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="flex items-center justify-center rounded-lg bg-[#3C3428] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-all hover:bg-[#2D261C] hover:shadow-lg active:scale-[0.98]"
                >
                    <Plus size={16} className="mr-2" /> Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="group flex min-h-[240px] w-full animate-fade-in-up flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EAE8E3] p-6 text-center transition-all duration-300 hover:border-[#C2AA92] hover:bg-[#FAF9F6]"
                >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F2E6] text-[#C2AA92] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C2AA92] group-hover:text-white">
                        <Plus size={24} />
                    </div>
                    <h3 className="mb-1 text-[14px] font-bold text-[#333] transition-colors group-hover:text-[#3C3428]">
                        Add Your First Address
                    </h3>
                    <p className="max-w-[220px] text-[11px] text-[#8C8578]">
                        Save your shipping address to make checkout faster.
                    </p>
                </button>
            ) : (
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {addresses.map((address, index) => {
                        const deletingThis = deletingId === address.id;
                        const defaultingThis = defaultingId === address.id;

                        return (
                            <div
                                key={address.id}
                                className={`group relative rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:p-8 ${
                                    address.is_default
                                        ? 'border-[#C2AA92]'
                                        : 'border-[#EAE8E3]'
                                } animate-fade-in-up`}
                                style={{ animationDelay: `${200 + index * 50}ms` }}
                            >
                                {address.is_default && (
                                    <div className="absolute top-0 right-8 -translate-y-1/2">
                                        <span className="rounded-full bg-[#3C3428] px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                                            Default Address
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${
                                                address.is_default
                                                    ? 'bg-[#F5F2E6] text-[#C2AA92]'
                                                    : 'bg-[#FAF9F6] text-[#A89F91]'
                                            }`}
                                        >
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-bold text-[#333]">
                                                {address.label ?? 'Address'}
                                            </h3>
                                            <p className="mt-0.5 text-[12px] font-semibold text-[#4A4A4A]">
                                                {address.recipient_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            disabled={!canMutateCard}
                                            onClick={() => openModal(address.id)}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF9F6] text-[#8C8578] transition-colors hover:bg-[#F5F2E6] hover:text-[#3C3428] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canMutateCard}
                                            onClick={() => setShowDeleteConfirm(address.id)}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F5] text-[#EF4444] transition-colors hover:bg-[#FEE2E2] hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 space-y-1.5 pl-13 text-[13px] text-[#4A4A4A]">
                                    <p className="mb-2 text-[11px] font-medium text-[#8C8578]">
                                        {address.recipient_phone}
                                    </p>
                                    <p className="leading-relaxed">
                                        {address.full_address}
                                        <br />
                                        {address.district}, {address.city},{' '}
                                        {address.province} {address.postal_code}
                                    </p>
                                </div>

                                {!address.is_default && (
                                    <button
                                        type="button"
                                        disabled={!canMutateCard}
                                        onClick={() => setAsDefault(address)}
                                        className="w-full rounded-lg border border-[#EAE8E3] py-2.5 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:border-[#C2AA92] hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {defaultingThis
                                            ? 'Setting as Default...'
                                            : 'Set as Default'}
                                    </button>
                                )}

                                {showDeleteConfirm === address.id && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 p-6 text-center backdrop-blur-sm">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h4 className="mb-1 text-[14px] font-bold text-[#333]">
                                            Delete this address?
                                        </h4>
                                        <p className="mb-4 text-[11px] text-[#8C8578]">
                                            This action cannot be undone.
                                        </p>
                                        <div className="flex w-full space-x-3">
                                            <button
                                                type="button"
                                                disabled={deletingThis}
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className="flex-1 rounded-lg border border-[#EAE8E3] py-2 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:bg-[#FAF9F6]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingThis}
                                                onClick={() => handleDelete(address.id)}
                                                className="flex-1 rounded-lg bg-[#EF4444] py-2 text-[12px] font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {deletingThis ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#FAF9F6] px-6 py-4">
                            <h3 className="font-serif text-lg text-[#3C3428]">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-1 text-[#A89F91] transition-colors hover:text-[#333]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                            <div className="custom-scrollbar space-y-4 overflow-y-auto p-6">
                                <InputBlock
                                    label="Address Label"
                                    value={form.data.label}
                                    onChange={(value) => form.setData('label', value)}
                                    placeholder="e.g. Home, Office"
                                    error={form.errors.label}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                        label="Recipient Name"
                                        value={form.data.recipient_name}
                                        onChange={(value) =>
                                            form.setData('recipient_name', value)
                                        }
                                        error={form.errors.recipient_name}
                                    />
                                    <InputBlock
                                        label="Phone Number"
                                        value={form.data.recipient_phone}
                                        onChange={(value) =>
                                            form.setData('recipient_phone', value)
                                        }
                                        error={form.errors.recipient_phone}
                                    />
                                </div>
                                <TextareaBlock
                                    label="Full Address"
                                    value={form.data.full_address}
                                    onChange={(value) => form.setData('full_address', value)}
                                    placeholder="Street name, building, house no."
                                    error={form.errors.full_address}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                        label="Province"
                                        value={form.data.province}
                                        onChange={(value) => form.setData('province', value)}
                                        error={form.errors.province}
                                    />
                                    <InputBlock
                                        label="City"
                                        value={form.data.city}
                                        onChange={(value) => form.setData('city', value)}
                                        error={form.errors.city}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                        label="District"
                                        value={form.data.district}
                                        onChange={(value) => form.setData('district', value)}
                                        error={form.errors.district}
                                    />
                                    <InputBlock
                                        label="Subdistrict"
                                        value={form.data.subdistrict}
                                        onChange={(value) => form.setData('subdistrict', value)}
                                        error={form.errors.subdistrict}
                                    />
                                </div>
                                <InputBlock
                                    label="Postal Code"
                                    value={form.data.postal_code}
                                    onChange={(value) => form.setData('postal_code', value)}
                                    error={form.errors.postal_code}
                                />
                                <TextareaBlock
                                    label="Address Note (optional)"
                                    value={form.data.note}
                                    onChange={(value) => form.setData('note', value)}
                                    placeholder="Landmark, delivery note, etc."
                                    error={form.errors.note}
                                />
                                <label className="flex items-center pt-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_default}
                                        onChange={(event) =>
                                            form.setData('is_default', event.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-[#EAE8E3] text-[#3C3428] focus:ring-[#C2AA92]"
                                    />
                                    <span className="ml-2 cursor-pointer text-[12px] font-medium text-[#4A4A4A]">
                                        Set as default address
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[#EAE8E3] bg-[#FAF9F6] px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-[#EAE8E3] px-6 py-2.5 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-md bg-[#3C3428] px-6 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#2D261C] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {form.processing
                                        ? 'Saving...'
                                        : editingAddress
                                          ? 'Update Address'
                                          : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
};

function InputBlock({ label, value, onChange, placeholder, error }: FieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-[#EAE8E3] bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] focus:outline-none"
            />
            {error && <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">{error}</p>}
        </div>
    );
}

function TextareaBlock({
    label,
    value,
    onChange,
    placeholder,
    error,
}: FieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                {label}
            </label>
            <textarea
                rows={3}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full resize-none rounded-md border border-[#EAE8E3] bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:border-[#C2AA92] focus:ring-1 focus:ring-[#C2AA92] focus:outline-none"
            />
            {error && <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">{error}</p>}
        </div>
    );
}
