<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
                'toast' => fn () => $this->toast($request),
            ],
            'shop' => [
                'cart_count' => fn (): int => $this->cartCount($request),
                'featured_collections' => fn (): array => $this->featuredCollections(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    private function cartCount(Request $request): int
    {
        if (! $request->user()) {
            return 0;
        }

        return (int) Cart::query()
            ->where('user_id', $request->user()->id)
            ->withSum('items', 'quantity')
            ->first()?->items_sum_quantity;
    }

    /**
     * @return list<array{id: int, name: string, slug: string}>
     */
    private function featuredCollections(): array
    {
        return Collection::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Collection $collection): array => [
                'id' => $collection->id,
                'name' => $collection->name,
                'slug' => $collection->slug,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{id: string, type: string, message: string}|null
     */
    private function toast(Request $request): ?array
    {
        foreach (['success', 'error', 'info', 'warning'] as $type) {
            $message = $request->session()->get($type);

            if ($message) {
                return [
                    'id' => (string) Str::uuid(),
                    'type' => $type,
                    'message' => $message,
                ];
            }
        }

        return null;
    }
}
