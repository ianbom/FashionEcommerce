# Repository Guidelines

## Project Structure & Module Organization

This is a Laravel 13 + Inertia React ecommerce app. Backend code lives in `app/`, with controllers in `app/Http`, models in `app/Models`, jobs in `app/Jobs`, and services in `app/Services`. Routes are split across `routes/web.php`, `routes/api.php`, `routes/settings.php`, and `routes/console.php`.

Frontend code lives in `resources/js`: pages in `pages/`, shared UI in `components/`, layouts in `layouts/`, hooks in `hooks/`, and generated Wayfinder helpers in `actions/`, `routes/`, and `wayfinder/`. Styles are in `resources/css`, Blade templates in `resources/views`, public assets in `public/`, database files in `database/`, and tests in `tests/Feature` and `tests/Unit`.

## Build, Test, and Development Commands

- `composer setup` installs deps, creates `.env`, generates the app key, migrates, and builds assets.
- `composer dev` runs Laravel, queue listener, and Vite together for local development.
- `npm run dev` starts only the Vite frontend server.
- `npm run build` builds production frontend assets.
- `npm run build:ssr` builds client and SSR bundles.
- `composer test` clears config, checks PHP style, then runs Pest.
- `composer ci:check` runs lint, format, type checks, and tests.

## Coding Style & Naming Conventions

Use 4-space indentation, LF endings, UTF-8, and final newlines per `.editorconfig`; YAML uses 2 spaces. Format PHP with Pint via `composer lint`. Check React/TypeScript with ESLint and Prettier: `npm run lint:check`, `npm run format:check`, and `npm run types:check`.

Name PHP classes in PascalCase and keep namespaces aligned with paths. React components use PascalCase filenames, hooks use `useX.ts`, and tests use `*Test.php`.

## Testing Guidelines

Tests use Pest with Laravel helpers. Put HTTP/user-flow coverage in `tests/Feature`, pure logic in `tests/Unit`, and group feature tests by area such as `Admin`, `Auth`, `Customer`, or `Settings`. Cover changed behavior, including auth/permission and validation paths when relevant. Run `php artisan test` for tests only or `composer test` for style plus tests.

## Commit & Pull Request Guidelines

Recent commits are short, informal Indonesian summaries. Keep messages concise and action-oriented, e.g. `fix stok habis checkout` or `revisi tampilan produk`. Pull requests should include a summary, test results, linked issue/task when available, and screenshots for UI changes.

## Security & Configuration Tips

Never commit secrets from `.env`; update `.env.example` when adding required config. Use Laravel validation, policies, middleware, and Fortify/Sanctum patterns for auth-related changes. Regenerate Wayfinder output after route/controller signature changes so frontend calls stay typed and current.
