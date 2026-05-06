<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\MidtransWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, MidtransWebhookService $webhook): JsonResponse
    {
        Log::info('Midtrans Webhook received', $request->all());
        $webhook->handle($request->all());

        return response()->json(['ok' => true]);
    }
}
