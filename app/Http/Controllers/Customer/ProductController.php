<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\ProductBrowsingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request, ProductBrowsingService $products): Response
    {
        return Inertia::render('customer/products/list-product', $products->productListData($request));
    }

    public function show(Request $request, ProductBrowsingService $products): Response
    {
        return Inertia::render('customer/products/detail-product', $products->productDetailData($request));
    }
}
