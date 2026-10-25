<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\BiteshipWebhookLog;
use App\Services\Admin\ShipmentManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class BiteshipWebhookController extends Controller
{
    public function __invoke(Request $request, ShipmentManagementService $shipments): JsonResponse
    {
        if (! $this->hasValidSecret($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $payload = $request->json()->all() ?: $request->all();
        $payloadHash = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));

        $request->validate([
            'order_id' => ['nullable', 'string', 'max:255'], 'id' => ['nullable', 'string', 'max:255'],
            'courier_tracking_id' => ['nullable', 'string', 'max:255'], 'courier_waybill_id' => ['nullable', 'string', 'max:255'],
            'courier' => ['nullable', 'array'], 'courier.tracking_id' => ['nullable', 'string', 'max:255'],
            'courier.waybill_id' => ['nullable', 'string', 'max:255'], 'status' => ['nullable', 'string', 'max:100'],
        ]);
        $log = BiteshipWebhookLog::query()->firstOrCreate(['payload_hash' => $payloadHash], [
            'event_type' => Arr::get($payload, 'event'),
            'biteship_order_id' => Arr::get($payload, 'order_id') ?? Arr::get($payload, 'id'),
            'biteship_tracking_id' => Arr::get($payload, 'courier_tracking_id') ?? Arr::get($payload, 'courier.tracking_id'),
            'waybill_id' => Arr::get($payload, 'courier_waybill_id') ?? Arr::get($payload, 'courier.waybill_id'),
            'payload' => $payload,
        ]);
        try {
            $shipments->processWebhook($log);
        } catch (\Throwable $exception) {
            Log::warning('biteship_receipt_pending', ['receipt_id' => $log->id, 'error_type' => $exception::class]);
        }

        return response()->json(['success' => true, 'pending' => $log->refresh()->processed_at === null]);
    }

    private function hasValidSecret(Request $request): bool
    {
        $secret = config('services.biteship.webhook_secret');

        if (! filled($secret)) {
            if (app()->environment(['local', 'testing']) && config('services.biteship.webhook_allow_test_bypass')) {
                return true;
            }

            Log::warning('biteship_webhook_secret_missing');

            return false;
        }

        $given = $request->header('X-Biteship-Webhook-Secret')
            ?: $request->header('X-Webhook-Secret')
            ?: $request->bearerToken();

        return is_string($given) && hash_equals($secret, $given);
    }
}
