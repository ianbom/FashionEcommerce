<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\Customer\ProductBrowsingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request, ProductBrowsingService $products): Response
    {
        return Inertia::render('welcome', $products->homeData());
    }
}
