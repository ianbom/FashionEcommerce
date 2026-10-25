<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Console\Input\ArgvInput;
use Symfony\Component\Console\Output\ConsoleOutput;

require __DIR__.'/../vendor/autoload.php';

foreach ([
    'APP_ENV' => 'testing',
    'APP_KEY' => 'base64:'.base64_encode(str_repeat('t', 32)),
    'APP_CONFIG_CACHE' => __DIR__.'/isolated-environment/config.php',
    'APP_ROUTES_CACHE' => __DIR__.'/isolated-environment/routes.php',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
    'DB_URL' => '',
    'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'array',
    'MAIL_MAILER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
] as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $_SERVER[$key] = $value;
}

if (($argv[1] ?? '') !== 'wayfinder:generate') {
    throw new RuntimeException('Only isolated Wayfinder generation is permitted.');
}

$app = require __DIR__.'/../bootstrap/app.php';
$app->useEnvironmentPath(__DIR__.'/isolated-environment');
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
$app['config']->set('database.connections', ['sqlite' => $app['config']->get('database.connections.sqlite')]);
Http::preventStrayRequests();
exit($kernel->handle(new ArgvInput, new ConsoleOutput));
