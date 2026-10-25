<?php

use App\Models\Product;

it('orders equal values deterministically before pagination', function (string $sort, string $direction) {
    $this->freezeTime();
    $ids = [];
    foreach (range(1, 17) as $index) {
        $ids[] = Product::query()->create([
            'name' => 'Equal product', 'slug' => 'equal-'.$index, 'sku' => 'EQUAL-'.$index,
            'base_price' => $index % 2 ? 10000 : 20000, 'sale_price' => $index % 2 ? null : 10000,
            'status' => 'published', 'is_featured' => true, 'is_best_seller' => true,
        ])->id;
    }
    $expected = $direction === 'desc' ? array_reverse($ids) : $ids;
    $actual = [];
    foreach (range(1, 3) as $page) {
        $response = $this->get(route('list', ['sort' => $sort, 'order' => $direction, 'per_page' => 8, 'page' => $page]))->assertSuccessful();
        $actual = [...$actual, ...array_column($response->viewData('page')['props']['products']['data'], 'id')];
    }
    expect($actual)->toBe($expected)->and(array_unique($actual))->toHaveCount(17);
})->with(['featured', 'latest', 'name', 'price', 'best_seller'])->with(['asc', 'desc']);

it('sorts by effective sale price rather than base price', function () {
    $regular = Product::query()->create(['name' => 'Regular', 'slug' => 'regular', 'sku' => 'REGULAR', 'base_price' => 10000, 'status' => 'published']);
    $sale = Product::query()->create(['name' => 'Sale', 'slug' => 'sale', 'sku' => 'SALE', 'base_price' => 20000, 'sale_price' => 5000, 'status' => 'published']);
    $response = $this->get(route('list', ['sort' => 'price', 'order' => 'asc']))->assertSuccessful();
    expect(array_column($response->viewData('page')['props']['products']['data'], 'id'))->toBe([$sale->id, $regular->id]);
});
