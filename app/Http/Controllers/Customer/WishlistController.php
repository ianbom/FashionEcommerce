<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use App\Services\Customer\WishlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request, WishlistService $wishlistService): Response
    {
        return Inertia::render('customer/wishlist/my-wishlist', $wishlistService->wishlistPageData($request->user()));
    }

    public function destroy(Request $request, Wishlist $wishlist, WishlistService $wishlistService): RedirectResponse
    {
        $wishlistService->removeWishlistItem($wishlist, $request->user());

        return redirect()->back()->with('success', 'Produk berhasil dihapus dari wishlist.');
    }

    public function store(Request $request, Product $product, WishlistService $wishlistService): RedirectResponse
    {
        $wishlistService->addProduct($product, $request->user());

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke wishlist.');
    }

    public function destroyProduct(Request $request, Product $product, WishlistService $wishlistService): RedirectResponse
    {
        $wishlistService->removeProduct($product, $request->user());

        return redirect()->back()->with('success', 'Produk berhasil dihapus dari wishlist.');
    }
}
