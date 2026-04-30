<?php

use App\Http\Controllers\Admin\AdminPageController;
use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
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
Route::inertia('/my-order/detail', 'customer/order/detail-order')->name('order.detail');
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

Route::middleware('guest')->prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AdminLoginController::class, 'create'])->name('login');
    Route::post('login', [AdminLoginController::class, 'store'])->name('login.store');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::post('logout', [AdminLoginController::class, 'destroy'])->name('logout');
    Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

    Route::get('products', [AdminPageController::class, 'index'])->defaults('module', 'products')->name('products.index');
    Route::get('products/create', [AdminPageController::class, 'create'])->defaults('module', 'products')->name('products.create');
    Route::get('products/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'products')->name('products.show');
    Route::get('products/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'products')->name('products.edit');
    Route::get('products/{id}/variants', [AdminPageController::class, 'index'])->whereNumber('id')->defaults('module', 'product-variants')->name('products.variants.index');

    Route::get('product-variants', [AdminPageController::class, 'index'])->defaults('module', 'product-variants')->name('product-variants.index');
    Route::get('product-variants/create', [AdminPageController::class, 'create'])->defaults('module', 'product-variants')->name('product-variants.create');
    Route::get('product-variants/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'product-variants')->name('product-variants.show');
    Route::get('product-variants/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'product-variants')->name('product-variants.edit');
    Route::get('product-variants/{id}/stock-adjustment', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'product-variants')->name('product-variants.stock-adjustment');

    Route::get('categories', [AdminPageController::class, 'index'])->defaults('module', 'categories')->name('categories.index');
    Route::get('categories/create', [AdminPageController::class, 'create'])->defaults('module', 'categories')->name('categories.create');
    Route::get('categories/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'categories')->name('categories.show');
    Route::get('categories/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'categories')->name('categories.edit');

    Route::get('collections', [AdminPageController::class, 'index'])->defaults('module', 'collections')->name('collections.index');
    Route::get('collections/create', [AdminPageController::class, 'create'])->defaults('module', 'collections')->name('collections.create');
    Route::get('collections/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'collections')->name('collections.show');
    Route::get('collections/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'collections')->name('collections.edit');

    Route::get('stock', [AdminPageController::class, 'index'])->defaults('module', 'stock')->name('stock.index');
    Route::get('stock/logs', [AdminPageController::class, 'index'])->defaults('module', 'stock-logs')->name('stock.logs');
    Route::get('stock/logs/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'stock-logs')->name('stock.logs.show');

    Route::get('orders', [AdminPageController::class, 'index'])->defaults('module', 'orders')->name('orders.index');
    Route::get('orders/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'orders')->name('orders.show');

    Route::get('payments', [AdminPageController::class, 'index'])->defaults('module', 'payments')->name('payments.index');
    Route::get('payments/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'payments')->name('payments.show');
    Route::get('payment-logs', [AdminPageController::class, 'index'])->defaults('module', 'payment-logs')->name('payment-logs.index');
    Route::get('payment-logs/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'payment-logs')->name('payment-logs.show');

    Route::get('shipments', [AdminPageController::class, 'index'])->defaults('module', 'shipments')->name('shipments.index');
    Route::get('shipments/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'shipments')->name('shipments.show');

    Route::get('customers', [AdminPageController::class, 'index'])->defaults('module', 'customers')->name('customers.index');
    Route::get('customers/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'customers')->name('customers.show');
    Route::get('customer-addresses', [AdminPageController::class, 'index'])->defaults('module', 'customer-addresses')->name('customer-addresses.index');
    Route::get('customer-addresses/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'customer-addresses')->name('customer-addresses.show');

    Route::get('vouchers', [AdminPageController::class, 'index'])->defaults('module', 'vouchers')->name('vouchers.index');
    Route::get('vouchers/create', [AdminPageController::class, 'create'])->defaults('module', 'vouchers')->name('vouchers.create');
    Route::get('vouchers/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'vouchers')->name('vouchers.show');
    Route::get('vouchers/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'vouchers')->name('vouchers.edit');

    Route::get('notifications', [AdminPageController::class, 'index'])->defaults('module', 'notifications')->name('notifications.index');
    Route::get('notifications/create', [AdminPageController::class, 'create'])->defaults('module', 'notifications')->name('notifications.create');
    Route::get('notifications/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'notifications')->name('notifications.show');

    Route::get('banners', [AdminPageController::class, 'index'])->defaults('module', 'banners')->name('banners.index');
    Route::get('banners/create', [AdminPageController::class, 'create'])->defaults('module', 'banners')->name('banners.create');
    Route::get('banners/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'banners')->name('banners.show');
    Route::get('banners/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'banners')->name('banners.edit');

    Route::get('pages', [AdminPageController::class, 'index'])->defaults('module', 'pages')->name('pages.index');
    Route::get('pages/create', [AdminPageController::class, 'create'])->defaults('module', 'pages')->name('pages.create');
    Route::get('pages/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'pages')->name('pages.show');
    Route::get('pages/{id}/edit', [AdminPageController::class, 'edit'])->whereNumber('id')->defaults('module', 'pages')->name('pages.edit');

    Route::get('settings', [AdminPageController::class, 'index'])->defaults('module', 'settings')->name('settings.index');
    Route::get('settings/{id}', [AdminPageController::class, 'show'])->whereNumber('id')->defaults('module', 'settings')->name('settings.show');
    Route::get('settings/store', [AdminPageController::class, 'index'])->defaults('module', 'settings')->name('settings.store');
    Route::get('settings/seo', [AdminPageController::class, 'index'])->defaults('module', 'settings')->name('settings.seo');
    Route::get('settings/payment', [AdminPageController::class, 'index'])->defaults('module', 'settings')->name('settings.payment');
    Route::get('settings/shipping', [AdminPageController::class, 'index'])->defaults('module', 'settings')->name('settings.shipping');

    Route::get('reports/sales', [AdminPageController::class, 'index'])->defaults('module', 'orders')->name('reports.sales');
    Route::get('reports/products', [AdminPageController::class, 'index'])->defaults('module', 'products')->name('reports.products');
    Route::get('reports/customers', [AdminPageController::class, 'index'])->defaults('module', 'customers')->name('reports.customers');
    Route::get('reports/shipments', [AdminPageController::class, 'index'])->defaults('module', 'shipments')->name('reports.shipments');
});

require __DIR__.'/settings.php';
