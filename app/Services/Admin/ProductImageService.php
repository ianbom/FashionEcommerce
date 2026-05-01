<?php

namespace App\Services\Admin;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageService
{
    /**
     * @param  array<int, array<string, mixed>>  $images
     */
    public function sync(Request $request, Product $product, array $images): void
    {
        $images = collect($images)
            ->map(fn (array $image, int $index): array => [...$image, '_index' => $index])
            ->filter(fn (array $image): bool => filled($image['image_url'] ?? null) || $request->hasFile("images.{$image['_index']}.image"))
            ->values();

        $primaryIndex = $images->search(fn (array $image): bool => (bool) ($image['is_primary'] ?? false));
        $primaryIndex = $primaryIndex === false ? 0 : $primaryIndex;
        $keptIds = [];

        foreach ($images as $index => $image) {
            $uploadedImage = $request->file("images.{$image['_index']}.image");
            $storedImageUrl = $uploadedImage
                ? Storage::url($uploadedImage->store('images/products', 'public'))
                : ($image['image_url'] ?? null);

            $payload = [
                'image_url' => $storedImageUrl,
                'alt_text' => $image['alt_text'] ?? $product->name,
                'sort_order' => (int) ($image['sort_order'] ?? $index),
                'is_primary' => $index === $primaryIndex,
            ];

            if (! empty($image['id'])) {
                $productImage = $product->images()->whereKey($image['id'])->first();
                if ($productImage) {
                    if ($uploadedImage) {
                        $this->deleteStoredImage($productImage->image_url);
                    }

                    $productImage->update($payload);
                    $keptIds[] = $productImage->id;
                }

                continue;
            }

            $created = $product->images()->create($payload);
            $keptIds[] = $created->id;
        }

        $removedImages = $product->images()->whereNotIn('id', $keptIds)->get();
        foreach ($removedImages as $removedImage) {
            $this->deleteStoredImage($removedImage->image_url);
            $removedImage->delete();
        }
    }

    public function deleteStoredImage(?string $imageUrl): void
    {
        if (! filled($imageUrl)) {
            return;
        }

        $path = parse_url($imageUrl, PHP_URL_PATH);
        if (! is_string($path) || ! Str::startsWith($path, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(Str::after($path, '/storage/'));
    }
}
