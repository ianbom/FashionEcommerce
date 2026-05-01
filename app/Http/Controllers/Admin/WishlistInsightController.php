<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Response;

class WishlistInsightController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'category_id' => $request->string('category_id')->toString(),
        ];

        $products = Product::query()
            ->with(['category:id,name', 'primaryImage'])
            ->withCount('wishlists')
            ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$filters['search']}%")
                ->orWhere('sku', 'like', "%{$filters['search']}%")))
            ->when($filters['category_id'] !== '', fn ($query) => $query->where('category_id', $filters['category_id']))
            ->having('wishlists_count', '>', 0)
            ->orderByDesc('wishlists_count')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category?->name,
                'thumbnail' => $product->primaryImage?->image_url,
                'status' => $product->status,
                'wishlists_count' => $product->wishlists_count,
            ]);

        return inertia('admin/wishlists/index', [
            'products' => $products,
            'filters' => $filters,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'recent' => Wishlist::query()
                ->with(['user:id,name,email', 'product:id,name'])
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (Wishlist $wishlist): array => [
                    'id' => $wishlist->id,
                    'customer' => $wishlist->user?->name,
                    'product' => $wishlist->product?->name,
                    'created_at' => $wishlist->created_at?->toFormattedDateString(),
                ]),
        ]);
    }
}
