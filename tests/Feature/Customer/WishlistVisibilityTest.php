<?php

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use App\Services\Customer\WishlistService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('only returns published products on the wishlist page', function () {
    $user = User::factory()->create();
    $published = createWishlistProduct('published-product', 'published');
    $draft = createWishlistProduct('draft-product', 'draft');
    $archived = createWishlistProduct('archived-product', 'archived');

    Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $published->id]);
    Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $draft->id]);
    Wishlist::query()->create(['user_id' => $user->id, 'product_id' => $archived->id]);

    $data = app(WishlistService::class)->wishlistPageData($user);

    expect($data['wishlistItems'])->toHaveCount(1)
        ->and($data['wishlistItems'][0]['slug'])->toBe('published-product')
        ->and($data['summary']['item_count'])->toBe(1);
});

function createWishlistProduct(string $slug, string $status): Product
{
    return Product::query()->create([
        'name' => str($slug)->replace('-', ' ')->title()->value(),
        'slug' => $slug,
        'sku' => str($slug)->upper()->value(),
        'base_price' => 100000,
        'status' => $status,
    ]);
}
