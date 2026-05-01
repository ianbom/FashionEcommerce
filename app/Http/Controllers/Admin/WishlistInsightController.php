<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\WishlistInsightService;
use Illuminate\Http\Request;
use Inertia\Response;

class WishlistInsightController extends Controller
{
    public function index(Request $request, WishlistInsightService $wishlists): Response
    {
        return inertia('admin/wishlists/index', $wishlists->indexData($request));
    }
}
