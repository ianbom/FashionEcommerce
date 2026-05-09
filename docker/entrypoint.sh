#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ ! -d storage/framework/cache ]; then
    mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
fi

chown -R www-data:www-data storage bootstrap/cache public 2>/dev/null || true

rm -f bootstrap/cache/config.php \
    bootstrap/cache/events.php \
    bootstrap/cache/packages.php \
    bootstrap/cache/routes-v7.php \
    bootstrap/cache/services.php

if [ "${APP_ENV:-production}" != "production" ]; then
    if [ ! -d vendor ] || [ ! -f vendor/autoload.php ]; then
        composer install --no-interaction --prefer-dist
    fi

    if [ ! -d node_modules ] && [ -f package-lock.json ]; then
        npm ci
    fi

    if [ ! -f public/build/manifest.json ] && [ -f package.json ]; then
        npm run build
    fi
fi

if [ "${RUN_FRESH_SEED:-false}" = "true" ] && [ "${APP_ENV:-production}" != "production" ]; then
    php artisan migrate:fresh --seed --force
elif [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force
fi

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan package:discover --ansi || true
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

exec "$@"
