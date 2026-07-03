<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\MidtransWebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function __invoke(Request $request, MidtransWebhookService $webhook): JsonResponse
    {
        $webhook->handle($request->all());

        return response()->json(['ok' => true]);
    }
}
