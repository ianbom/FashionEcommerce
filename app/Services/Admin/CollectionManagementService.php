<?php

namespace App\Services\Admin;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CollectionManagementService
{
    use StoresUploadedFiles;
    use ResolvesAdminPagination;

    public function indexData(Request $request): array
    {
        $search = $request->string('search')->toString();

        return [
            'collections' => Collection::query()
                ->withCount('products')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Collection $collection): array => $this->row($collection)),
            'filters' => ['search' => $search],
            'stats' => [
                'total' => Collection::query()->count(),
                'active' => Collection::query()->where('is_active', true)->count(),
                'featured' => Collection::query()->where('is_featured', true)->count(),
            ],
        ];
    }

    public function create(Request $request): Collection
    {
        $data = $this->payload($request, true);

        return Collection::query()->create($data);
    }

    public function update(Collection $collection, Request $request): void
    {
        $collection->update($this->payload($request, false, $collection));
    }

    public function delete(Collection $collection): void
    {
        if ($collection->products()->exists()) {
            throw ValidationException::withMessages([
                'collection' => 'Collection yang masih memiliki produk tidak boleh dihapus permanen.',
            ]);
        }

        foreach (['banner_desktop_url', 'banner_mobile_url'] as $field) {
            $this->deletePublicFile($collection->{$field});
        }

        $collection->delete();
    }

    public function row(Collection $collection): array
    {
        return [
            'id' => $collection->id,
            'name' => $collection->name,
            'slug' => $collection->slug,
            'description' => $collection->description,
            'banner_desktop_url' => $collection->banner_desktop_url,
            'banner_mobile_url' => $collection->banner_mobile_url,
            'is_featured' => $collection->is_featured,
            'is_active' => $collection->is_active,
            'products_count' => $collection->products_count,
            'created_at' => $collection->created_at?->toFormattedDateString(),
        ];
    }

    private function payload(Request $request, bool $defaultActive, ?Collection $collection = null): array
    {
        $data = $request->validated();
        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_active'] = $request->boolean('is_active', $defaultActive);
        unset($data['banner_desktop'], $data['banner_mobile']);

        if ($request->hasFile('banner_desktop')) {
            $this->deletePublicFile($collection?->banner_desktop_url);
            $data['banner_desktop_url'] = $this->storePublicFile($request->file('banner_desktop'), 'images/collections');
        }

        if ($request->hasFile('banner_mobile')) {
            $this->deletePublicFile($collection?->banner_mobile_url);
            $data['banner_mobile_url'] = $this->storePublicFile($request->file('banner_mobile'), 'images/collections');
        }

        return $data;
    }
}
