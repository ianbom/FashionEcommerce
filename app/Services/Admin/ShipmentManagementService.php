<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Shipment;
use App\Services\Integrations\BiteshipService;
use App\Services\Notifications\NotificationService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShipmentManagementService
{
    use StoresUploadedFiles;
    use ResolvesAdminPagination;

    public const SHIPPING_STATUSES = ['confirmed', 'allocated', 'picked', 'in_transit', 'delivered', 'cancelled', 'problem'];

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
            'shippingStatuses' => self::SHIPPING_STATUSES,
            'stats' => [
                'total' => Shipment::query()->count(),
                'delivered' => Shipment::query()->whereIn('shipping_status', ['delivered', 'completed'])->count(),
                'pending' => Shipment::query()->whereIn('shipping_status', ['pending', 'ready_to_ship', 'confirmed'])->count(),
                'in_transit' => Shipment::query()->whereIn('shipping_status', ['shipped', 'in_transit', 'on_hold'])->count(),
                'issues' => Shipment::query()->whereIn('shipping_status', ['failed', 'cancelled', 'returned', 'lost'])->count(),
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
            'shippingStatuses' => self::SHIPPING_STATUSES,
        ];
    }

    public function createFromOrder(Request $request, Order $order): Shipment
    {
        if ($order->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'shipment' => 'Shipment hanya bisa dibuat untuk order paid.',
            ]);
        }

        if ($order->shipment()->whereNotNull('biteship_order_id')->exists()) {
            throw ValidationException::withMessages([
                'shipment' => 'Shipment untuk order ini sudah dibuat.',
            ]);
        }

        return DB::transaction(function () use ($request, $order): Shipment {
            $payload = $request->validated();
            $labelUrl = $request->hasFile('label_photo')
                ? $this->storePublicFile($request->file('label_photo'), 'shipment-labels')
                : null;
            $order->loadMissing(['address', 'items']);
            $biteshipPayload = $this->biteshipOrderPayload($order, $payload);
            $this->validateBiteshipPayload($biteshipPayload);
            $biteshipOrder = $this->biteship->createOrder($biteshipPayload);
            $identifiers = $this->biteship->orderIdentifiers($biteshipOrder);

            $shipment = $order->shipment ?: $order->shipment()->make();
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
                'order_status' => in_array($order->order_status, ['paid', 'processing'], true) ? 'ready_to_ship' : $order->order_status,
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

            if (in_array($status, ['picked', 'in_transit'], true) && ! $shipment->shipped_at) {
                $payload['shipped_at'] = now();
            }

            if ($status === 'delivered') {
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

            if (in_array($status, ['picked', 'in_transit'], true)) {
                $orderPayload['order_status'] = 'shipped';
            }

            if ($status === 'delivered') {
                $orderPayload['order_status'] = 'delivered';
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
            $identifiers = $this->biteship->orderIdentifiers($payload);
            $status = $this->normalizeShippingStatus(
                Arr::get($payload, 'status')
                ?? Arr::get($payload, 'courier.status')
                ?? Arr::get($payload, 'tracking.status')
                ?? $shipment->shipping_status
            );

            $shipment->update([
                'biteship_order_id' => $identifiers['biteship_order_id'] ?: $shipment->biteship_order_id,
                'biteship_tracking_id' => $identifiers['biteship_tracking_id'] ?: $shipment->biteship_tracking_id,
                'waybill_id' => $identifiers['waybill_id'] ?: $shipment->waybill_id,
                'shipping_status' => $status,
                'raw_order_response' => $payload,
                'shipped_at' => in_array($status, ['picked', 'in_transit', 'shipped'], true) && ! $shipment->shipped_at ? now() : $shipment->shipped_at,
                'delivered_at' => $status === 'delivered' ? now() : $shipment->delivered_at,
                'cancelled_at' => $status === 'cancelled' ? now() : $shipment->cancelled_at,
            ]);

            $shipment->trackings()->create([
                'status' => $status,
                'description' => Arr::get($payload, 'message') ?? Arr::get($payload, 'description') ?? "Biteship status {$status}.",
                'location' => Arr::get($payload, 'location') ?? Arr::get($payload, 'courier.routing_code'),
                'happened_at' => now(),
                'raw_payload' => ['source' => $source, ...$payload],
            ]);

            $orderPayload = ['shipping_status' => $status];

            if (in_array($status, ['picked', 'in_transit', 'shipped'], true)) {
                $orderPayload['order_status'] = 'shipped';
            }

            if ($status === 'delivered') {
                $orderPayload['order_status'] = 'delivered';
            }

            if ($status === 'cancelled') {
                $orderPayload['order_status'] = 'cancelled';
            }

            $shipment->order?->update($orderPayload);
        });
    }

    private function biteshipOrderPayload(Order $order, array $payload): array
    {
        $originPostalCode = config('services.biteship.origin_postal_code') ?: $this->settings->get('store_postal_code');
        $originAreaId = config('services.biteship.origin_area_id') ?: $this->settings->get('origin_biteship_area_id');
        $destinationAreaId = $order->address?->biteship_area_id;

        return array_filter([
            'shipper_contact_name' => config('services.biteship.shipper_name') ?: $this->settings->get('shipper_name') ?: $this->settings->get('store_name'),
            'shipper_contact_phone' => config('services.biteship.shipper_phone') ?: $this->settings->get('shipper_phone') ?: $this->settings->get('store_phone'),
            'shipper_contact_email' => config('services.biteship.shipper_email') ?: $this->settings->get('store_email'),
            'shipper_organization' => $this->settings->get('store_name') ?: config('app.name'),
            'origin_contact_name' => config('services.biteship.origin_contact_name') ?: $this->settings->get('shipper_name') ?: $this->settings->get('store_name'),
            'origin_contact_phone' => config('services.biteship.origin_contact_phone') ?: $this->settings->get('shipper_phone') ?: $this->settings->get('store_phone'),
            'origin_contact_email' => config('services.biteship.origin_contact_email') ?: $this->settings->get('store_email'),
            'origin_address' => config('services.biteship.origin_address') ?: $this->settings->get('origin_address') ?: $this->settings->get('store_address'),
            'origin_note' => config('services.biteship.origin_note'),
            'origin_postal_code' => $originPostalCode ? (int) $originPostalCode : null,
            'origin_area_id' => $originAreaId,
            'destination_contact_name' => $order->address?->recipient_name ?: $order->customer_name,
            'destination_contact_phone' => $order->address?->recipient_phone ?: $order->customer_phone,
            'destination_contact_email' => $order->customer_email,
            'destination_address' => $order->address?->full_address,
            'destination_note' => $order->address?->note,
            'destination_postal_code' => $order->address?->postal_code ? (int) $order->address->postal_code : null,
            'destination_area_id' => $destinationAreaId,
            'courier_company' => $payload['courier_company'],
            'courier_type' => $payload['courier_type'],
            'courier_insurance' => 0,
            'delivery_type' => 'now',
            'order_note' => $order->notes,
            'reference_id' => $order->order_number,
            'metadata' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            'items' => $order->items->map(fn ($item): array => collect(array_filter([
                'name' => mb_substr($item->product_name, 0, 100),
                'description' => $item->variant_sku ?: $item->product_sku,
                'category' => 'fashion',
                'sku' => $item->variant_sku ?: $item->product_sku,
                'value' => (int) round((float) $item->price),
                'quantity' => $item->quantity,
                'weight' => max(1, (int) $item->weight),
                'height' => $item->height,
                'length' => $item->length,
                'width' => $item->width,
            ], fn ($value): bool => filled($value) || $value === 0))->values()->all())->values()->all(),
        ], fn ($value): bool => filled($value) || $value === 0 || is_array($value));
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

        if (blank(Arr::get($payload, 'origin_postal_code')) && blank(Arr::get($payload, 'origin_area_id'))) {
            throw ValidationException::withMessages(['shipment' => 'Origin postal code atau Biteship area ID wajib diisi.']);
        }

        if (blank(Arr::get($payload, 'destination_postal_code')) && blank(Arr::get($payload, 'destination_area_id'))) {
            throw ValidationException::withMessages(['shipment' => 'Destination postal code atau Biteship area ID wajib diisi.']);
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
            default => 'confirmed',
        };
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
