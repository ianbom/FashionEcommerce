<?php

use App\Models\Cart;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Vite;

if (PHP_SAPI !== 'cli-server' || ($_SERVER['REMOTE_ADDR'] ?? '') !== '127.0.0.1') {
    http_response_code(403);
    exit('Local isolated browser tests only.');
}
$public = realpath(__DIR__.'/../../public');
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$asset = realpath($public.$path);
if ($asset && str_starts_with($asset, $public.DIRECTORY_SEPARATOR) && is_file($asset) && pathinfo($asset, PATHINFO_EXTENSION) !== 'php') {
    return false;
}

require __DIR__.'/../../vendor/autoload.php';
foreach ([
    'APP_ENV' => 'testing', 'APP_URL' => 'http://127.0.0.1:8791', 'APP_DEBUG' => 'false',
    'APP_KEY' => 'base64:'.base64_encode(str_repeat('t', 32)),
    'APP_CONFIG_CACHE' => __DIR__.'/../isolated-environment/config.php',
    'APP_ROUTES_CACHE' => __DIR__.'/../isolated-environment/routes.php',
    'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => ':memory:', 'DB_URL' => '',
    'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'cookie', 'MAIL_MAILER' => 'array', 'QUEUE_CONNECTION' => 'sync',
] as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $_SERVER[$key] = $value;
}
$app = require __DIR__.'/../../bootstrap/app.php';
$app->useEnvironmentPath(__DIR__.'/../isolated-environment');
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
if (! $app->environment('testing') || config('database.default') !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
    throw new RuntimeException('Browser database isolation failed.');
}
config(['database.connections' => ['sqlite' => config('database.connections.sqlite')], 'inertia.ssr.enabled' => false, 'services.biteship.api_key' => 'synthetic-test-key', 'services.midtrans.server_key' => 'synthetic-test-key']);
Http::preventStrayRequests();
Http::fake([
    'api.biteship.com/v1/maps/areas*' => Http::response(['areas' => []]),
    'api.biteship.com/v1/rates/couriers' => Http::response(['pricing' => [['courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'duration' => '2 days', 'price' => 1000]]]),
    'api.biteship.com/v1/orders' => Http::response(['id' => 'browser-fake-booking', 'status' => 'confirmed']),
    'api.biteship.com/v1/orders/*' => fn ($request) => Http::response(['id' => basename(parse_url($request->url(), PHP_URL_PATH)), 'status' => 'confirmed']),
    'api.sandbox.midtrans.com/v2/*/status' => Http::response(['status_code' => '404'], 404),
]);
Vite::useHotFile(__DIR__.'/../isolated-environment/hot');
$kernel->call('migrate', ['--force' => true]);

$admin = User::factory()->create(['role' => 'admin', 'is_active' => true, 'email' => 'admin-browser@example.test']);
$customer = User::factory()->create(['role' => 'customer', 'is_active' => true, 'email' => 'customer-browser@example.test']);
Auth::setUser(str_starts_with($path, '/admin') ? $admin : $customer);
foreach (['store_name' => 'Browser Test', 'store_phone' => '081234567890', 'origin_address' => 'Synthetic address', 'store_postal_code' => '60111', 'store_latitude' => '-7.28', 'store_longitude' => '112.80', 'origin_biteship_area_id' => 'IDNP-TEST'] as $key => $value) {
    SiteSetting::query()->create(compact('key', 'value'));
}
$product = Product::query()->create(['name' => 'Produk Browser', 'slug' => 'produk-browser', 'sku' => 'BROWSER', 'base_price' => 10000.25, 'weight' => 200, 'status' => 'published']);
$variant = $product->variants()->create(['sku' => 'BROWSER-M', 'size' => 'M', 'stock' => 10, 'reserved_stock' => 1, 'is_active' => true]);
$cart = Cart::query()->create(['user_id' => $customer->id]);
$cart->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1, 'price_snapshot' => 10000.25]);
$address = ['recipient_name' => 'Browser', 'recipient_phone' => '081234567890', 'province' => 'Test', 'city' => 'Test', 'district' => 'Test', 'subdistrict' => 'Test', 'full_address' => 'Synthetic address', 'postal_code' => '60111', 'biteship_area_id' => 'IDNP-TEST', 'latitude' => '-7.29', 'longitude' => '112.81'];
CustomerAddress::query()->create(['user_id' => $customer->id, ...$address]);
$order = Order::query()->create(['user_id' => $customer->id, 'order_number' => 'BROWSER-ORDER', 'customer_name' => 'Browser', 'customer_email' => $customer->email, 'customer_phone' => '081234567890', 'subtotal' => 10000, 'shipping_cost' => 1000, 'grand_total' => 11000, 'payment_status' => 'paid', 'order_status' => 'lost', 'shipping_status' => 'lost']);
$order->address()->create($address);
$order->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'quantity' => 1, 'price' => 10000, 'subtotal' => 10000, 'weight' => 200]);
$order->payment()->create(['payment_provider' => 'manual', 'transaction_status' => 'settlement', 'gross_amount' => 11000, 'currency' => 'IDR']);
$shipment = $order->shipment()->create(['shipping_provider' => 'biteship', 'courier_company' => 'jne', 'courier_type' => 'reg', 'shipping_status' => 'lost', 'biteship_order_id' => 'browser-booking', 'raw_order_response' => ['courier' => ['link' => 'https://tracking.example.test/browser']]]);
$shipment->trackings()->create(['status' => 'lost', 'description' => 'Paket hilang - data sintetis', 'happened_at' => now()]);

$pending = Order::query()->create(['user_id' => $customer->id, 'order_number' => 'BROWSER-MIDTRANS', 'customer_name' => 'Browser', 'customer_email' => $customer->email, 'customer_phone' => '081234567890', 'subtotal' => 10000, 'shipping_cost' => 1000, 'grand_total' => 11000, 'payment_status' => 'pending', 'order_status' => 'pending_payment', 'shipping_status' => 'not_created']);
$pending->address()->create($address);
$pending->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'quantity' => 1, 'price' => 10000, 'subtotal' => 10000, 'weight' => 200]);
$pending->payment()->create(['payment_provider' => 'midtrans', 'midtrans_order_id' => 'BROWSER-MIDTRANS', 'midtrans_snap_token' => 'browser-snap', 'midtrans_redirect_url' => 'https://app.sandbox.midtrans.com/snap/v3/redirection/browser-snap', 'transaction_status' => 'pending', 'gross_amount' => 11000, 'currency' => 'IDR', 'expires_at' => now()->addDay(), 'raw_response' => ['snap_creation_state' => 'ready']]);

foreach (['ready', 'booked', 'uncertain', 'completed'] as $scenario) {
    $detail = Order::query()->create(['user_id' => $customer->id, 'order_number' => 'BROWSER-'.strtoupper($scenario), 'customer_name' => 'Browser', 'customer_email' => $customer->email, 'customer_phone' => '081234567890', 'subtotal' => 10000, 'shipping_cost' => 1000, 'grand_total' => 11000, 'payment_status' => 'paid', 'order_status' => $scenario === 'completed' ? 'completed' : 'ready_to_ship', 'shipping_status' => $scenario === 'completed' ? 'delivered' : 'not_created', 'paid_at' => now(), 'completed_at' => $scenario === 'completed' ? now() : null]);
    $detail->address()->create($address);
    $detail->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'quantity' => 1, 'price' => 10000, 'subtotal' => 10000, 'weight' => 200]);
    $detail->payment()->create(['payment_provider' => 'midtrans', 'midtrans_order_id' => $detail->order_number, 'transaction_status' => 'settlement', 'gross_amount' => 11000, 'currency' => 'IDR', 'paid_at' => now()]);
    $detail->shipment()->create(['shipping_provider' => 'biteship', 'courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'shipping_status' => $scenario === 'completed' ? 'delivered' : ($scenario === 'booked' ? 'confirmed' : 'not_created'), 'biteship_order_id' => in_array($scenario, ['booked', 'completed'], true) ? 'browser-'.$scenario : null, 'delivered_at' => $scenario === 'completed' ? now() : null, 'raw_order_response' => ['booking_creation_uncertain' => $scenario === 'uncertain']]);
}

$app->handleRequest(Request::capture());
