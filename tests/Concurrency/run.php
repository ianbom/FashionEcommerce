<?php

use App\Actions\Payments\ManageManualPaymentAction;
use App\Actions\Payments\SyncMidtransPaymentAction;
use App\Models\BiteshipWebhookLog;
use App\Models\Cart;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Admin\ShipmentManagementService;
use App\Services\Customer\CheckoutService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

function check(bool $condition, string $message): void
{
    if (! $condition) {
        throw new RuntimeException($message);
    }
}

function fakeRates(): array
{
    return ['pricing' => [['courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'duration' => '2 days', 'price' => 1000]]];
}

if (($argv[1] ?? '') === 'worker') {
    [$script, $mode, $database, $scenario, $recordId, $signal, $operation] = $argv;
    $app = require __DIR__.'/bootstrap.php';
    Http::fake([
        'api.biteship.com/v1/rates/couriers' => Http::response(fakeRates()),
        'app.sandbox.midtrans.com/snap/v1/transactions' => function ($request) use ($signal) {
            check($request->data()['enabled_payments'] === ['bca_va'], 'Snap did not bind the selected checkout method.');
            file_put_contents($signal.'.http', "POST\n", FILE_APPEND | LOCK_EX);
            usleep(400000);

            return Http::response(['token' => 'parallel-snap', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v3/redirection/parallel-snap'], 201);
        },
        'api.biteship.com/v1/orders' => function () use ($signal) {
            file_put_contents($signal.'.http', "POST\n", FILE_APPEND | LOCK_EX);
            usleep(400000);

            return Http::response(['id' => 'parallel-booking', 'status' => 'confirmed']);
        },
    ]);
    file_put_contents($signal.'.ready.'.$operation, 'ready');
    $deadline = microtime(true) + 15;
    while (! is_file($signal.'.go')) {
        check(microtime(true) < $deadline, 'Worker barrier timeout.');
        usleep(10000);
    }
    try {
        if ($scenario === 'confirm' || $scenario === 'cancel') {
            $payment = Payment::query()->findOrFail($recordId);
            $action = app(ManageManualPaymentAction::class);
            $scenario === 'cancel' && $operation === 'b' ? $action->cancel($payment) : $action->confirm($payment);
        } elseif (in_array($scenario, ['midtrans-settlement', 'midtrans-cancel'], true)) {
            $payment = Payment::query()->findOrFail($recordId);
            app(SyncMidtransPaymentAction::class)->applyPayload($payment, [
                'order_id' => $payment->midtrans_order_id, 'gross_amount' => '11000.00', 'status_code' => '200',
                'transaction_status' => $scenario === 'midtrans-cancel' && $operation === 'b' ? 'cancel' : 'settlement',
            ], 'concurrency_test');
        } elseif ($scenario === 'checkout') {
            $customer = User::query()->findOrFail($recordId);
            $address = $customer->addresses()->firstOrFail();
            $service = app(CheckoutService::class);
            $rates = $service->shippingRates($customer, $address->id);
            $service->selectShippingRate($rates[0]['id']);
            $service->placeOrder($customer, ['customer_address_id' => $address->id, 'shipping_rate_id' => $rates[0]['id'], 'idempotency_key' => 'parallel-checkout', 'payment_method' => 'bca_va']);
        } elseif ($scenario === 'booking') {
            $request = new class extends Request
            {
                public function validated(): array
                {
                    return ['courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler'];
                }
            };
            app(ShipmentManagementService::class)->createFromOrder($request, Order::query()->findOrFail($recordId));
        } elseif ($scenario === 'receipt') {
            app(ShipmentManagementService::class)->processWebhook(BiteshipWebhookLog::query()->findOrFail($recordId));
        }
        echo "accepted\n";
    } catch (ValidationException $exception) {
        echo "rejected\n";
    }
    exit(0);
}

$database = 'fashion_ecommerce_test_'.bin2hex(random_bytes(8));
$server = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$server->exec("CREATE DATABASE `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$temporaryFiles = [];
$processes = [];
try {
    $app = require __DIR__.'/bootstrap.php';
    check(app()->environment('testing') && DB::connection()->getDatabaseName() === $database, 'Database isolation failed.');
    $app->make(Kernel::class)->call('migrate', ['--force' => true, '--database' => 'mysql']);
    foreach (['store_name' => 'Test', 'store_phone' => '081234567890', 'origin_address' => 'Synthetic address', 'store_postal_code' => '60111', 'store_latitude' => '-7.28', 'store_longitude' => '112.80', 'origin_biteship_area_id' => 'IDNP-TEST'] as $key => $value) {
        SiteSetting::query()->create(compact('key', 'value'));
    }
    foreach (['confirm', 'cancel', 'checkout', 'booking', 'receipt', 'midtrans-settlement', 'midtrans-cancel'] as $scenario) {
        $customer = User::factory()->create();
        $product = Product::query()->create(['name' => $scenario, 'slug' => $scenario, 'sku' => strtoupper($scenario), 'base_price' => 10000, 'weight' => 200, 'status' => 'published']);
        $variant = $product->variants()->create(['sku' => strtoupper($scenario).'-M', 'stock' => 10, 'reserved_stock' => $scenario === 'checkout' ? 0 : 1, 'is_active' => true]);
        $order = Order::query()->create(['user_id' => $customer->id, 'order_number' => 'PARALLEL-'.$scenario, 'customer_name' => $customer->name, 'customer_email' => $customer->email, 'customer_phone' => '081234567890', 'subtotal' => 10000, 'shipping_cost' => 1000, 'grand_total' => 11000, 'payment_status' => in_array($scenario, ['booking', 'receipt'], true) ? 'paid' : 'pending', 'order_status' => in_array($scenario, ['booking', 'receipt'], true) ? 'paid' : 'pending_payment']);
        $order->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'quantity' => 1, 'price' => 10000, 'subtotal' => 10000, 'weight' => 200]);
        $payment = $order->payment()->create(['payment_provider' => 'manual', 'transaction_status' => 'pending', 'gross_amount' => 11000, 'currency' => 'IDR']);
        if (str_starts_with($scenario, 'midtrans-')) {
            $payment->update(['payment_provider' => 'midtrans', 'midtrans_order_id' => $order->order_number]);
        }
        $address = ['recipient_name' => 'Test', 'recipient_phone' => '081234567890', 'province' => 'Test', 'city' => 'Test', 'district' => 'Test', 'subdistrict' => 'Test', 'full_address' => 'Synthetic address', 'postal_code' => '60111', 'biteship_area_id' => 'IDNP-TEST', 'latitude' => '-7.29', 'longitude' => '112.81'];
        $order->address()->create($address);
        $recordId = $payment->id;
        if ($scenario === 'checkout') {
            CustomerAddress::query()->create(['user_id' => $customer->id, ...$address]);
            $cart = Cart::query()->create(['user_id' => $customer->id]);
            $cart->items()->create(['product_id' => $product->id, 'product_variant_id' => $variant->id, 'quantity' => 1, 'price_snapshot' => 10000]);
            $recordId = $customer->id;
        }
        if (in_array($scenario, ['booking', 'receipt'], true)) {
            $shipment = $order->shipment()->create(['shipping_provider' => 'biteship', 'courier_company' => 'jne', 'courier_type' => 'reg', 'courier_service_name' => 'Reguler', 'shipping_cost' => 1000, 'shipping_status' => $scenario === 'receipt' ? 'confirmed' : 'not_created', 'biteship_order_id' => $scenario === 'receipt' ? 'parallel-receipt' : null]);
            $recordId = $order->id;
            if ($scenario === 'receipt') {
                $recordId = BiteshipWebhookLog::query()->create(['biteship_order_id' => 'parallel-receipt', 'payload_hash' => hash('sha256', 'parallel'), 'payload' => ['status' => 'delivered']])->id;
            }
        }
        $signal = sys_get_temp_dir().'/'.$database.'-'.$scenario;
        $processes = [];
        foreach (['a', 'b'] as $operation) {
            $pipes = [];
            $process = proc_open([PHP_BINARY, __FILE__, 'worker', $database, $scenario, (string) $recordId, $signal, $operation], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, dirname(__DIR__, 2));
            check(is_resource($process), 'Cannot start concurrency worker.');
            fclose($pipes[0]);
            $processes[] = [$process, $pipes];
            $temporaryFiles[] = $signal.'.ready.'.$operation;
        }
        $temporaryFiles[] = $signal.'.go';
        $temporaryFiles[] = $signal.'.http';
        $deadline = microtime(true) + 15;
        while (! is_file($signal.'.ready.a') || ! is_file($signal.'.ready.b')) {
            check(microtime(true) < $deadline, 'Worker startup timeout.');
            usleep(10000);
        }
        file_put_contents($signal.'.go', 'go');
        $results = [];
        foreach ($processes as [$process, $pipes]) {
            $results[] = trim(stream_get_contents($pipes[1]));
            $errors = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            check(proc_close($process) === 0, 'Worker failed: '.$errors);
        }
        $variant->refresh();
        $order->refresh();
        if ($scenario === 'confirm') {
            check($variant->stock === 9 && $variant->reserved_stock === 0 && $order->payment_status === 'paid', 'Duplicate confirmation changed stock twice.');
            check($variant->stockLogs()->count() === 1 && $order->stock_finalized_at !== null, 'Finalization must happen once.');
        } elseif ($scenario === 'cancel') {
            check($variant->reserved_stock === 0 && (($order->payment_status === 'paid' && $variant->stock === 9 && $order->stock_released_at === null) || ($order->payment_status === 'cancelled' && $variant->stock === 10 && $order->stock_finalized_at === null)), 'Concurrent cancel and confirm broke reservation ownership.');
        } elseif ($scenario === 'midtrans-settlement') {
            check($order->payment_status === 'paid' && $variant->stock === 9 && $variant->reserved_stock === 0 && $variant->stockLogs()->count() === 1, 'Concurrent settlements must finalize stock once.');
        } elseif ($scenario === 'midtrans-cancel') {
            check(($order->payment_status === 'paid' && $variant->stock === 9 && $order->stock_released_at === null)
                || ($order->payment_status === 'manual_review' && $variant->stock === 10 && $order->stock_finalized_at === null && $order->stock_released_at !== null), 'Settlement racing cancellation must preserve paid or enter review, never reconsume released stock.');
            check($variant->reserved_stock === 0, 'Concurrent settlement and cancellation left an inconsistent reservation.');
        } elseif ($scenario === 'checkout') {
            check(Order::query()->where('checkout_idempotency_key', 'parallel-checkout')->count() === 1 && $variant->reserved_stock === 1, 'Concurrent checkout duplicated an order or reservation.');
            check($cart->items()->count() === 0, 'Checked-out item was not removed.');
            $checkoutOrder = Order::query()->where('checkout_idempotency_key', 'parallel-checkout')->firstOrFail();
            check($checkoutOrder->payment->payment_provider === 'midtrans' && $checkoutOrder->payment->midtrans_snap_token === 'parallel-snap', 'Checkout did not create a Midtrans session.');
            check($checkoutOrder->payment->requested_payment_method === 'bca_va', 'Concurrent checkout lost the requested method snapshot.');
            check(count(file($signal.'.http')) === 1, 'Concurrent checkout sent duplicate Snap POST.');
        } elseif ($scenario === 'booking') {
            check(count(file($signal.'.http')) === 1 && $shipment->refresh()->biteship_order_id === 'parallel-booking', 'Concurrent booking sent duplicate POST.');
        } elseif ($scenario === 'receipt') {
            check($shipment->trackings()->count() === 1 && BiteshipWebhookLog::query()->findOrFail($recordId)->processed_at !== null, 'Receipt was not processed exactly once.');
        }
        echo $scenario.': PASS ('.implode(', ', $results).")\n";
    }
    echo "MySQL concurrency: 7 scenarios passed; providers faked.\n";
} finally {
    foreach ($processes as [$process, $pipes]) {
        if (is_resource($process)) {
            proc_terminate($process);
            foreach ($pipes as $pipe) {
                if (is_resource($pipe)) {
                    fclose($pipe);
                }
            }
            proc_close($process);
        }
    }
    foreach ($temporaryFiles as $temporaryFile) {
        if (is_file($temporaryFile)) {
            unlink($temporaryFile);
        }
    }
    if (class_exists(DB::class) && isset($app)) {
        DB::disconnect('mysql');
    }
    $server->exec("DROP DATABASE `{$database}`");
}
