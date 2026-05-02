<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\BiteshipWebhookLog;
use App\Models\Shipment;
use App\Services\Admin\ShipmentManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class BiteshipWebhookController extends Controller
{
    public function __invoke(Request $request, ShipmentManagementService $shipments): JsonResponse
    {
        if (! $this->hasValidSecret($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->json()->all() ?: $request->all();
        $event = Arr::get($payload, 'event');
        $orderId = Arr::get($payload, 'order_id') ?? Arr::get($payload, 'id');
        $trackingId = Arr::get($payload, 'courier_tracking_id') ?? Arr::get($payload, 'courier.tracking_id');
        $waybillId = Arr::get($payload, 'courier_waybill_id') ?? Arr::get($payload, 'courier.waybill_id');

        $log = BiteshipWebhookLog::query()->create([
            'event_type' => $event,
            'biteship_order_id' => $orderId,
            'biteship_tracking_id' => $trackingId,
            'waybill_id' => $waybillId,
            'payload' => $payload,
        ]);

        $shipment = null;

        if ($orderId || $trackingId || $waybillId) {
            $shipment = Shipment::query()
                ->where(function ($query) use ($orderId, $trackingId, $waybillId): void {
                    $query
                        ->when($orderId, fn ($query) => $query->orWhere('biteship_order_id', $orderId))
                        ->when($trackingId, fn ($query) => $query->orWhere('biteship_tracking_id', $trackingId))
                        ->when($waybillId, fn ($query) => $query->orWhere('waybill_id', $waybillId));
                })
                ->first();
        }

        if ($shipment) {
            $shipments->applyBiteshipPayload($shipment, $this->toOrderPayload($payload), 'biteship_webhook');
            $log->update(['processed_at' => now()]);
        }

        return response()->json(['success' => true]);
    }

    private function hasValidSecret(Request $request): bool
    {
        $secret = config('services.biteship.webhook_secret');

        if (! filled($secret)) {
            return true;
        }

        $given = $request->header('X-Biteship-Webhook-Secret')
            ?: $request->header('X-Webhook-Secret')
            ?: $request->bearerToken()
            ?: $request->query('secret');

        return is_string($given) && hash_equals($secret, $given);
    }

    private function toOrderPayload(array $payload): array
    {
        return [
            ...$payload,
            'id' => Arr::get($payload, 'order_id') ?? Arr::get($payload, 'id'),
            'courier' => [
                'tracking_id' => Arr::get($payload, 'courier_tracking_id') ?? Arr::get($payload, 'courier.tracking_id'),
                'waybill_id' => Arr::get($payload, 'courier_waybill_id') ?? Arr::get($payload, 'courier.waybill_id'),
                'company' => Arr::get($payload, 'courier_company') ?? Arr::get($payload, 'courier.company'),
                'type' => Arr::get($payload, 'courier_type') ?? Arr::get($payload, 'courier.type'),
                'routing_code' => Arr::get($payload, 'courier_routing_code') ?? Arr::get($payload, 'courier.routing_code'),
            ],
        ];
    }
}
