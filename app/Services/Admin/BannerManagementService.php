<?php

namespace App\Services\Admin;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerManagementService
{
    use StoresUploadedFiles;

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'placement' => $request->string('placement')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        return [
            'banners' => Banner::query()
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('subtitle', 'like', "%{$filters['search']}%")))
                ->when($filters['placement'] !== '', fn ($query) => $query->where('placement', $filters['placement']))
                ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
                ->orderBy('sort_order')
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Banner $banner): array => $this->row($banner)),
            'filters' => $filters,
            'placements' => $this->placements(),
        ];
    }

    public function create(Request $request): Banner
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);
        unset($data['image_desktop'], $data['image_mobile']);

        $data['image_desktop_url'] = $this->storePublicFile($request->file('image_desktop'), 'images/banners');

        if ($request->hasFile('image_mobile')) {
            $data['image_mobile_url'] = $this->storePublicFile($request->file('image_mobile'), 'images/banners');
        }

        return Banner::query()->create($data);
    }

    public function update(Banner $banner, Request $request): void
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image_desktop'], $data['image_mobile']);

        if ($request->hasFile('image_desktop')) {
            $this->deletePublicFile($banner->image_desktop_url);
            $data['image_desktop_url'] = $this->storePublicFile($request->file('image_desktop'), 'images/banners');
        }

        if ($request->hasFile('image_mobile')) {
            $this->deletePublicFile($banner->image_mobile_url);
            $data['image_mobile_url'] = $this->storePublicFile($request->file('image_mobile'), 'images/banners');
        }

        $banner->update($data);
    }

    public function delete(Banner $banner): void
    {
        $this->deletePublicFile($banner->image_desktop_url);
        $this->deletePublicFile($banner->image_mobile_url);
        $banner->delete();
    }

    public function row(Banner $banner): array
    {
        return [
            'id' => $banner->id,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'image_desktop_url' => $banner->image_desktop_url,
            'image_mobile_url' => $banner->image_mobile_url,
            'button_text' => $banner->button_text,
            'button_url' => $banner->button_url,
            'placement' => $banner->placement,
            'sort_order' => $banner->sort_order,
            'is_active' => $banner->is_active,
            'starts_at' => $banner->starts_at?->format('Y-m-d\TH:i'),
            'ends_at' => $banner->ends_at?->format('Y-m-d\TH:i'),
            'created_at' => $banner->created_at?->toFormattedDateString(),
        ];
    }

    public function placements(): array
    {
        return ['homepage', 'collection', 'promo'];
    }
}
