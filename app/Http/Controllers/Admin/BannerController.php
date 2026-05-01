<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'placement' => $request->string('placement')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        $banners = Banner::query()
            ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('title', 'like', "%{$filters['search']}%")
                ->orWhere('subtitle', 'like', "%{$filters['search']}%")))
            ->when($filters['placement'] !== '', fn ($query) => $query->where('placement', $filters['placement']))
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
            ->orderBy('sort_order')
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Banner $banner): array => $this->row($banner));

        return inertia('admin/banners/index', [
            'banners' => $banners,
            'filters' => $filters,
            'placements' => $this->placements(),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/banners/form', [
            'mode' => 'create',
            'banner' => null,
            'placements' => $this->placements(),
        ]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);
        unset($data['image_desktop'], $data['image_mobile']);

        $data['image_desktop_url'] = Storage::url($request->file('image_desktop')->store('images/banners', 'public'));

        if ($request->hasFile('image_mobile')) {
            $data['image_mobile_url'] = Storage::url($request->file('image_mobile')->store('images/banners', 'public'));
        }

        Banner::query()->create($data);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil dibuat.');
    }

    public function edit(Banner $banner): Response
    {
        return inertia('admin/banners/form', [
            'mode' => 'edit',
            'banner' => $this->row($banner),
            'placements' => $this->placements(),
        ]);
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image_desktop'], $data['image_mobile']);

        if ($request->hasFile('image_desktop')) {
            $this->deletePublicFile($banner->image_desktop_url);
            $data['image_desktop_url'] = Storage::url($request->file('image_desktop')->store('images/banners', 'public'));
        }

        if ($request->hasFile('image_mobile')) {
            $this->deletePublicFile($banner->image_mobile_url);
            $data['image_mobile_url'] = Storage::url($request->file('image_mobile')->store('images/banners', 'public'));
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->deletePublicFile($banner->image_desktop_url);
        $this->deletePublicFile($banner->image_mobile_url);
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil dihapus.');
    }

    private function row(Banner $banner): array
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

    private function placements(): array
    {
        return ['homepage', 'collection', 'promo'];
    }

    private function deletePublicFile(?string $url): void
    {
        if ($url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $url));
        }
    }
}
