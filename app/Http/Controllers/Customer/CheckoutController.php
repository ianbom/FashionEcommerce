<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\ApplyVoucherRequest;
use App\Http\Requests\Customer\PlaceOrderRequest;
use App\Http\Requests\Customer\ShippingRateRequest;
use App\Models\CustomerAddress;
use App\Models\User;
use App\Services\Customer\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function show(Request $request, CheckoutService $checkout): Response|RedirectResponse
    {
        $user = $this->user($request);
        $cartAvailability = $checkout->cartAvailability($user);

        if ($cartAvailability['is_empty']) {
            return redirect()->route('cart')
                ->with('warning', 'Keranjang kosong. Tambahkan produk sebelum checkout.');
        }

        if ($cartAvailability['has_unavailable_items']) {
            return redirect()->route('cart')
                ->with('warning', 'Ada produk yang habis atau stoknya tidak mencukupi. Perbarui keranjang sebelum checkout.');
        }

        if (! CustomerAddress::query()->where('user_id', $user->id)->exists()) {
            return redirect()->route('manage-address', ['redirect_to' => route('checkout', absolute: false)])
                ->with('warning', 'Tambahkan alamat pengiriman terlebih dahulu.');
        }

        return Inertia::render('customer/checkout/checkout', $checkout->pageData($user));
    }

    public function shippingRates(ShippingRateRequest $request, CheckoutService $checkout): JsonResponse
    {
        return response()->json([
            'rates' => $checkout->shippingRates($this->user($request), (int) $request->validated('customer_address_id')),
        ]);
    }

    public function selectShippingRate(ShippingRateRequest $request, CheckoutService $checkout): JsonResponse
    {
        return response()->json([
            'rate' => $checkout->selectShippingRate((string) $request->validated('shipping_rate_id')),
        ]);
    }

    public function applyVoucher(ApplyVoucherRequest $request, CheckoutService $checkout): JsonResponse
    {
        return response()->json($checkout->applyVoucher($this->user($request), (string) $request->validated('voucher_code')));
    }

    public function removeVoucher(Request $request, CheckoutService $checkout): JsonResponse
    {
        return response()->json($checkout->removeVoucher($this->user($request)));
    }

    public function placeOrder(PlaceOrderRequest $request, CheckoutService $checkout): JsonResponse
    {
        return response()->json($checkout->placeOrder($this->user($request), $request->validated()));
    }

    private function user(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }
}
