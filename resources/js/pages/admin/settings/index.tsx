import { Head, Link, useForm } from '@inertiajs/react';
import type { Icon, LatLng, LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { LocateFixed, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import biteshipAreas from '@/actions/App/Http/Controllers/Customer/BiteshipAreaController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type SettingField = {
    key: string;
    label: string;
    type: string;
    input?: 'email' | 'number' | 'select' | 'textarea' | 'url';
    options?: string[];
};

type SettingSection = {
    title: string;
    description: string;
    fields: SettingField[];
};

type Props = {
    activeSection: string;
    sections: Record<string, SettingSection>;
    values: Record<string, string | null>;
};

type BiteshipArea = {
    id: string;
    name: string | null;
    administrative_division_level_1_name: string | null;
    administrative_division_level_2_name: string | null;
    administrative_division_level_3_name: string | null;
    postal_code: string | null;
    latitude: number | string | null;
    longitude: number | string | null;
};

type ReactLeafletModules = {
    MapContainer: typeof MapContainer;
    Marker: typeof Marker;
    TileLayer: typeof TileLayer;
    useMap: typeof useMap;
    useMapEvents: typeof useMapEvents;
};

const sectionLinks: Record<string, string> = {
    store: '/admin/settings/store',
    contact: '/admin/settings/contact',
    payment: '/admin/settings/payment',
    shipping: '/admin/settings/shipping',
};

const DEFAULT_MAP_CENTER: [number, number] = [-7.257472, 112.752088];

const formatCoordinate = (value: number): string => value.toFixed(7);

const asString = (value: unknown): string =>
    value === null || value === undefined ? '' : String(value);

const validCoordinates = (latitude: number, longitude: number): boolean =>
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

export default function AdminSettingsIndex({
    activeSection,
    sections,
    values,
}: Props) {
    const coordinateInputProps = (field: SettingField) => {
        if (field.key === 'store_latitude') {
            return { max: 90, min: -90, step: 'any' };
        }

        if (field.key === 'store_longitude') {
            return { max: 180, min: -180, step: 'any' };
        }

        return {};
    };

    const current = sections[activeSection];
    const initialData = current.fields.reduce<Record<string, string>>(
        (carry, field) => {
            carry[field.key] = asString(values[field.key]);

            return carry;
        },
        {},
    );

    const {
        data,
        setData,
        put,
        processing,
        errors,
        recentlySuccessful,
        transform,
    } = useForm<Record<string, string>>(initialData);
    const [areaSelectionLabel, setAreaSelectionLabel] = useState('');
    const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
    const [areaLoading, setAreaLoading] = useState(false);
    const [areaError, setAreaError] = useState('');
    const [mapError, setMapError] = useState('');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        transform((data) =>
            Object.fromEntries(
                Object.entries(data).map(([key, value]) => [
                    key,
                    asString(value),
                ]),
            ),
        );
        put('/admin/settings', {
            preserveScroll: true,
            onFinish: () => transform((data) => data),
        });
    };

    useEffect(() => {
        if (activeSection !== 'shipping') {
            return;
        }

        const query = asString(data.store_postal_code).trim();

        if (query.length < 3 || query === areaSelectionLabel) {
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            setAreaLoading(true);
            setAreaError('');

            try {
                const response = await fetch(
                    biteshipAreas.url({ query: { search: query } }),
                    {
                        headers: { Accept: 'application/json' },
                        signal: controller.signal,
                    },
                );
                const payload = await response.json();

                if (!response.ok) {
                    setAreaError(
                        payload.message ?? 'Gagal mencari area Biteship.',
                    );
                    setAreaResults([]);

                    return;
                }

                setAreaResults(payload.areas ?? []);
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                setAreaError('Gagal terhubung ke Biteship.');
                setAreaResults([]);
            } finally {
                setAreaLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            window.clearTimeout(timeout);
        };
    }, [activeSection, data.store_postal_code, areaSelectionLabel]);

    const chooseArea = (area: BiteshipArea) => {
        const label = area.postal_code ?? area.name ?? area.id;
        const latitude = Number(area.latitude);
        const longitude = Number(area.longitude);
        const nextData = {
            ...data,
            store_postal_code: asString(
                area.postal_code ?? data.store_postal_code,
            ),
            origin_biteship_area_id: area.id,
            origin_province:
                area.administrative_division_level_1_name ??
                data.origin_province ??
                '',
            origin_city:
                area.administrative_division_level_2_name ??
                data.origin_city ??
                '',
            origin_district:
                area.administrative_division_level_3_name ??
                data.origin_district ??
                '',
        };

        setData(
            validCoordinates(latitude, longitude)
                ? {
                      ...nextData,
                      store_latitude: formatCoordinate(latitude),
                      store_longitude: formatCoordinate(longitude),
                  }
                : nextData,
        );
        setAreaSelectionLabel(label);
        setAreaResults([]);
        setAreaError('');
    };

    const updateCoordinates = (latitude: number, longitude: number) => {
        if (!validCoordinates(latitude, longitude)) {
            setMapError('Koordinat tidak valid. Pilih titik lain di map.');

            return;
        }

        setData({
            ...data,
            store_latitude: formatCoordinate(latitude),
            store_longitude: formatCoordinate(longitude),
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

    const renderField = (field: SettingField) => (
        <div
            key={field.key}
            className={cn(
                'grid gap-2',
                field.input === 'textarea' && 'md:col-span-2',
            )}
        >
            <Label htmlFor={field.key}>{field.label}</Label>

            {field.input === 'textarea' ? (
                <textarea
                    id={field.key}
                    value={asString(data[field.key])}
                    onChange={(event) => setData(field.key, event.target.value)}
                    className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            ) : field.input === 'select' ? (
                <select
                    id={field.key}
                    value={asString(data[field.key])}
                    onChange={(event) => setData(field.key, event.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="">Select option</option>
                    {field.options?.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <Input
                    id={field.key}
                    type={field.input ?? 'text'}
                    {...coordinateInputProps(field)}
                    value={asString(data[field.key])}
                    onChange={(event) => setData(field.key, event.target.value)}
                />
            )}

            <InputError message={errors[field.key]} />
        </div>
    );

    const renderShippingFields = () => (
        <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="store_postal_code">Store Postal Code</Label>
                <div className="relative">
                    <Input
                        id="store_postal_code"
                        value={asString(data.store_postal_code)}
                        onChange={(event) => {
                            const value = event.target.value;

                            setData('store_postal_code', value);
                            setAreaSelectionLabel('');

                            if (value.trim().length < 3) {
                                setAreaResults([]);
                            }
                        }}
                    />
                    {areaResults.length > 0 ? (
                        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-background shadow-lg">
                            {areaResults.map((area) => (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => chooseArea(area)}
                                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                >
                                    <span className="font-medium">
                                        {area.postal_code ?? area.id}
                                    </span>
                                    <span className="block text-xs text-muted-foreground">
                                        {[
                                            area.name,
                                            area.administrative_division_level_3_name,
                                            area.administrative_division_level_2_name,
                                            area.administrative_division_level_1_name,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
                <InputError
                    message={
                        errors.store_postal_code ||
                        areaError ||
                        (areaLoading ? 'Mencari area Biteship...' : '')
                    }
                />
            </div>

            {[
                ['origin_province', 'Origin Province'],
                ['origin_city', 'Origin City'],
                ['origin_district', 'Origin District'],
                ['origin_biteship_area_id', 'Origin Biteship Area ID'],
            ].map(([key, label]) => (
                <div key={key} className="grid gap-2">
                    <Label htmlFor={key}>{label}</Label>
                    <Input id={key} value={asString(data[key])} readOnly />
                    <InputError message={errors[key]} />
                </div>
            ))}

            <div className="grid gap-2 md:col-span-2">
                <Label>Titik Lokasi Store</Label>
                <LocationPicker
                    latitude={asString(data.store_latitude)}
                    longitude={asString(data.store_longitude)}
                    error={
                        mapError ||
                        errors.store_latitude ||
                        errors.store_longitude
                    }
                    onChange={updateCoordinates}
                    onUseCurrentLocation={useCurrentLocation}
                />
            </div>

            {current.fields
                .filter(
                    (field) =>
                        ![
                            'store_postal_code',
                            'origin_province',
                            'origin_city',
                            'origin_district',
                            'origin_biteship_area_id',
                            'store_latitude',
                            'store_longitude',
                        ].includes(field.key),
                )
                .map(renderField)}
        </div>
    );

    return (
        <>
            <Head title="Admin Settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Settings
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {current.title}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            {current.description}
                        </p>
                    </div>

                    {recentlySuccessful ? (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            Settings tersimpan
                        </span>
                    ) : null}
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <Card className="h-fit py-3">
                        <CardContent className="flex flex-col gap-1 px-3">
                            {Object.entries(sections).map(([key, section]) => (
                                <Button
                                    key={key}
                                    asChild
                                    variant={
                                        key === activeSection
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className={cn(
                                        'justify-start',
                                        key === activeSection &&
                                            'bg-primary/10 text-primary hover:bg-primary/15',
                                    )}
                                >
                                    <Link
                                        href={
                                            sectionLinks[key] ??
                                            '/admin/settings'
                                        }
                                    >
                                        {section.title}
                                    </Link>
                                </Button>
                            ))}
                            <Button
                                asChild
                                variant="ghost"
                                className="justify-start"
                            >
                                <Link href="/admin/admin-users">
                                    Admin Users
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{current.title}</CardTitle>
                            <CardDescription>
                                Sensitive API keys seperti Midtrans server key
                                dan Biteship API key tetap dikelola dari file
                                environment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {activeSection === 'shipping' ? (
                                    renderShippingFields()
                                ) : (
                                    <div className="grid gap-5 md:grid-cols-2">
                                        {current.fields.map(renderField)}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 border-t pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href="/admin/dashboard">
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save />
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Settings'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function LocationPicker({
    latitude,
    longitude,
    error,
    onChange,
    onUseCurrentLocation,
}: {
    latitude: string;
    longitude: string;
    error?: string;
    onChange: (latitude: number, longitude: number) => void;
    onUseCurrentLocation: () => void;
}) {
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
                <p className="text-sm text-muted-foreground">
                    Klik map atau drag pin ke titik pickup.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onUseCurrentLocation}
                >
                    <LocateFixed />
                    Gunakan Lokasi Saat Ini
                </Button>
            </div>
            <div className="overflow-hidden rounded-md border bg-muted">
                {leafletModules && markerIcon ? (
                    <ClientMap
                        hasCoordinates={hasCoordinates}
                        markerIcon={markerIcon}
                        modules={leafletModules}
                        onChange={onChange}
                        position={position}
                    />
                ) : (
                    <div className="flex h-[320px] w-full items-center justify-center text-sm text-muted-foreground">
                        Memuat peta...
                    </div>
                )}
            </div>
            {hasCoordinates ? (
                <p className="mt-2 text-xs text-muted-foreground">
                    Koordinat: {latitude}, {longitude}
                </p>
            ) : null}
            {error ? <InputError message={error} /> : null}
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
            {hasCoordinates ? (
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
            ) : null}
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
