<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Features;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->useEnvironmentPath(__DIR__.'/isolated-environment');
        $app->make(Kernel::class)->bootstrap();

        $connection = $app['config']->get('database.default');
        $database = $app['config']->get("database.connections.{$connection}.database");
        if (! $app->environment('testing') || $connection !== 'sqlite' || $database !== ':memory:') {
            throw new RuntimeException('Tests require the isolated SQLite memory database.');
        }
        $app['config']->set('database.connections', ['sqlite' => $app['config']->get('database.connections.sqlite')]);
        $app['config']->set('inertia.ssr.enabled', false);
        $app['config']->set('services.midtrans.server_key', 'synthetic-test-key');
        $app['config']->set('services.biteship.api_key', 'synthetic-test-key');
        Http::preventStrayRequests();

        return $app;
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
