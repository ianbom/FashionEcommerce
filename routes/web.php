<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('/detail', 'customer/products/detail-product')->name('detail');
Route::inertia('/list', 'customer/products/list-product')->name('list');
Route::inertia('/my-cart', 'customer/cart/my-cart')->name('cart');
Route::inertia('/checkout', 'customer/checkout/checkout')->name('checkout');
Route::inertia('/my-order', 'customer/order/my-order')->name('my-order');
Route::inertia('/my-profile', 'customer/profile/my-profile')->name('my-profile');
Route::inertia('/address', 'customer/manage-address/manage-address')->name('manage-address');
Route::inertia('/notifications', 'customer/notification/list-notification')->name('notifications');

// Policy Routes
Route::inertia('/privacy-policy', 'customer/policy/privacy-policy')->name('policy.privacy');
Route::inertia('/no-return-policy', 'customer/policy/no-return-policy')->name('policy.no-return');
Route::inertia('/shipping-policy', 'customer/policy/shipping-policy')->name('policy.shipping');
Route::inertia('/terms-conditions', 'customer/policy/term-condition')->name('policy.terms');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
