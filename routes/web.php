<?php

use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BiteshipWebhookLogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CollectionController;
use App\Http\Controllers\Admin\CustomerAddressController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PaymentLogController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShipmentController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\Admin\WishlistInsightController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\BiteshipAreaController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\HomeController as CustomerHomeController;
use App\Http\Controllers\Customer\MidtransWebhookController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProductController as CustomerProductController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CustomerHomeController::class, 'index'])->name('home');

Route::get('/detail', [CustomerProductController::class, 'show'])->name('detail');
Route::get('/list', [CustomerProductController::class, 'index'])->name('list');

Route::inertia('/notifications', 'customer/notification/list-notification')->name('notifications');

// Policy Routes
Route::inertia('/privacy-policy', 'customer/policy/privacy-policy')->name('policy.privacy');
Route::inertia('/no-return-policy', 'customer/policy/no-return-policy')->name('policy.no-return');
Route::inertia('/shipping-policy', 'customer/policy/shipping-policy')->name('policy.shipping');
Route::inertia('/terms-conditions', 'customer/policy/term-condition')->name('policy.terms');
Route::inertia('/admin/order-detail', 'admin/orders/order-detail')->name('detail-order-admin');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/my-profile', [ProfileController::class, 'customerEdit'])->name('my-profile');
    Route::patch('/my-profile', [ProfileController::class, 'update'])->name('my-profile.update');
    Route::get('/my-cart', [CartController::class, 'index'])->name('cart');
    Route::post('/product-variants/{productVariant}/add-to-cart', [CartController::class, 'addProductVariantToCart'])->name('cart.add-product-variant');
    Route::patch('/cart-items/{cartItem}', [CartController::class, 'updateCartItemQuantity'])->name('cart.items.update');
    Route::delete('/cart-items/{cartItem}', [CartController::class, 'removeCartItem'])->name('cart.items.destroy');
    Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
    Route::get('/my-order', [CustomerOrderController::class, 'index'])->name('my-order');
    Route::get('/my-order/{order}', [CustomerOrderController::class, 'show'])->name('order.detail');
    Route::get('/biteship/areas', BiteshipAreaController::class)->name('biteship.areas');
    Route::post('/checkout/shipping-rates', [CheckoutController::class, 'shippingRates'])->name('checkout.shipping-rates');
    Route::post('/checkout/shipping-rate', [CheckoutController::class, 'selectShippingRate'])->name('checkout.shipping-rate');
    Route::post('/checkout/voucher', [CheckoutController::class, 'applyVoucher'])->name('checkout.voucher.apply');
    Route::delete('/checkout/voucher', [CheckoutController::class, 'removeVoucher'])->name('checkout.voucher.remove');
    Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])->name('checkout.place-order');
    Route::get('/address', [AddressController::class, 'index'])->name('manage-address');
    Route::post('/address', [AddressController::class, 'store'])->name('manage-address.store');
    Route::put('/address/{customerAddress}', [AddressController::class, 'update'])->name('manage-address.update');
    Route::delete('/address/{customerAddress}', [AddressController::class, 'destroy'])->name('manage-address.destroy');
});

Route::middleware('guest')->prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AdminLoginController::class, 'create'])->name('login');
    Route::post('login', [AdminLoginController::class, 'store'])->name('login.store');
});

Route::middleware(['auth', 'admin', 'admin.activity'])->prefix('admin')->name('admin.')->group(function () {
    Route::post('logout', [AdminLoginController::class, 'destroy'])->name('logout');
    Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::post('products/{product}/publish', [ProductController::class, 'publish'])->name('products.publish');
    Route::post('products/{product}/archive', [ProductController::class, 'archive'])->name('products.archive');
    Route::post('products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('products/{product}/variants', [ProductVariantController::class, 'index'])->name('products.variants.index');

    Route::get('product-variants', [ProductVariantController::class, 'index'])->name('product-variants.index');
    Route::get('product-variants/create', [ProductVariantController::class, 'create'])->name('product-variants.create');
    Route::post('product-variants', [ProductVariantController::class, 'store'])->name('product-variants.store');
    Route::get('product-variants/{productVariant}/edit', [ProductVariantController::class, 'edit'])->name('product-variants.edit');
    Route::put('product-variants/{productVariant}', [ProductVariantController::class, 'update'])->name('product-variants.update');
    Route::delete('product-variants/{productVariant}', [ProductVariantController::class, 'destroy'])->name('product-variants.destroy');
    Route::get('product-variants/{productVariant}/stock-adjustment', [StockController::class, 'edit'])->name('product-variants.stock-adjustment');
    Route::post('product-variants/{productVariant}/stock-adjustment', [StockController::class, 'update'])->name('product-variants.stock-adjustment.update');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('collections', [CollectionController::class, 'index'])->name('collections.index');
    Route::get('collections/create', [CollectionController::class, 'create'])->name('collections.create');
    Route::post('collections', [CollectionController::class, 'store'])->name('collections.store');
    Route::get('collections/{collection}/edit', [CollectionController::class, 'edit'])->name('collections.edit');
    Route::put('collections/{collection}', [CollectionController::class, 'update'])->name('collections.update');
    Route::delete('collections/{collection}', [CollectionController::class, 'destroy'])->name('collections.destroy');

    Route::get('stock', [StockController::class, 'index'])->name('stock.index');
    Route::get('stock/logs', [StockController::class, 'logs'])->name('stock.logs');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::post('orders/{order}/notes', [OrderController::class, 'updateNotes'])->name('orders.notes');
    Route::post('orders/{order}/shipments', [ShipmentController::class, 'createFromOrder'])->name('orders.shipments.store');

    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    Route::post('payments/{payment}/sync', [PaymentController::class, 'sync'])->name('payments.sync');
    Route::get('payment-logs', [PaymentLogController::class, 'index'])->name('payment-logs.index');
    Route::get('payment-logs/{paymentLog}', [PaymentLogController::class, 'show'])->name('payment-logs.show');

    Route::get('shipments', [ShipmentController::class, 'index'])->name('shipments.index');
    Route::get('shipments/{shipment}', [ShipmentController::class, 'show'])->name('shipments.show');
    Route::post('shipments/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.status');
    Route::post('shipments/{shipment}/refresh-tracking', [ShipmentController::class, 'refreshTracking'])->name('shipments.refresh-tracking');
    Route::get('biteship-webhook-logs', [BiteshipWebhookLogController::class, 'index'])->name('biteship-webhook-logs.index');
    Route::get('biteship-webhook-logs/{biteshipWebhookLog}', [BiteshipWebhookLogController::class, 'show'])->name('biteship-webhook-logs.show');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('customers/{customer}/toggle-active', [CustomerController::class, 'toggleActive'])->name('customers.toggle-active');

    Route::get('customer-addresses', [CustomerAddressController::class, 'index'])->name('customer-addresses.index');
    Route::get('customer-addresses/{customerAddress}', [CustomerAddressController::class, 'show'])->name('customer-addresses.show');
    Route::get('customer-addresses/{customerAddress}/edit', [CustomerAddressController::class, 'edit'])->name('customer-addresses.edit');
    Route::put('customer-addresses/{customerAddress}', [CustomerAddressController::class, 'update'])->name('customer-addresses.update');
    Route::delete('customer-addresses/{customerAddress}', [CustomerAddressController::class, 'destroy'])->name('customer-addresses.destroy');

    Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
    Route::get('vouchers/create', [VoucherController::class, 'create'])->name('vouchers.create');
    Route::post('vouchers', [VoucherController::class, 'store'])->name('vouchers.store');
    Route::get('vouchers/{voucher}/edit', [VoucherController::class, 'edit'])->name('vouchers.edit');
    Route::put('vouchers/{voucher}', [VoucherController::class, 'update'])->name('vouchers.update');
    Route::delete('vouchers/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy');

    Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/create', [AdminNotificationController::class, 'create'])->name('notifications.create');
    Route::post('notifications', [AdminNotificationController::class, 'store'])->name('notifications.store');

    Route::get('wishlists', [WishlistInsightController::class, 'index'])->name('wishlists.index');

    Route::get('banners', [BannerController::class, 'index'])->name('banners.index');
    Route::get('banners/create', [BannerController::class, 'create'])->name('banners.create');
    Route::post('banners', [BannerController::class, 'store'])->name('banners.store');
    Route::get('banners/{banner}/edit', [BannerController::class, 'edit'])->name('banners.edit');
    Route::put('banners/{banner}', [BannerController::class, 'update'])->name('banners.update');
    Route::delete('banners/{banner}', [BannerController::class, 'destroy'])->name('banners.destroy');

    Route::get('pages', [PageController::class, 'index'])->name('pages.index');
    Route::get('pages/create', [PageController::class, 'create'])->name('pages.create');
    Route::post('pages', [PageController::class, 'store'])->name('pages.store');
    Route::get('pages/{page}/edit', [PageController::class, 'edit'])->name('pages.edit');
    Route::put('pages/{page}', [PageController::class, 'update'])->name('pages.update');
    Route::delete('pages/{page}', [PageController::class, 'destroy'])->name('pages.destroy');

    Route::get('settings', [SettingController::class, 'index'])->defaults('section', 'store')->name('settings.index');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('settings/store', [SettingController::class, 'index'])->defaults('section', 'store')->name('settings.store');
    Route::get('settings/seo', [SettingController::class, 'index'])->defaults('section', 'seo')->name('settings.seo');
    Route::get('settings/payment', [SettingController::class, 'index'])->defaults('section', 'payment')->name('settings.payment');
    Route::get('settings/shipping', [SettingController::class, 'index'])->defaults('section', 'shipping')->name('settings.shipping');

    Route::get('admin-users', [AdminUserController::class, 'index'])->name('admin-users.index');
    Route::get('admin-users/create', [AdminUserController::class, 'create'])->name('admin-users.create');
    Route::post('admin-users', [AdminUserController::class, 'store'])->name('admin-users.store');
    Route::get('admin-users/{adminUser}/edit', [AdminUserController::class, 'edit'])->name('admin-users.edit');
    Route::put('admin-users/{adminUser}', [AdminUserController::class, 'update'])->name('admin-users.update');

    Route::get('reports/{type}', [ReportController::class, 'index'])->whereIn('type', ['sales', 'products', 'customers', 'shipments', 'vouchers'])->name('reports.index');
    Route::get('reports/{type}/export', [ReportController::class, 'export'])->whereIn('type', ['sales', 'products', 'customers', 'shipments', 'vouchers'])->name('reports.export');
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
});

Route::post('/payments/midtrans/notification', MidtransWebhookController::class)->name('payments.midtrans.notification');

require __DIR__.'/settings.php';
