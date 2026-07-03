<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShippingStatus;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\Integrations\BiteshipService;
use App\Services\Notifications\NotificationService;
use App\Services\Settings\SiteSettingService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ShipmentManagementService
{
    use ResolvesAdminPagination;
    use StoresUploadedFiles;

    public function __construct(
        private readonly NotificationService $notifications,
        private readonly BiteshipService $biteship,
        private readonly SiteSettingService $settings,
    ) {}

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'courier_company' => $request->string('courier_company')->toString(),
            'courier_type' => $request->string('courier_type')->toString(),
            'shipping_status' => $request->string('shipping_status')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        return [
            'shipments' => Shipment::query()
                ->with('order:id,order_number,customer_name')
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('waybill_id', 'like', "%{$filters['search']}%")
                    ->orWhereHas('order', fn ($query) => $query->where('order_number', 'like', "%{$filters['search']}%"))))
                ->when($filters['courier_company'] !== '', fn ($query) => $query->where('courier_company', $filters['courier_company']))
                ->when($filters['courier_type'] !== '', fn ($query) => $query->where('courier_type', $filters['courier_type']))
                ->when($filters['shipping_status'] !== '', fn ($query) => $query->where('shipping_status', $filters['shipping_status']))
                ->when($filters['date_from'] !== '', fn ($query) => $query->whereDate('created_at', '>=', $filters['date_from']))
                ->when($filters['date_to'] !== '', fn ($query) => $query->whereDate('created_at', '<=', $filters['date_to']))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Shipment $shipment): array => $this->row($shipment)),
            'filters' => $filters,
            'shippingStatuses' => ShippingStatus::values(),
            'stats' => [
                'total' => Shipment::query()->count(),
                'delivered' => Shipment::query()->where('shipping_status', ShippingStatus::Delivered->value)->count(),
                'pending' => Shipment::query()->whereIn('shipping_status', [ShippingStatus::NotCreated->value, ShippingStatus::Creating->value, ShippingStatus::Confirmed->value, ShippingStatus::Allocated->value])->count(),
                'in_transit' => Shipment::query()->whereIn('shipping_status', [ShippingStatus::Picked->value, ShippingStatus::InTransit->value])->count(),
                'issues' => Shipment::query()->whereIn('shipping_status', ShippingStatus::issueValues())->count(),
                'tracked' => Shipment::query()->whereNotNull('waybill_id')->count(),
            ],
        ];
    }

    public function detailData(Shipment $shipment): array
    {
        $shipment->load([
            'order.address',
            'order.items',
            'trackings' => fn ($query) => $query->latest('happened_at'),
        ]);

        return [
            'shipment' => [
                ...$this->row($shipment),
                'shipping_provider' => $shipment->shipping_provider,
                'biteship_order_id' => $shipment->biteship_order_id,
                'biteship_tracking_id' => $shipment->biteship_tracking_id,
                'delivery_type' => $shipment->delivery_type,
                'insurance_cost' => $shipment->insurance_cost,
                'raw_rate_response' => $shipment->raw_rate_response,
                'raw_order_response' => $shipment->raw_order_response,
                'order' => $shipment->order,
                'address' => $shipment->order?->address,
                'trackings' => $shipment->trackings->map(fn ($tracking): array => [
                    'id' => $tracking->id,
                    'status' => $tracking->status,
                    'description' => $tracking->description,
                    'location' => $tracking->location,
                    'happened_at' => $tracking->happened_at?->toDateTimeString(),
                    'raw_payload' => $tracking->raw_payload,
                ]),
            ],
            'shippingStatuses' => ShippingStatus::values(),
        ];
    }

    public function createFromOrder(Request $request, Order $order): Shipment
    {
        $payload = $request->validated();
        $labelUrl = $request->hasFile('label_photo')
            ? $this->storePublicFile($request->file('label_photo'), 'shipment-labels')
            : null;

        $prepared = DB::transaction(function () use ($order, $payload): array {
            $order = Order::query()->with(['address', 'items'])->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->payment_status !== PaymentStatus::Paid->value) {
                throw ValidationException::withMessages(['shipment' => 'Shipment hanya bisa dibuat untuk order paid.']);
            }

            $shipment = Shipment::query()->where('order_id', $order->id)->lockForUpdate()->first()
                ?: $order->shipment()->create([
                    'shipping_provider' => 'biteship',
                    'courier_company' => Str::lower($payload['courier_company']),
                    'courier_type' => Str::lower($payload['courier_type']),
                    'courier_service_name' => $payload['courier_service_name'] ?? null,
                    'shipping_cost' => $order->shipping_cost,
                    'shipping_status' => ShippingStatus::NotCreated->value,
                ]);

            if (! in_array($shipment->shipping_status, ShippingStatus::retryableValues(), true)) {
                throw ValidationException::withMessages(['shipment' => "Shipment sedang {$shipment->shipping_status}."]);
            }

            $payload = $this->shipmentPayload($payload, $shipment);

            return [$order->id, $shipment->id, $payload];
        });

        [$orderId, $shipmentId, $payload] = $prepared;

        $order = Order::query()->with(['address', 'items'])->findOrFail($orderId);
        $shipment = Shipment::query()->findOrFail($shipmentId);
        $this->validateBiteshipPayload($this->biteshipOrderPayload($order, $payload));
        $payload = $this->freshRatePayload($order, $shipment, $payload);
        $biteshipPayload = $this->biteshipOrderPayload($order, $payload);
        $this->validateBiteshipPayload($biteshipPayload);

        DB::transaction(function () use ($shipment, $payload): void {
            Shipment::query()->whereKey($shipment->id)->lockForUpdate()->update([
                'courier_company' => $payload['courier_company'],
                'courier_type' => $payload['courier_type'],
                'courier_service_name' => $payload['courier_service_name'] ?? null,
                'estimated_delivery' => $payload['estimated_delivery'] ?? null,
                'raw_rate_response' => $payload['raw_rate_response'] ?? $shipment->raw_rate_response,
                'shipping_status' => ShippingStatus::Creating->value,
                'creating_at' => now(),
                'failed_reason' => null,
            ]);
        });

        try {
            $biteshipOrder = $this->biteship->createOrder($biteshipPayload);
        } catch (\Throwable $exception) {
            DB::transaction(function () use ($shipment, $exception): void {
                Shipment::query()->whereKey($shipment->id)->lockForUpdate()->update([
                    'shipping_status' => ShippingStatus::Failed->value,
                    'failed_reason' => $exception->getMessage(),
                    'last_synced_at' => now(),
                ]);
            });

            throw $exception;
        }

        return DB::transaction(function () use ($order, $shipment, $payload, $labelUrl, $biteshipOrder): Shipment {
            $shipment = Shipment::query()->whereKey($shipment->id)->lockForUpdate()->firstOrFail();
            $identifiers = $this->biteship->orderIdentifiers($biteshipOrder);

            $shipment->fill([
                'shipping_provider' => 'biteship',
                'biteship_order_id' => $identifiers['biteship_order_id'],
                'biteship_tracking_id' => $identifiers['biteship_tracking_id'],
                'waybill_id' => $identifiers['waybill_id'] ?: ($payload['waybill_id'] ?? null),
                'label_url' => $labelUrl ?: Arr::get($biteshipOrder, 'courier.link') ?: $shipment->label_url,
                'courier_company' => $payload['courier_company'],
                'courier_type' => $payload['courier_type'],
                'courier_service_name' => $payload['courier_service_name'] ?? null,
                'delivery_type' => 'now',
                'shipping_cost' => $order->shipping_cost,
                'insurance_cost' => 0,
                'estimated_delivery' => $payload['estimated_delivery'] ?? null,
                'shipping_status' => $this->normalizeShippingStatus($identifiers['shipping_status'] ?: 'confirmed'),
                'raw_rate_response' => $shipment->raw_rate_response ?: ['source' => 'admin_biteship_create', 'shipping_cost' => $order->shipping_cost],
                'raw_order_response' => $biteshipOrder,
                'last_synced_at' => now(),
            ]);
            $shipment->save();

            $shipment->trackings()->create([
                'status' => $shipment->shipping_status,
                'description' => 'Shipment created from Biteship order API.',
                'location' => $order->address?->city,
                'happened_at' => now(),
                'raw_payload' => $biteshipOrder,
            ]);

            $order->update([
                'order_status' => in_array($order->order_status, [OrderStatus::Paid->value, OrderStatus::Processing->value], true) ? OrderStatus::ReadyToShip->value : $order->order_status,
                'shipping_status' => $shipment->shipping_status,
            ]);

            $this->notifications->forOrder($order, 'Shipment created', "Shipment untuk order {$order->order_number} sudah dibuat.", 'shipping');

            return $shipment;
        });
    }

    public function updateStatus(Shipment $shipment, Request $request): void
    {
        DB::transaction(function () use ($request, $shipment): void {
            $status = $request->string('shipping_status')->toString();
            $payload = ['shipping_status' => $status];

            if (in_array($status, [ShippingStatus::Picked->value, ShippingStatus::InTransit->value], true) && ! $shipment->shipped_at) {
                $payload['shipped_at'] = now();
            }

            if ($status === ShippingStatus::Delivered->value) {
                $payload['delivered_at'] = now();
            }

            $shipment->update($payload);
            $shipment->trackings()->create([
                'status' => $status,
                'description' => $request->input('description') ?: "Shipment marked as {$status}.",
                'location' => $request->input('location'),
                'happened_at' => now(),
                'raw_payload' => ['source' => 'admin_manual_status'],
            ]);

            $orderPayload = ['shipping_status' => $status];

            if (in_array($status, [ShippingStatus::Picked->value, ShippingStatus::InTransit->value], true)) {
                $orderPayload['order_status'] = OrderStatus::Shipped->value;
            }

            if ($status === ShippingStatus::Delivered->value) {
                $orderPayload['order_status'] = OrderStatus::Delivered->value;
            }

            $shipment->order?->update($orderPayload);

            if ($shipment->order) {
                $this->notifications->forOrder($shipment->order, 'Shipment status updated', "Shipment order {$shipment->order->order_number} sekarang {$status}.", 'shipping');
            }
        });
    }

    public function refreshTracking(Shipment $shipment): void
    {
        if (filled($shipment->biteship_order_id)) {
            $payload = $this->biteship->retrieveOrder($shipment->biteship_order_id);
            $this->applyBiteshipPayload($shipment, $payload, 'admin_biteship_refresh');

            return;
        }

        $shipment->trackings()->create([
            'status' => $shipment->shipping_status,
            'description' => 'Tracking refreshed from admin dashboard.',
            'location' => null,
            'happened_at' => now(),
            'raw_payload' => ['source' => 'admin_manual_refresh'],
        ]);
    }

    public function applyBiteshipPayload(Shipment $shipment, array $payload, string $source = 'biteship'): void
    {
        DB::transaction(function () use ($shipment, $payload, $source): void {
            $shipment = Shipment::query()->with('order')->whereKey($shipment->id)->lockForUpdate()->firstOrFail();
            $payloadHash = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));

            if ($shipment->trackings()->where('payload_hash', $payloadHash)->exists()) {
                Log::info('duplicate_biteship_tracking_ignored', ['shipment_id' => $shipment->id]);

                return;
            }

            $providerHappenedAt = $this->providerHappenedAt($payload);

            if ($providerHappenedAt && $shipment->trackings()->whereNotNull('provider_happened_at')->where('provider_happened_at', '>', $providerHappenedAt)->exists()) {
                Log::info('stale_biteship_event_ignored', ['shipment_id' => $shipment->id, 'provider_happened_at' => $providerHappenedAt->toDateTimeString()]);

                return;
            }

            $identifiers = $this->biteship->orderIdentifiers($payload);
            $status = $this->normalizeShippingStatus(
                Arr::get($payload, 'status')
                ?? Arr::get($payload, 'courier.status')
                ?? Arr::get($payload, 'tracking.status')
                ?? $shipment->shipping_status
            );

            if ($shipment->shipping_status === ShippingStatus::Delivered->value && in_array($status, [ShippingStatus::Picked->value, ShippingStatus::InTransit->value, ShippingStatus::Confirmed->value, ShippingStatus::Allocated->value], true)) {
                Log::info('regressive_biteship_status_ignored', ['shipment_id' => $shipment->id, 'current' => $shipment->shipping_status, 'attempted' => $status]);

                return;
            }

            $shipment->update([
                'biteship_order_id' => $identifiers['biteship_order_id'] ?: $shipment->biteship_order_id,
                'biteship_tracking_id' => $identifiers['biteship_tracking_id'] ?: $shipment->biteship_tracking_id,
                'waybill_id' => $identifiers['waybill_id'] ?: $shipment->waybill_id,
                'shipping_status' => $status,
                'raw_order_response' => $payload,
                'shipped_at' => in_array($status, [ShippingStatus::Picked->value, ShippingStatus::InTransit->value], true) && ! $shipment->shipped_at ? now() : $shipment->shipped_at,
                'delivered_at' => $status === ShippingStatus::Delivered->value ? now() : $shipment->delivered_at,
                'cancelled_at' => $status === ShippingStatus::Cancelled->value ? now() : $shipment->cancelled_at,
            ]);

            $shipment->trackings()->create([
                'status' => $status,
                'description' => Arr::get($payload, 'message') ?? Arr::get($payload, 'description') ?? "Biteship status {$status}.",
                'location' => Arr::get($payload, 'location') ?? Arr::get($payload, 'courier.routing_code'),
                'happened_at' => now(),
                'provider_happened_at' => $providerHappenedAt,
                'payload_hash' => $payloadHash,
                'raw_payload' => ['source' => $source, ...$payload],
            ]);

            $orderPayload = ['shipping_status' => $status];

            if (in_array($status, [ShippingStatus::Picked->value, ShippingStatus::InTransit->value], true)) {
                $orderPayload['order_status'] = OrderStatus::Shipped->value;
            }

            if ($status === ShippingStatus::Delivered->value) {
                $orderPayload['order_status'] = OrderStatus::Delivered->value;
            }

            if ($status === ShippingStatus::Cancelled->value) {
                $orderPayload['order_status'] = OrderStatus::Cancelled->value;
            }

            if ($status === ShippingStatus::Problem->value) {
                $orderPayload['order_status'] = OrderStatus::ShipmentProblem->value;
            }

            if ($status === ShippingStatus::Lost->value) {
                $orderPayload['order_status'] = OrderStatus::Lost->value;
            }

            if ($status === ShippingStatus::Returned->value) {
                $orderPayload['order_status'] = OrderStatus::Returned->value;
            }

            if ($status === ShippingStatus::Failed->value) {
                $orderPayload['order_status'] = OrderStatus::ShipmentFailed->value;
            }

            $shipment->order?->update($orderPayload);
        });
    }

    private function biteshipOrderPayload(Order $order, array $payload): array
    {
        $originPostalCode = $this->setting('store_postal_code', config('services.biteship.origin_postal_code'));
        $originAreaId = $this->validBiteshipAreaId($this->setting('origin_biteship_area_id', config('services.biteship.origin_area_id')));
        $destinationAreaId = $this->validBiteshipAreaId($order->address?->biteship_area_id);
        $destinationNote = data_get($order->address, 'address_note') ?: $order->address?->note;
        $originCoordinate = $this->coordinatePair($this->setting('store_latitude'), $this->setting('store_longitude'));
        $destinationCoordinate = $this->coordinatePair($order->address?->latitude, $order->address?->longitude);

        return array_filter([
            'shipper_contact_name' => $this->setting('shipper_name', config('services.biteship.shipper_name')) ?: $this->settings->get('store_name'),
            'shipper_contact_phone' => $this->setting('shipper_phone', config('services.biteship.shipper_phone')) ?: $this->settings->get('store_phone'),
            'shipper_contact_email' => $this->setting('store_email', config('services.biteship.shipper_email')),
            'shipper_organization' => $this->settings->get('store_name') ?: config('app.name'),
            'origin_contact_name' => $this->setting('shipper_name', config('services.biteship.origin_contact_name')) ?: $this->settings->get('store_name'),
            'origin_contact_phone' => $this->setting('shipper_phone', config('services.biteship.origin_contact_phone')) ?: $this->settings->get('store_phone'),
            'origin_contact_email' => $this->setting('store_email', config('services.biteship.origin_contact_email')),
            'origin_address' => $this->setting('origin_address', config('services.biteship.origin_address')) ?: $this->settings->get('store_address'),
            'origin_note' => $this->setting('origin_note', config('services.biteship.origin_note')),
            'origin_postal_code' => $originPostalCode ? (int) $originPostalCode : null,
            'origin_area_id' => $originAreaId,
            'origin_coordinate' => $originCoordinate,
            'origin_collection_method' => $payload['origin_collection_method'] ?? 'pickup',
            'destination_contact_name' => $order->address?->recipient_name ?: $order->customer_name,
            'destination_contact_phone' => $order->address?->recipient_phone ?: $order->customer_phone,
            'destination_contact_email' => $order->customer_email,
            'destination_address' => $order->address?->full_address,
            'destination_note' => $destinationNote,
            'destination_postal_code' => $order->address?->postal_code ? (int) $order->address->postal_code : null,
            'destination_area_id' => $destinationAreaId,
            'destination_coordinate' => $destinationCoordinate,
            'courier_company' => $payload['courier_company'],
            'courier_type' => $payload['courier_type'],
            'courier_insurance' => 0,
            'delivery_type' => 'now',
            'order_note' => $order->notes,
            'reference_id' => $order->order_number,
            'metadata' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            'items' => $order->items->map(fn ($item): array => array_filter([
                'name' => mb_substr($item->product_name, 0, 100),
                'description' => $item->variant_sku ?: $item->product_sku,
                'category' => 'fashion',
                'sku' => $item->variant_sku ?: $item->product_sku,
                'value' => (int) round((float) $item->price),
                'quantity' => $item->quantity,
                'weight' => max(1, (int) ceil((float) $item->weight / max(1, (int) $item->quantity))),
                'height' => $item->height,
                'length' => $item->length,
                'width' => $item->width,
            ], fn ($value): bool => filled($value) || $value === 0))->values()->all(),
        ], fn ($value): bool => filled($value) || $value === 0 || is_array($value));
    }

    private function setting(string $key, ?string $fallback = null): ?string
    {
        return $this->settings->get($key) ?: $fallback;
    }

    private function coordinate(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private function coordinatePair(mixed $latitude, mixed $longitude): ?array
    {
        $latitude = $this->coordinate($latitude);
        $longitude = $this->coordinate($longitude);

        return $latitude !== null && $longitude !== null
            ? ['latitude' => $latitude, 'longitude' => $longitude]
            : null;
    }

    private function validBiteshipAreaId(?string $areaId): ?string
    {
        $areaId = trim((string) $areaId);

        return Str::startsWith($areaId, 'IDNP') ? $areaId : null;
    }

    private function shipmentPayload(array $payload, Shipment $shipment): array
    {
        return [
            ...$payload,
            'courier_company' => Str::lower($payload['courier_company'] ?: $shipment->courier_company),
            'courier_type' => Str::lower($payload['courier_type'] ?: $shipment->courier_type),
            'courier_service_name' => ($payload['courier_service_name'] ?? null) ?: $shipment->courier_service_name,
            'estimated_delivery' => ($payload['estimated_delivery'] ?? null) ?: $shipment->estimated_delivery,
            'origin_collection_method' => Arr::first((array) Arr::get($shipment->raw_rate_response, 'available_collection_method')) ?: 'pickup',
        ];
    }

    private function freshRatePayload(Order $order, Shipment $shipment, array $payload): array
    {
        try {
            $rate = collect($this->biteship->shippingRates([
                'postal_code' => $order->address?->postal_code,
                'biteship_area_id' => $order->address?->biteship_area_id,
                'latitude' => $order->address?->latitude,
                'longitude' => $order->address?->longitude,
            ], $this->rateItems($order)))
                ->first(fn (array $rate): bool => $this->rateMatchesOrder($rate, $order, $payload));
        } catch (ValidationException $exception) {
            $this->failShipment($shipment, 'Gagal memvalidasi ongkir. Pilih ulang ongkir atau gunakan kurir lain.');

            throw $exception;
        }

        if (! $rate) {
            $message = Str::lower((string) $payload['courier_company']) === 'paxel'
                ? 'Paket tidak sesuai dengan layanan Paxel yang dipilih. Pilih ulang ongkir.'
                : 'Kurir tidak tersedia untuk alamat ini. Pilih ulang ongkir atau gunakan kurir lain.';
            $this->failShipment($shipment, $message);

            throw ValidationException::withMessages(['shipment' => $message]);
        }

        $raw = $rate['raw'] ?? $rate;

        return [
            ...$payload,
            'courier_company' => Str::lower((string) $rate['courier_company']),
            'courier_type' => Str::lower((string) $rate['courier_type']),
            'courier_service_name' => $rate['courier_service_name'] ?? $payload['courier_service_name'] ?? null,
            'estimated_delivery' => $rate['duration'] ?? $payload['estimated_delivery'] ?? null,
            'origin_collection_method' => Arr::first((array) Arr::get($raw, 'available_collection_method')) ?: ($payload['origin_collection_method'] ?? 'pickup'),
            'raw_rate_response' => $raw,
        ];
    }

    private function rateMatchesOrder(array $rate, Order $order, array $payload): bool
    {
        if (Str::lower((string) ($rate['courier_company'] ?? '')) !== Str::lower((string) $payload['courier_company'])) {
            return false;
        }

        if (Str::lower((string) ($rate['courier_type'] ?? '')) !== Str::lower((string) $payload['courier_type'])) {
            return false;
        }

        if (filled($payload['courier_service_name'] ?? null) && Str::lower((string) ($rate['courier_service_name'] ?? '')) !== Str::lower((string) $payload['courier_service_name'])) {
            return false;
        }

        return (int) round((float) ($rate['price'] ?? 0)) === (int) round((float) $order->shipping_cost);
    }

    private function rateItems(Order $order): array
    {
        return $order->items->map(fn ($item): array => array_filter([
            'name' => mb_substr($item->product_name, 0, 100),
            'description' => $item->variant_sku ?: $item->product_sku,
            'value' => (int) round((float) $item->price),
            'quantity' => $item->quantity,
            'weight' => max(1, (int) ceil((float) $item->weight / max(1, (int) $item->quantity))),
            'length' => $item->length,
            'width' => $item->width,
            'height' => $item->height,
            'category' => 'fashion',
        ], fn ($value): bool => filled($value) || $value === 0))->values()->all();
    }

    private function failShipment(Shipment $shipment, string $message): void
    {
        DB::transaction(function () use ($shipment, $message): void {
            Shipment::query()->whereKey($shipment->id)->lockForUpdate()->update([
                'shipping_status' => ShippingStatus::Failed->value,
                'failed_reason' => $message,
                'last_synced_at' => now(),
            ]);
        });
    }

    private function validateBiteshipPayload(array $payload): void
    {
        $missing = collect([
            'origin_contact_name',
            'origin_contact_phone',
            'origin_address',
            'destination_contact_name',
            'destination_contact_phone',
            'destination_address',
            'courier_company',
            'courier_type',
            'delivery_type',
            'items',
        ])->filter(fn (string $key): bool => blank(Arr::get($payload, $key)))->values();

        if ($missing->isNotEmpty()) {
            throw ValidationException::withMessages([
                'shipment' => 'Data Biteship belum lengkap: '.$missing->implode(', '),
            ]);
        }

        if (blank(Arr::get($payload, 'origin_area_id')) || blank(Arr::get($payload, 'destination_area_id')) || blank(Arr::get($payload, 'origin_coordinate')) || blank(Arr::get($payload, 'destination_coordinate'))) {
            throw ValidationException::withMessages(['shipment' => 'Area ID dan koordinat origin/destination wajib untuk membuat pengiriman Biteship.']);
        }
    }

    private function normalizeShippingStatus(?string $status): string
    {
        return match (strtolower((string) $status)) {
            'confirmed', 'allocated', 'picking_up', 'picked_up' => 'confirmed',
            'courier_assigned' => 'allocated',
            'picked' => 'picked',
            'dropping_off', 'on_process', 'on_delivery', 'shipped' => 'in_transit',
            'delivered' => 'delivered',
            'cancelled', 'canceled' => 'cancelled',
            'failed', 'rejected' => 'failed',
            'lost' => 'lost',
            'returned' => 'returned',
            default => 'problem',
        };
    }

    private function providerHappenedAt(array $payload): ?CarbonImmutable
    {
        $value = Arr::get($payload, 'updated_at')
            ?? Arr::get($payload, 'created_at')
            ?? Arr::get($payload, 'event_time')
            ?? Arr::get($payload, 'timestamp')
            ?? Arr::get($payload, 'courier.updated_at')
            ?? Arr::get($payload, 'tracking.updated_at');

        if (! is_string($value) || blank($value)) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function row(Shipment $shipment): array
    {
        return [
            'id' => $shipment->id,
            'order_id' => $shipment->order_id,
            'order_number' => $shipment->order?->order_number,
            'customer' => $shipment->order?->customer_name,
            'waybill_id' => $shipment->waybill_id,
            'label_url' => $shipment->label_url,
            'courier_company' => $shipment->courier_company,
            'courier_type' => $shipment->courier_type,
            'courier_service_name' => $shipment->courier_service_name,
            'shipping_cost' => $shipment->shipping_cost,
            'shipping_status' => $shipment->shipping_status,
            'estimated_delivery' => $shipment->estimated_delivery,
            'shipped_at' => $shipment->shipped_at?->toDateTimeString(),
            'delivered_at' => $shipment->delivered_at?->toDateTimeString(),
            'created_at' => $shipment->created_at?->toFormattedDateString(),
        ];
    }
}
