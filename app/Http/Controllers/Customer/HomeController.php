<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->where('placement', 'homepage')
            ->where(function ($query) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'heroBanner' => $this->bannerCard($banners->first()),
            'promoBanner' => $this->bannerCard($banners->skip(1)->first()),
            'hajjSeries' => $this->productsForSection('hajj', 3),
            'wePresent' => $this->productsForSection('sale', 5),
            'recentAdditions' => $this->productsForSection('new', 6),
            'mostLoved' => $this->productsForSection('loved', 4),
            'journalPosts' => Page::query()
                ->where('is_active', true)
                ->latest()
                ->limit(4)
                ->get(['id', 'title', 'slug', 'type', 'created_at'])
                ->map(fn (Page $page) => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'type' => $page->type,
                    'date' => $page->created_at?->format('M d, Y'),
                ]),
        ]);
    }

    private function productsForSection(string $section, int $limit)
    {
        $query = Product::query()
            ->with($this->productRelations())
            ->where('status', 'published')
            ->limit($limit);

        match ($section) {
            'hajj' => $query
                ->where(function ($query) {
                    $query
                        ->whereHas('collection', fn ($query) => $query->where('slug', 'like', '%hajj%')->orWhere('name', 'like', '%hajj%'))
                        ->orWhereHas('category', fn ($query) => $query->where('slug', 'like', '%hajj%')->orWhere('name', 'like', '%hajj%'))
                        ->orWhere('is_featured', true);
                })
                ->orderByDesc('is_new_arrival')
                ->latest(),
            'sale' => $query->whereNotNull('sale_price')->latest(),
            'new' => $query->where('is_new_arrival', true)->latest(),
            'loved' => $query->where(function ($query) {
                $query->where('is_best_seller', true)->orWhere('is_featured', true);
            })->orderByDesc('is_best_seller')->latest(),
            default => $query->latest(),
        };

        $products = $query->get();

        if ($products->count() < $limit) {
            $fallback = Product::query()
                ->with($this->productRelations())
                ->where('status', 'published')
                ->whereNotIn('id', $products->pluck('id'))
                ->latest()
                ->limit($limit - $products->count())
                ->get();

            $products = $products->concat($fallback);
        }

        return $products->map(fn (Product $product) => $this->productCard($product))->values();
    }

    private function productRelations(): array
    {
        return [
            'category:id,name,slug',
            'collection:id,name,slug',
            'primaryImage:id,product_id,image_url,alt_text',
            'images:id,product_id,image_url,alt_text,sort_order',
            'variants' => fn ($query) => $query
                ->select('id', 'product_id', 'color_name', 'color_hex', 'size', 'stock', 'reserved_stock', 'image_url', 'is_active')
                ->where('is_active', true)
                ->orderBy('color_name')
                ->orderBy('size'),
        ];
    }

    private function productCard(Product $product): array
    {
        $variants = $product->variants;
        $image = $product->primaryImage?->image_url
            ?? $product->images->first()?->image_url
            ?? $variants->firstWhere('image_url', '!=', null)?->image_url;

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'label' => $this->label($product),
            'image' => $image,
            'category' => $product->category?->name,
            'collection' => $product->collection?->name,
            'colors' => $variants
                ->filter(fn ($variant) => filled($variant->color_hex))
                ->unique('color_hex')
                ->values()
                ->map(fn ($variant) => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex,
                ]),
        ];
    }

    private function bannerCard(?Banner $banner): ?array
    {
        if (! $banner) {
            return null;
        }

        return [
            'id' => $banner->id,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'image_desktop_url' => $banner->image_desktop_url,
            'image_mobile_url' => $banner->image_mobile_url,
            'button_text' => $banner->button_text,
            'button_url' => $banner->button_url,
        ];
    }

    private function label(Product $product): ?string
    {
        if ($product->sale_price !== null && (float) $product->base_price > 0) {
            $discount = round((1 - ((float) $product->sale_price / (float) $product->base_price)) * 100);

            return $discount > 0 ? "{$discount}%" : 'SALE';
        }

        if ($product->is_new_arrival) {
            return 'NEW';
        }

        if ($product->is_best_seller) {
            return 'BEST SELLER';
        }

        return $product->is_featured ? 'FEATURED' : null;
    }
}
