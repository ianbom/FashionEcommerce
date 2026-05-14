<?php

namespace App\Services\Customer;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class WishlistService
{
    public function wishlistPageData(User $user): array
    {
        $wishlistItems = Wishlist::query()
            ->with([
                'product:id,category_id,collection_id,name,slug,sku,base_price,sale_price,status,is_new_arrival,is_best_seller,is_featured',
                'product.category:id,name,slug',
                'product.primaryImage:id,product_id,image_url,alt_text',
                'product.images:id,product_id,image_url,alt_text,sort_order',
                'product.variants' => fn ($query) => $query
                    ->select('id', 'product_id', 'color_name', 'color_hex', 'size', 'stock', 'reserved_stock', 'image_url', 'is_active')
                    ->where('is_active', true)
                    ->orderByRaw('(stock - reserved_stock) > 0 desc')
                    ->orderBy('color_name')
                    ->orderBy('size'),
            ])
            ->where('user_id', $user->id)
            ->whereHas('product', fn ($query) => $query->where('status', 'published'))
            ->latest('id')
            ->get()
            ->map(fn (Wishlist $wishlist) => $this->wishlistCard($wishlist))
            ->filter()
            ->values()
            ->all();

        return [
            'wishlistItems' => $wishlistItems,
            'summary' => [
                'item_count' => count($wishlistItems),
            ],
        ];
    }

    public function removeWishlistItem(Wishlist $wishlist, User $user): void
    {
        $this->ownedWishlist($wishlist, $user)->delete();
    }

    public function addProduct(Product $product, User $user): Wishlist
    {
        return Wishlist::query()->firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function removeProduct(Product $product, User $user): void
    {
        Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->delete();
    }

    private function wishlistCard(Wishlist $wishlist): ?array
    {
        $product = $wishlist->product;

        if (! $product) {
            return null;
        }

        $variants = $product->variants;
        $image = $product->primaryImage?->image_url
            ?? $product->images->first()?->image_url
            ?? $variants->firstWhere('image_url', '!=', null)?->image_url;

        return [
            'id' => $wishlist->id,
            'product_id' => $product->id,
            'slug' => $product->slug,
            'title' => $product->name,
            'category' => $product->category?->name,
            'price' => (float) $product->base_price,
            'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
            'image' => $image,
            'badge' => $this->badge($product),
            'colors' => $variants
                ->filter(fn (ProductVariant $variant) => filled($variant->color_hex))
                ->unique('color_hex')
                ->values()
                ->map(fn (ProductVariant $variant) => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex,
                ]),
            'available_stock' => $variants->sum(fn (ProductVariant $variant) => max(0, $variant->stock - $variant->reserved_stock)),
            'is_available' => $product->status === 'published',
        ];
    }

    private function badge($product): ?string
    {
        return match (true) {
            $product->sale_price !== null => 'Sale',
            (bool) $product->is_new_arrival => 'New',
            (bool) $product->is_best_seller => 'Best',
            (bool) $product->is_featured => 'Featured',
            default => null,
        };
    }

    private function ownedWishlist(Wishlist $wishlist, User $user): Wishlist
    {
        $item = Wishlist::query()
            ->whereKey($wishlist->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $item) {
            $exception = new ModelNotFoundException;
            $exception->setModel(Wishlist::class, [$wishlist->id]);

            throw $exception;
        }

        return $item;
    }
}
