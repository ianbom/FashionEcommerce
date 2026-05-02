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
            ->filter(fn (array $image): bool => $this->hasStoredImageUrl($image['image_url'] ?? null) || $request->hasFile("images.{$image['_index']}.image"))
            ->values();

        $primaryIndex = $images->search(fn (array $image): bool => (bool) ($image['is_primary'] ?? false));
        $primaryIndex = $primaryIndex === false ? 0 : $primaryIndex;
        $keptIds = [];

        $folder = 'product/'.Str::slug($product->slug ?: $product->name);

        foreach ($images as $index => $image) {
            $uploadedImage = $request->file("images.{$image['_index']}.image");
            $storedImageUrl = $uploadedImage
                ? Storage::url($uploadedImage->storeAs($folder, $this->makeFilename($product, $index, $uploadedImage->getClientOriginalExtension()), 'public'))
                : $this->normalizeStoredImageUrl($image['image_url'] ?? null);

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
        if (! $this->hasStoredImageUrl($imageUrl)) {
            return;
        }

        // Handle full URLs: http://...../storage/products/...
        if (str_contains($imageUrl, '/storage/')) {
            $path = Str::after($imageUrl, '/storage/');
            Storage::disk('public')->delete($path);
            return;
        }

        // Handle relative paths: storage/products/... or products/...
        $path = ltrim($imageUrl, '/');
        if (Str::startsWith($path, 'storage/')) {
            $path = Str::after($path, 'storage/');
        }

        Storage::disk('public')->delete($path);
    }

    private function hasStoredImageUrl(?string $imageUrl): bool
    {
        return filled($imageUrl) && ! Str::startsWith($imageUrl, 'blob:');
    }

    private function normalizeStoredImageUrl(?string $imageUrl): ?string
    {
        if (! $this->hasStoredImageUrl($imageUrl)) {
            return null;
        }

        return $imageUrl;
    }

    private function makeFilename(Product $product, int $index, string $extension): string
    {
        $name = Str::slug($product->slug ?: $product->name) ?: 'product';

        return $name.'-'.($index + 1).'-'.Str::uuid().'.'.(strtolower($extension) ?: 'jpg');
    }
}
