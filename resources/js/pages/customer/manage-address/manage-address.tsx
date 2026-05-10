import { router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Edit2,
    LocateFixed,
    MapPin,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Icon, LatLng, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import type {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/Customer/AddressController';
import biteshipAreas from '@/actions/App/Http/Controllers/Customer/BiteshipAreaController';
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
    redirectTo?: string;
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

const normalizePayload = (data: AddressFormData) => {
    return {
        ...data,
        label: data.label.trim() === '' ? null : data.label.trim(),
        subdistrict:
            data.subdistrict.trim() === '' ? null : data.subdistrict.trim(),
        note: data.note.trim() === '' ? null : data.note.trim(),
        biteship_area_id:
            data.biteship_area_id.trim() === ''
                ? null
                : data.biteship_area_id.trim(),
        latitude: data.latitude.trim() === '' ? null : data.latitude.trim(),
        longitude: data.longitude.trim() === '' ? null : data.longitude.trim(),
    };
};

const payloadFromAddress = (
    address: Address,
    overrides: Partial<AddressFormData> = {},
) =>
    normalizePayload({
        ...formDataFromAddress(address),
        ...overrides,
    });

type BiteshipArea = {
    id: string;
    name: string | null;
    administrative_division_level_1_name: string | null;
    administrative_division_level_2_name: string | null;
    administrative_division_level_3_name: string | null;
    administrative_division_level_4_name: string | null;
    postal_code: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
};

const formatCoordinate = (value: number): string => value.toFixed(7);

const validCoordinates = (latitude: number, longitude: number): boolean =>
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

const DEFAULT_MAP_CENTER: [number, number] = [-7.257472, 112.752088];

type ReactLeafletModules = {
    MapContainer: typeof MapContainer;
    Marker: typeof Marker;
    TileLayer: typeof TileLayer;
    useMap: typeof useMap;
    useMapEvents: typeof useMapEvents;
};

export default function ManageAddress({ addresses, redirectTo = '' }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
        null,
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [defaultingId, setDefaultingId] = useState<number | null>(null);
    const [areaQuery, setAreaQuery] = useState('');
    const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
    const [areaLoading, setAreaLoading] = useState(false);
    const [areaError, setAreaError] = useState('');
    const [mapError, setMapError] = useState('');

    const form = useForm<AddressFormData>({ ...EMPTY_FORM });
    const editingAddress = useMemo(
        () =>
            editingId === null
                ? null
                : (addresses.find((address) => address.id === editingId) ??
                  null),
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
        setAreaQuery('');
        setAreaResults([]);
        setAreaError('');
        setMapError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.clearErrors();
        form.setData({ ...EMPTY_FORM });
        setAreaQuery('');
        setAreaResults([]);
        setAreaError('');
        setMapError('');
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const action = editingAddress ? update(editingAddress.id) : store();

        form.transform((data) => ({
            ...normalizePayload(data),
            redirect_to: redirectTo || null,
        }));
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

    const searchArea = async () => {
        if (areaQuery.trim().length < 3) {
            return;
        }

        setAreaLoading(true);
        setAreaError('');

        try {
            const response = await fetch(
                biteshipAreas.url({ query: { search: areaQuery.trim() } }),
                {
                    headers: { Accept: 'application/json' },
                },
            );
            const payload = await response.json();

            if (!response.ok) {
                setAreaError(payload.message ?? 'Gagal mencari area Biteship.');
                setAreaResults([]);

                return;
            }

            setAreaResults(payload.areas ?? []);
        } catch {
            setAreaError('Gagal terhubung ke Biteship.');
            setAreaResults([]);
        } finally {
            setAreaLoading(false);
        }
    };

    const chooseArea = (area: BiteshipArea) => {
        form.setData({
            ...form.data,
            biteship_area_id: area.id,
            province:
                area.administrative_division_level_1_name ?? form.data.province,
            city: area.administrative_division_level_2_name ?? form.data.city,
            district:
                area.administrative_division_level_3_name ?? form.data.district,
            postal_code: area.postal_code ?? form.data.postal_code,
        });
        setAreaQuery(area.name ?? area.id);
        setAreaResults([]);
        setAreaError('');
    };

    const updateCoordinates = (latitude: number, longitude: number) => {
        if (!validCoordinates(latitude, longitude)) {
            setMapError('Koordinat tidak valid. Pilih titik lain di map.');

            return;
        }

        form.setData({
            ...form.data,
            latitude: formatCoordinate(latitude),
            longitude: formatCoordinate(longitude),
        });
        setMapError('');
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setMapError('Browser tidak mendukung deteksi lokasi.');

            return;
        }

        setMapError('Mencari lokasi perangkat...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateCoordinates(
                    position.coords.latitude,
                    position.coords.longitude,
                );
            },
            () => {
                setMapError(
                    'Gagal mengambil lokasi perangkat. Izinkan akses lokasi atau pilih pin manual.',
                );
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
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

        router.put(
            update(address.id),
            payloadFromAddress(address, { is_default: true }),
            {
                preserveScroll: true,
                onFinish: () => {
                    setDefaultingId(null);
                },
            },
        );
    };

    return (
        <ProfileLayout
            title="Buku Alamat"
            pageTitle="Kelola Alamat"
            subtitle="Kelola alamat pengiriman dan penagihan agar checkout lebih cepat."
            activePath="address"
            breadcrumbs={[
                { label: 'Beranda', href: '/' },
                { label: 'Akun Saya', href: '/my-profile' },
                { label: 'Buku Alamat' },
            ]}
        >
            <div
                className="animate-fade-in-up mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"
                style={{ animationDelay: '150ms' }}
            >
                <div>
                    <h2 className="font-serif text-xl text-[#4A2525]">
                        Alamat Tersimpan
                    </h2>
                    <p className="mt-1 text-[12px] text-[#8A6B62]">
                        Kamu punya {addresses.length} alamat tersimpan
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="flex items-center justify-center rounded-lg bg-[#4A2525] px-6 py-2.5 text-[12px] font-bold tracking-wider text-white transition-all hover:bg-[#5F1717] hover:shadow-lg active:scale-[0.98]"
                >
                    <Plus size={16} className="mr-2" /> Tambah Alamat Baru
                </button>
            </div>

            {addresses.length === 0 ? (
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="group animate-fade-in-up flex min-h-[240px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EADBD8] p-6 text-center transition-all duration-300 hover:border-[#B6574B] hover:bg-[#FAF9F6]"
                >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDED] text-[#B6574B] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#B6574B] group-hover:text-white">
                        <Plus size={24} />
                    </div>
                    <h3 className="mb-1 text-[14px] font-bold text-[#333] transition-colors group-hover:text-[#4A2525]">
                        Tambah Alamat Pertama
                    </h3>
                    <p className="max-w-[220px] text-[11px] text-[#8A6B62]">
                        Simpan alamat pengiriman agar checkout lebih cepat.
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
                                        ? 'border-[#B6574B]'
                                        : 'border-[#EADBD8]'
                                } animate-fade-in-up`}
                                style={{
                                    animationDelay: `${200 + index * 50}ms`,
                                }}
                            >
                                {address.is_default && (
                                    <div className="absolute top-0 right-8 -translate-y-1/2">
                                        <span className="rounded-full bg-[#4A2525] px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                                             Alamat Utama
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div
                                            className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${
                                                address.is_default
                                                    ? 'bg-[#F8EDED] text-[#B6574B]'
                                                    : 'bg-[#FAF9F6] text-[#C99A8F]'
                                            }`}
                                        >
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-bold text-[#333]">
                                                {address.label ?? 'Alamat'}
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
                                            onClick={() =>
                                                openModal(address.id)
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF9F6] text-[#8A6B62] transition-colors hover:bg-[#F8EDED] hover:text-[#4A2525] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canMutateCard}
                                            onClick={() =>
                                                setShowDeleteConfirm(address.id)
                                            }
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF5F5] text-[#EF4444] transition-colors hover:bg-[#FEE2E2] hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 space-y-1.5 pl-13 text-[13px] text-[#4A4A4A]">
                                    <p className="mb-2 text-[11px] font-medium text-[#8A6B62]">
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
                                        className="w-full rounded-lg border border-[#EADBD8] py-2.5 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:border-[#B6574B] hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {defaultingThis
                                             ? 'Menjadikan utama...'
                                             : 'Jadikan utama'}
                                    </button>
                                )}

                                {showDeleteConfirm === address.id && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 p-6 text-center backdrop-blur-sm">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h4 className="mb-1 text-[14px] font-bold text-[#333]">
                                             Hapus alamat ini?
                                        </h4>
                                        <p className="mb-4 text-[11px] text-[#8A6B62]">
                                             Tindakan ini tidak dapat dibatalkan.
                                        </p>
                                        <div className="flex w-full space-x-3">
                                            <button
                                                type="button"
                                                disabled={deletingThis}
                                                onClick={() =>
                                                    setShowDeleteConfirm(null)
                                                }
                                                className="flex-1 rounded-lg border border-[#EADBD8] py-2 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:bg-[#FAF9F6]"
                                            >
                                                 Batal
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deletingThis}
                                                onClick={() =>
                                                    handleDelete(address.id)
                                                }
                                                className="flex-1 rounded-lg bg-[#EF4444] py-2 text-[12px] font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {deletingThis
                                                     ? 'Menghapus...'
                                                     : 'Hapus'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative z-[10001] flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADBD8] bg-[#FAF9F6] px-6 py-4">
                            <h3 className="font-serif text-lg text-[#4A2525]">
                                {editingAddress
                                     ? 'Edit Alamat'
                                     : 'Tambah Alamat Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="p-1 text-[#C99A8F] transition-colors hover:text-[#333]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="custom-scrollbar space-y-4 overflow-y-auto p-6">
                                <InputBlock
                                     label="Label Alamat"
                                    value={form.data.label}
                                    onChange={(value) =>
                                        form.setData('label', value)
                                    }
                                     placeholder="mis. Rumah, Kantor"
                                    error={form.errors.label}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                         label="Nama Penerima"
                                        value={form.data.recipient_name}
                                        onChange={(value) =>
                                            form.setData(
                                                'recipient_name',
                                                value,
                                            )
                                        }
                                        error={form.errors.recipient_name}
                                    />
                                    <InputBlock
                                         label="Nomor Telepon"
                                        value={form.data.recipient_phone}
                                        onChange={(value) =>
                                            form.setData(
                                                'recipient_phone',
                                                value,
                                            )
                                        }
                                        error={form.errors.recipient_phone}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-semibold text-[#4A4A4A]">
                                         Cari berdasarkan Kode Pos
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={areaQuery}
                                            onChange={(event) =>
                                                setAreaQuery(event.target.value)
                                            }
                                             placeholder="Cari kecamatan, kota, kode pos"
                                            className="w-full rounded-md border border-[#EADBD8] bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:border-[#B6574B] focus:ring-1 focus:ring-[#B6574B] focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={searchArea}
                                            disabled={
                                                areaLoading ||
                                                areaQuery.trim().length < 3
                                            }
                                            className="flex items-center gap-2 rounded-md bg-[#F1E6E2] px-4 py-2.5 text-[12px] font-bold text-[#4A4A4A] disabled:opacity-60"
                                        >
                                            <Search size={14} />
                                             {areaLoading ? '...' : 'Cari'}
                                        </button>
                                    </div>
                                    {form.data.biteship_area_id && (
                                        <p className="mt-1.5 text-[11px] text-[#8A6B62]">
                                            Area ID:{' '}
                                            {form.data.biteship_area_id}
                                        </p>
                                    )}
                                    {areaResults.length > 0 && (
                                        <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-[#EADBD8] bg-white">
                                            {areaResults.map((area) => (
                                                <button
                                                    key={area.id}
                                                    type="button"
                                                    onClick={() =>
                                                        chooseArea(area)
                                                    }
                                                    className="block w-full border-b border-[#F1EEE8] px-4 py-2 text-left text-[12px] hover:bg-[#FAF9F6]"
                                                >
                                                    <span className="font-semibold text-[#333]">
                                                        {area.name ?? area.id}
                                                    </span>
                                                    <span className="block text-[#8A6B62]">
                                                        {[
                                                            area.administrative_division_level_3_name,
                                                            area.administrative_division_level_2_name,
                                                            area.administrative_division_level_1_name,
                                                            area.postal_code,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {areaError && (
                                        <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">
                                            {areaError}
                                        </p>
                                    )}
                                    {form.errors.biteship_area_id && (
                                        <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">
                                            {form.errors.biteship_area_id}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                         label="Provinsi"
                                        value={form.data.province}
                                        onChange={() => undefined}
                                        error={form.errors.province}
                                        readOnly
                                    />
                                    <InputBlock
                                         label="Kota"
                                        value={form.data.city}
                                        onChange={() => undefined}
                                        error={form.errors.city}
                                        readOnly
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputBlock
                                         label="Kecamatan"
                                        value={form.data.district}
                                        onChange={() => undefined}
                                        error={form.errors.district}
                                        readOnly
                                    />
                                    <InputBlock
                                         label="Kode Pos"
                                        value={form.data.postal_code}
                                        onChange={() => undefined}
                                        error={form.errors.postal_code}
                                        readOnly
                                    />
                                </div>
                                <InputBlock
                                     label="Kelurahan"
                                    value={form.data.subdistrict}
                                    onChange={(value) =>
                                        form.setData('subdistrict', value)
                                    }
                                    error={form.errors.subdistrict}
                                />
                                <LocationPicker
                                    latitude={form.data.latitude}
                                    longitude={form.data.longitude}
                                    error={
                                        mapError ||
                                        form.errors.latitude ||
                                        form.errors.longitude
                                    }
                                    onChange={updateCoordinates}
                                    onUseCurrentLocation={useCurrentLocation}
                                />
                                <TextareaBlock
                                     label="Alamat Lengkap"
                                    value={form.data.full_address}
                                    onChange={(value) =>
                                        form.setData('full_address', value)
                                    }
                                     placeholder="Nama jalan, gedung, nomor rumah"
                                    error={form.errors.full_address}
                                />
                                <TextareaBlock
                                     label="Catatan Alamat (opsional)"
                                    value={form.data.note}
                                    onChange={(value) =>
                                        form.setData('note', value)
                                    }
                                     placeholder="Patokan, catatan pengiriman, dll."
                                    error={form.errors.note}
                                />
                                <label className="flex items-center pt-2">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_default}
                                        onChange={(event) =>
                                            form.setData(
                                                'is_default',
                                                event.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-[#EADBD8] text-[#4A2525] focus:ring-[#B6574B]"
                                    />
                                    <span className="ml-2 cursor-pointer text-[12px] font-medium text-[#4A4A4A]">
                                        Jadikan alamat utama
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[#EADBD8] bg-[#FAF9F6] px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-[#EADBD8] px-6 py-2.5 text-[12px] font-bold text-[#4A4A4A] transition-colors hover:bg-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-md bg-[#4A2525] px-6 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#5F1717] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {form.processing
                                         ? 'Menyimpan...'
                                        : editingAddress
                                           ? 'Perbarui Alamat'
                                           : 'Simpan Alamat'}
                                </button>
                            </div>
                        </form>
                    </div>
                    </div>,
                    document.body,
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
    readOnly?: boolean;
};

type LocationPickerProps = {
    latitude: string;
    longitude: string;
    error?: string;
    onChange: (latitude: number, longitude: number) => void;
    onUseCurrentLocation: () => void;
};

function LocationPicker({
    latitude,
    longitude,
    error,
    onChange,
    onUseCurrentLocation,
}: LocationPickerProps) {
    const [leafletModules, setLeafletModules] =
        useState<ReactLeafletModules | null>(null);
    const [markerIcon, setMarkerIcon] = useState<Icon | null>(null);
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const hasCoordinates = validCoordinates(parsedLatitude, parsedLongitude);
    const position: [number, number] = hasCoordinates
        ? [parsedLatitude, parsedLongitude]
        : DEFAULT_MAP_CENTER;

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            import('leaflet'),
            import('leaflet/dist/leaflet.css'),
            import('react-leaflet'),
        ]).then(([leaflet, , reactLeaflet]) => {
                if (!isMounted) {
                    return;
                }

                setMarkerIcon(
                    leaflet.icon({
                        iconUrl:
                            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        iconRetinaUrl:
                            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                        shadowUrl:
                            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                    }),
                );
                setLeafletModules({
                    MapContainer: reactLeaflet.MapContainer,
                    Marker: reactLeaflet.Marker,
                    TileLayer: reactLeaflet.TileLayer,
                    useMap: reactLeaflet.useMap,
                    useMapEvents: reactLeaflet.useMapEvents,
                });
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                    <label className="block text-[11px] font-semibold text-[#4A4A4A]">
                        Titik Lokasi
                    </label>
                    <p className="mt-1 text-[11px] text-[#8A6B62]">
                        Klik map atau drag pin ke titik rumah.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onUseCurrentLocation}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#EADBD8] bg-white px-3 py-2 text-[11px] font-bold text-[#4A4A4A] transition-colors hover:border-[#B6574B] hover:bg-[#FAF9F6]"
                >
                    <LocateFixed size={14} /> Gunakan Lokasi Saat Ini
                </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#EADBD8] bg-[#FAF9F6]">
                {leafletModules && markerIcon ? (
                    <ClientMap
                        hasCoordinates={hasCoordinates}
                        markerIcon={markerIcon}
                        modules={leafletModules}
                        onChange={onChange}
                        position={position}
                    />
                ) : (
                    <div className="flex h-[320px] w-full items-center justify-center text-[12px] font-medium text-[#8A6B62]">
                        Memuat peta...
                    </div>
                )}
            </div>
            {hasCoordinates && (
                <p className="mt-2 text-[11px] text-[#8A6B62]">
                    Koordinat: {latitude}, {longitude}
                </p>
            )}
            {error && (
                <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">
                    {error}
                </p>
            )}
        </div>
    );
}

function ClientMap({
    hasCoordinates,
    markerIcon,
    modules,
    onChange,
    position,
}: {
    hasCoordinates: boolean;
    markerIcon: Icon;
    modules: ReactLeafletModules;
    onChange: (latitude: number, longitude: number) => void;
    position: [number, number];
}) {
    const { MapContainer, Marker, TileLayer } = modules;
    const zoom = hasCoordinates ? 17 : 12;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom
            className="h-[320px] w-full"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} modules={modules} zoom={zoom} />
            <MapClickHandler modules={modules} onChange={onChange} />
            {hasCoordinates && (
                <Marker
                    draggable
                    icon={markerIcon}
                    position={position}
                    eventHandlers={{
                        dragend: (event) => {
                            const marker = event.target;
                            const nextPosition = marker.getLatLng() as LatLng;

                            onChange(nextPosition.lat, nextPosition.lng);
                        },
                    }}
                />
            )}
        </MapContainer>
    );
}

function MapUpdater({
    center,
    modules,
    zoom,
}: {
    center: [number, number];
    modules: ReactLeafletModules;
    zoom: number;
}) {
    const map = modules.useMap() as LeafletMap;

    useEffect(() => {
        map.invalidateSize();
        map.setView(center, zoom);
    }, [center, map, zoom]);

    return null;
}

function MapClickHandler({
    modules,
    onChange,
}: {
    modules: ReactLeafletModules;
    onChange: (latitude: number, longitude: number) => void;
}) {
    modules.useMapEvents({
        click: (event: LeafletMouseEvent) => {
            onChange(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

function InputBlock({
    label,
    value,
    onChange,
    placeholder,
    error,
    readOnly = false,
}: FieldProps) {
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
                readOnly={readOnly}
                className={`w-full rounded-md border border-[#EADBD8] px-4 py-2.5 text-[13px] text-[#333] transition-all focus:border-[#B6574B] focus:ring-1 focus:ring-[#B6574B] focus:outline-none ${
                    readOnly ? 'bg-[#FAF9F6] text-[#8A6B62]' : 'bg-white'
                }`}
            />
            {error && (
                <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">
                    {error}
                </p>
            )}
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
                className="w-full resize-none rounded-md border border-[#EADBD8] bg-white px-4 py-2.5 text-[13px] text-[#333] transition-all focus:border-[#B6574B] focus:ring-1 focus:ring-[#B6574B] focus:outline-none"
            />
            {error && (
                <p className="mt-1.5 text-[11px] font-medium text-[#B24B4B]">
                    {error}
                </p>
            )}
        </div>
    );
}
