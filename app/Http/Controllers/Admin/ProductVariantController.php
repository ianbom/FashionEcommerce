<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Admin\ProductVariantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductVariantController extends Controller
{
    public function index(Request $request, ProductVariantService $variants, ?Product $product = null): Response
    {
        return inertia('admin/product-variants/index', $variants->indexData($request, $product));
    }

    public function create(Request $request, ProductVariantService $variants): Response
    {
        return inertia('admin/product-variants/form', [
            'mode' => 'create',
            'variant' => null,
            'products' => $variants->productOptions(),
            'selectedProductId' => $request->integer('product_id') ?: null,
        ]);
    }

    public function store(ProductVariantRequest $request, ProductVariantService $variants): RedirectResponse
    {
        $variant = $variants->create($request);

        return redirect()->route('admin.product-variants.edit', $variant)->with('success', 'Variant berhasil dibuat.');
    }

    public function edit(ProductVariant $productVariant, ProductVariantService $variants): Response
    {
        return inertia('admin/product-variants/form', [
            'mode' => 'edit',
            'variant' => $variants->formData($productVariant),
            'products' => $variants->productOptions(),
            'selectedProductId' => null,
        ]);
    }

    public function update(ProductVariantRequest $request, ProductVariant $productVariant, ProductVariantService $variants): RedirectResponse
    {
        $variants->update($productVariant, $request);

        return redirect()->route('admin.product-variants.edit', $productVariant)->with('success', 'Variant berhasil diperbarui.');
    }

    public function destroy(ProductVariant $productVariant, ProductVariantService $variants): RedirectResponse
    {
        $message = $variants->delete($productVariant);

        return redirect()->route('admin.product-variants.index')->with('success', $message);
    }
}
