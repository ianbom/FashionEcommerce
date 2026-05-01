<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use App\Services\Admin\ProductManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request, ProductManagementService $products): Response
    {
        return inertia('admin/products/index', $products->indexData($request));
    }

    public function create(ProductManagementService $products): Response
    {
        return inertia('admin/products/form', [
            'mode' => 'create',
            'product' => null,
            'options' => $products->options(),
        ]);
    }

    public function store(ProductRequest $request, ProductManagementService $products): RedirectResponse
    {
        $product = $products->create($request);

        return redirect()->route('admin.products.show', $product)->with('success', 'Product berhasil dibuat.');
    }

    public function show(Product $product, ProductManagementService $products): Response
    {
        return inertia('admin/products/show', [
            'product' => $products->showData($product),
        ]);
    }

    public function edit(Product $product, ProductManagementService $products): Response
    {
        return inertia('admin/products/form', [
            'mode' => 'edit',
            'product' => $products->formData($product),
            'options' => $products->options(),
        ]);
    }

    public function update(ProductRequest $request, Product $product, ProductManagementService $products): RedirectResponse
    {
        $products->update($product, $request);

        return redirect()->route('admin.products.show', $product)->with('success', 'Product berhasil diperbarui.');
    }

    public function publish(Product $product, ProductManagementService $products): RedirectResponse
    {
        $products->publish($product);

        return back()->with('success', 'Product berhasil dipublish.');
    }

    public function archive(Product $product, ProductManagementService $products): RedirectResponse
    {
        $products->archive($product);

        return back()->with('success', 'Product berhasil diarsipkan.');
    }

    public function duplicate(Product $product, ProductManagementService $products): RedirectResponse
    {
        $copy = $products->duplicate($product);

        return redirect()->route('admin.products.edit', $copy)->with('success', 'Product berhasil diduplikasi sebagai draft.');
    }

    public function destroy(Product $product, ProductManagementService $products): RedirectResponse
    {
        $result = $products->delete($product);

        if ($result['archived']) {
            return back()->with('success', $result['message']);
        }

        return redirect()->route('admin.products.index')->with('success', $result['message']);
    }
}
