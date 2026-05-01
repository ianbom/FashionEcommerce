<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Integrations\BiteshipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BiteshipAreaController extends Controller
{
    public function __invoke(Request $request, BiteshipService $biteship): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['required', 'string', 'min:3', 'max:150'],
        ]);

        return response()->json([
            'areas' => $biteship->areaSearch($validated['search']),
        ]);
    }
}
