<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create(['role' => 'admin', 'is_active' => true]));
    $this->product = Product::query()->create(['name' => 'Integrity', 'slug' => 'integrity', 'sku' => 'INTEGRITY', 'base_price' => 10000, 'weight' => 200, 'status' => 'draft']);
    $this->variant = $this->product->variants()->create(['sku' => 'INTEGRITY-M', 'stock' => 10, 'reserved_stock' => 3, 'is_active' => true]);
    $this->payload = ['name' => 'Integrity', 'slug' => 'integrity', 'sku' => 'INTEGRITY', 'base_price' => 10000, 'weight' => 200, 'status' => 'draft', 'variants' => [['id' => $this->variant->id, 'sku' => 'INTEGRITY-M', 'stock' => 8, 'reserved_stock' => 0, 'is_active' => true]]];
});

it('preserves live reservations through nested and standalone updates', function (string $form) {
    if ($form === 'nested') {
        $this->put(route('admin.products.update', $this->product), $this->payload)->assertSessionHasNoErrors();
    } else {
        $this->put(route('admin.product-variants.update', $this->variant), ['product_id' => $this->product->id, ...$this->payload['variants'][0]])->assertSessionHasNoErrors();
    }
    expect($this->variant->refresh()->reserved_stock)->toBe(3)->and($this->variant->stock)->toBe(8);
})->with(['nested', 'standalone']);

it('rejects stock below live reservation', function () {
    $this->payload['variants'][0]['stock'] = 2;
    $this->put(route('admin.products.update', $this->product), $this->payload)->assertSessionHasErrors('variants.0.stock');
    expect($this->variant->refresh()->stock)->toBe(10)->and($this->variant->reserved_stock)->toBe(3);
});

it('rejects nested SKU ownership conflicts with indexed errors', function (string $conflict) {
    if ($conflict === 'replacement') {
        unset($this->payload['variants'][0]['id']);
    } elseif ($conflict === 'batch') {
        $this->payload['variants'][] = ['sku' => 'integrity-m', 'stock' => 1];
    } else {
        $other = Product::query()->create(['name' => 'Other', 'slug' => 'other', 'sku' => 'OTHER', 'base_price' => 1000, 'weight' => 100]);
        $otherVariant = $other->variants()->create(['sku' => 'OTHER-M', 'stock' => 1]);
        if ($conflict === 'foreign-id') {
            $this->payload['variants'][0]['id'] = $otherVariant->id;
        } else {
            $otherVariant->delete();
            $this->payload['variants'][0]['sku'] = 'OTHER-M';
        }
    }
    $key = $conflict === 'foreign-id' ? 'variants.0.id' : ($conflict === 'batch' ? 'variants.1.sku' : 'variants.0.sku');
    $this->put(route('admin.products.update', $this->product), $this->payload)->assertSessionHasErrors($key);
    expect($this->variant->refresh()->sku)->toBe('INTEGRITY-M')->and($this->variant->stock)->toBe(10)->and($this->variant->reserved_stock)->toBe(3);
})->with(['replacement', 'batch', 'foreign-id', 'soft-deleted']);

it('duplicates and creates variants without inventing reservations', function () {
    $this->post(route('admin.products.duplicate', $this->product))->assertSessionHasNoErrors();
    $copy = Product::query()->whereKeyNot($this->product->id)->firstOrFail();
    expect($copy->variants->first()->reserved_stock)->toBe(0)->and($this->variant->refresh()->reserved_stock)->toBe(3);
    $this->post(route('admin.product-variants.store'), ['product_id' => $this->product->id, 'sku' => 'NEW-M', 'stock' => 8, 'reserved_stock' => 7])->assertSessionHasNoErrors();
    expect(ProductVariant::query()->where('sku', 'NEW-M')->firstOrFail()->reserved_stock)->toBe(0);
});
