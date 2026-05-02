<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin' && (bool) $this->user()?->is_active;
    }

    /**
     * @return array<string, list<mixed>>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'collection_id' => ['nullable', 'integer', 'exists:collections,id'],
            'name' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:200', Rule::unique('products', 'slug')->ignore($product)],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product)],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:5000'],
            'material' => ['nullable', 'string', 'max:150'],
            'care_instruction' => ['nullable', 'string', 'max:2000'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lte:base_price'],
            'weight' => ['required', 'integer', 'min:0'],
            'length' => ['nullable', 'integer', 'min:0'],
            'width' => ['nullable', 'integer', 'min:0'],
            'height' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => ['sometimes', 'boolean'],
            'is_new_arrival' => ['sometimes', 'boolean'],
            'is_best_seller' => ['sometimes', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*.id' => ['nullable', 'integer', 'exists:product_images,id'],
            'images.*.image_url' => ['nullable', 'string', 'max:255'],
            'images.*.image' => ['nullable', 'file', 'image', 'max:4096'],
            'images.*.alt_text' => ['nullable', 'string', 'max:255'],
            'images.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'images.*.is_primary' => ['sometimes', 'boolean'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'variants.*.sku' => ['nullable', 'string', 'max:100'],
            'variants.*.color_name' => ['nullable', 'string', 'max:100'],
            'variants.*.color_hex' => ['nullable'],
            'variants.*.size' => ['nullable', 'string', 'max:50'],
            'variants.*.additional_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.reserved_stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.image_url' => ['nullable', 'url', 'max:255'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function ($validator): void {
                if ($this->input('status') !== 'published') {
                    return;
                }

                if ((int) $this->input('weight', 0) < 1) {
                    $validator->errors()->add('weight', 'Weight minimal 1 gram untuk produk published.');
                }

                $images = collect($this->input('images', []))
                    ->filter(fn (array $image, int $index): bool => $this->hasStoredImageUrl($image['image_url'] ?? null) || $this->hasFile("images.{$index}.image"));

                if ($images->isEmpty()) {
                    $validator->errors()->add('images', 'Produk published minimal memiliki satu gambar.');
                }

                if (! $images->contains(fn (array $image): bool => (bool) ($image['is_primary'] ?? false))) {
                    $validator->errors()->add('images', 'Produk published membutuhkan satu gambar utama.');
                }

                $variants = collect($this->input('variants', []))
                    ->filter(fn (array $variant): bool => filled($variant['sku'] ?? null));

                if (! $variants->contains(fn (array $variant): bool => (bool) ($variant['is_active'] ?? false) && (int) ($variant['stock'] ?? 0) > 0)) {
                    $validator->errors()->add('variants', 'Produk published membutuhkan satu varian aktif dengan stok tersedia.');
                }
            },
        ];
    }

    private function hasStoredImageUrl(?string $imageUrl): bool
    {
        return filled($imageUrl) && ! Str::startsWith($imageUrl, 'blob:');
    }
}
