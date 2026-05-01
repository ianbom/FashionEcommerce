<?php

namespace App\Services\Admin;

use App\Models\Order;
use App\Models\Shipment;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShipmentManagementService
{
    use StoresUploadedFiles;

    public const SHIPPING_STATUSES = ['confirmed', 'allocated', 'picked', 'in_transit', 'delivered', 'cancelled', 'problem'];

    public function __construct(private readonly NotificationService $notifications) {}

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
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Shipment $shipment): array => $this->row($shipment)),
            'filters' => $filters,
            'shippingStatuses' => self::SHIPPING_STATUSES,
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

        if ($order->shipment()->exists()) {
            throw ValidationException::withMessages([
                'shipment' => 'Shipment untuk order ini sudah dibuat.',
            ]);
        }

        return DB::transaction(function () use ($request, $order): Shipment {
            $payload = $request->validated();
            $labelUrl = $this->storePublicFile($request, 'label_photo', 'shipment-labels');

            $shipment = $order->shipment()->create([
                'shipping_provider' => 'biteship',
                'biteship_order_id' => 'BS-'.$order->order_number,
                'biteship_tracking_id' => 'TRK-'.$order->order_number,
                'waybill_id' => ($payload['waybill_id'] ?? null) ?: 'WB'.$order->id.now()->format('His'),
                'label_url' => $labelUrl,
                'courier_company' => $payload['courier_company'],
                'courier_type' => $payload['courier_type'],
                'courier_service_name' => $payload['courier_service_name'] ?? null,
                'delivery_type' => 'now',
                'shipping_cost' => $order->shipping_cost,
                'insurance_cost' => 0,
                'estimated_delivery' => $payload['estimated_delivery'] ?? null,
                'shipping_status' => 'confirmed',
                'raw_rate_response' => ['source' => 'admin_manual_create', 'shipping_cost' => $order->shipping_cost],
                'raw_order_response' => ['source' => 'admin_manual_create', 'created_at' => now()->toDateTimeString()],
            ]);

            $shipment->trackings()->create([
                'status' => 'confirmed',
                'description' => 'Shipment created from admin dashboard.',
                'location' => $order->address?->city,
                'happened_at' => now(),
                'raw_payload' => ['source' => 'admin_manual_create'],
            ]);

            $order->update([
                'order_status' => in_array($order->order_status, ['paid', 'processing'], true) ? 'ready_to_ship' : $order->order_status,
                'shipping_status' => 'confirmed',
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
        $shipment->trackings()->create([
            'status' => $shipment->shipping_status,
            'description' => 'Tracking refreshed from admin dashboard.',
            'location' => null,
            'happened_at' => now(),
            'raw_payload' => ['source' => 'admin_manual_refresh'],
        ]);
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
