<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\AddProductVariantToCartRequest;
use App\Http\Requests\Customer\UpdateCartItemQuantityRequest;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\Customer\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Request $request, CartService $cartService): Response
    {
        return Inertia::render('customer/cart/my-cart', $cartService->cartPageData($request->user()));
    }

    public function addProductVariantToCart(
        AddProductVariantToCartRequest $request,
        ProductVariant $productVariant,
        CartService $cartService,
    ): RedirectResponse {
        $cartService->addProductVariantToCart(
            $productVariant,
            $request->user(),
            (int) $request->validated('quantity'),
        );

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function updateCartItemQuantity(
        UpdateCartItemQuantityRequest $request,
        CartItem $cartItem,
        CartService $cartService,
    ): RedirectResponse {
        $cartService->updateCartItemQuantity(
            $cartItem,
            $request->user(),
            (int) $request->validated('quantity'),
        );

        return redirect()->back()->with('success', 'Jumlah produk di keranjang berhasil diperbarui.');
    }

    public function removeCartItem(
        Request $request,
        CartItem $cartItem,
        CartService $cartService,
    ): RedirectResponse {
        $cartService->removeCartItem($cartItem, $request->user());

        return redirect()->back()->with('success', 'Produk berhasil dihapus dari keranjang.');
    }
}
