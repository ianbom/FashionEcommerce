<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Http;

require_once __DIR__.'/../../vendor/autoload.php';

if (! isset($database) || ! preg_match('/^fashion_ecommerce_test_[a-f0-9]{16}$/D', $database)) {
    throw new RuntimeException('Only a randomly named disposable test database is allowed.');
}
foreach ([
    'APP_ENV' => 'testing', 'APP_KEY' => 'base64:'.base64_encode(str_repeat('t', 32)),
    'APP_CONFIG_CACHE' => __DIR__.'/../isolated-environment/config.php',
    'APP_ROUTES_CACHE' => __DIR__.'/../isolated-environment/routes.php',
    'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => ':memory:', 'DB_URL' => '',
    'CACHE_STORE' => 'array', 'SESSION_DRIVER' => 'array', 'MAIL_MAILER' => 'array', 'QUEUE_CONNECTION' => 'sync',
] as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $_SERVER[$key] = $value;
}
$app = require __DIR__.'/../../bootstrap/app.php';
$app->useEnvironmentPath(__DIR__.'/../isolated-environment');
$app->make(Kernel::class)->bootstrap();
$app['config']->set('database.default', 'mysql');
$app['config']->set('database.connections', ['mysql' => [
    'driver' => 'mysql', 'host' => '127.0.0.1', 'port' => 3306, 'database' => $database,
    'username' => 'root', 'password' => '', 'unix_socket' => '', 'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci', 'prefix' => '', 'strict' => true, 'engine' => 'InnoDB',
]]);
$app['config']->set('services.biteship.api_key', 'synthetic-test-key');
$app['config']->set('services.midtrans.server_key', 'synthetic-test-key');
$app['config']->set('inertia.ssr.enabled', false);
Http::preventStrayRequests();

return $app;
