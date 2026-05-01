<?php

namespace App\Services\Customer;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function cartPageData(?User $user): array
    {
        $cartItems = $user ? $this->cartItems($user) : collect();
        $summary = $this->cartSummary($cartItems);

        return [
            'cartItems' => $cartItems->values()->all(),
            'summary' => $summary,
            'suggestedProducts' => $this->suggestedProducts(
                $cartItems->pluck('product_id')->filter()->all(),
            ),
        ];
    }

    public function getOrCreateCart(User $user): Cart
    {
        return Cart::query()->firstOrCreate([
            'user_id' => $user->id,
        ]);
    }

    public function addProductVariantToCart(ProductVariant $productVariant, User $user, int $quantity = 1): CartItem
    {
        return DB::transaction(function () use ($productVariant, $user, $quantity): CartItem {
            $variant = ProductVariant::query()
                ->with('product')
                ->whereKey($productVariant->id)
                ->lockForUpdate()
                ->firstOrFail();

            $product = $variant->product;
            $availableStock = max(0, $variant->stock - $variant->reserved_stock);

            if (! $product || $product->status !== 'published' || ! $variant->is_active || $availableStock < 1) {
                throw ValidationException::withMessages([
                    'product_variant_id' => 'Varian produk ini belum tersedia untuk dibeli.',
                ]);
            }

            $cart = $this->getOrCreateCart($user);
            $cartItem = CartItem::query()
                ->where('cart_id', $cart->id)
                ->where('product_variant_id', $variant->id)
                ->lockForUpdate()
                ->first();
            $nextQuantity = ($cartItem?->quantity ?? 0) + $quantity;

            if ($nextQuantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok tersedia hanya {$availableStock}.",
                ]);
            }

            $priceSnapshot = ($product->sale_price ?? $product->base_price) + $variant->additional_price;

            return CartItem::query()->updateOrCreate(
                [
                    'cart_id' => $cart->id,
                    'product_variant_id' => $variant->id,
                ],
                [
                    'product_id' => $product->id,
                    'quantity' => $nextQuantity,
                    'price_snapshot' => $priceSnapshot,
                ],
            );
        });
    }

    public function updateCartItemQuantity(CartItem $cartItem, User $user, int $quantity): CartItem
    {
        return DB::transaction(function () use ($cartItem, $user, $quantity): CartItem {
            $item = $this->ownedCartItem($cartItem, $user);
            $variant = ProductVariant::query()
                ->with('product')
                ->whereKey($item->product_variant_id)
                ->lockForUpdate()
                ->firstOrFail();

            $product = $variant->product;
            $availableStock = max(0, $variant->stock - $variant->reserved_stock);

            if (! $product || $product->status !== 'published' || ! $variant->is_active || $availableStock < 1) {
                throw ValidationException::withMessages([
                    'quantity' => 'Produk ini sudah tidak tersedia untuk diperbarui di keranjang.',
                ]);
            }

            if ($quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok tersedia hanya {$availableStock}.",
                ]);
            }

            $item->forceFill([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price_snapshot' => ($product->sale_price ?? $product->base_price) + $variant->additional_price,
            ])->save();

            return $item->refresh();
        });
    }

    public function removeCartItem(CartItem $cartItem, User $user): void
    {
        $this->ownedCartItem($cartItem, $user)->delete();
    }

    private function cartItems(User $user): Collection
    {
        $cart = Cart::query()
            ->with([
                'items' => fn ($query) => $query
                    ->with([
                        'product:id,name,slug,status,sale_price,base_price',
                        'product.primaryImage:id,product_id,image_url,alt_text',
                        'variant:id,product_id,sku,color_name,color_hex,size,stock,reserved_stock,additional_price,image_url,is_active',
                    ])
                    ->latest('id'),
            ])
            ->firstWhere('user_id', $user->id);

        if (! $cart) {
            return collect();
        }

        return $cart->items->map(function (CartItem $item): array {
            $product = $item->product;
            $variant = $item->variant;
            $availableStock = $variant ? max(0, $variant->stock - $variant->reserved_stock) : 0;
            $isAvailable = $product?->status === 'published'
                && (bool) $variant?->is_active
                && $availableStock > 0;

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_slug' => $product?->slug,
                'title' => $product?->name ?? 'Produk tidak tersedia',
                'color' => $variant?->color_name,
                'color_hex' => $variant?->color_hex,
                'size' => $variant?->size,
                'image' => $variant?->image_url ?? $product?->primaryImage?->image_url,
                'price' => (float) $item->price_snapshot,
                'quantity' => $item->quantity,
                'available_stock' => $availableStock,
                'is_available' => $isAvailable,
                'variant' => [
                    'id' => $variant?->id,
                    'sku' => $variant?->sku,
                ],
                'subtotal' => (float) $item->price_snapshot * $item->quantity,
            ];
        });
    }

    private function cartSummary(Collection $cartItems): array
    {
        $subtotal = (float) $cartItems->sum('subtotal');
        $shipping = 0.0;
        $discount = 0.0;

        return [
            'item_count' => (int) $cartItems->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping' => $shipping,
            'discount' => $discount,
            'total' => $subtotal + $shipping - $discount,
        ];
    }

    private function suggestedProducts(array $excludedProductIds, int $limit = 4): array
    {
        return Product::query()
            ->with([
                'primaryImage:id,product_id,image_url,alt_text',
                'variants' => fn ($query) => $query
                    ->select('id', 'product_id', 'stock', 'reserved_stock')
                    ->where('is_active', true),
            ])
            ->where('status', 'published')
            ->when($excludedProductIds !== [], fn ($query) => $query->whereNotIn('id', $excludedProductIds))
            ->orderByDesc('is_featured')
            ->orderByDesc('is_new_arrival')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->name,
                'price' => (float) ($product->sale_price ?? $product->base_price),
                'image' => $product->primaryImage?->image_url,
                'available_stock' => $product->variants->sum(
                    fn (ProductVariant $variant) => max(0, $variant->stock - $variant->reserved_stock),
                ),
            ])
            ->values()
            ->all();
    }

    private function ownedCartItem(CartItem $cartItem, User $user): CartItem
    {
        $item = CartItem::query()
            ->whereKey($cartItem->id)
            ->whereHas('cart', fn ($query) => $query->where('user_id', $user->id))
            ->first();

        if (! $item) {
            $exception = new ModelNotFoundException;
            $exception->setModel(CartItem::class, [$cartItem->id]);

            throw $exception;
        }

        return $item;
    }
}
