<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StockAdjustmentRequest;
use App\Models\ProductVariant;
use App\Services\Stock\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request, StockService $stock): Response
    {
        return inertia('admin/stock/index', $stock->variantsIndex($request));
    }

    public function logs(Request $request, StockService $stock): Response
    {
        return inertia('admin/stock/logs', $stock->logsIndex($request));
    }

    public function edit(ProductVariant $productVariant, StockService $stock): Response
    {
        return inertia('admin/stock/adjustment', [
            'variant' => $stock->adjustmentForm($productVariant),
        ]);
    }

    public function update(StockAdjustmentRequest $request, ProductVariant $productVariant, StockService $stock): RedirectResponse
    {
        $stock->adjust($productVariant, $request);

        return redirect()->route('admin.stock.index')->with('success', 'Stock adjustment berhasil disimpan.');
    }
}
