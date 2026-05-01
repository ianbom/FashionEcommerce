<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CollectionRequest;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class CollectionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $collections = Collection::query()
            ->withCount('products')
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Collection $collection): array => [
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
            ]);

        return inertia('admin/collections/index', [
            'collections' => $collections,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/collections/form', [
            'mode' => 'create',
            'collection' => null,
        ]);
    }

    public function store(CollectionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_active'] = $request->boolean('is_active', true);
        unset($data['banner_desktop'], $data['banner_mobile']);

        if ($request->hasFile('banner_desktop')) {
            $data['banner_desktop_url'] = Storage::url(
                $request->file('banner_desktop')->store('images/collections', 'public')
            );
        }
        if ($request->hasFile('banner_mobile')) {
            $data['banner_mobile_url'] = Storage::url(
                $request->file('banner_mobile')->store('images/collections', 'public')
            );
        }

        Collection::query()->create($data);

        return redirect()->route('admin.collections.index')->with('success', 'Collection berhasil dibuat.');
    }

    public function edit(Collection $collection): Response
    {
        return inertia('admin/collections/form', [
            'mode' => 'edit',
            'collection' => $collection,
        ]);
    }

    public function update(CollectionRequest $request, Collection $collection): RedirectResponse
    {
        $data = $request->validated();
        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_active'] = $request->boolean('is_active');
        unset($data['banner_desktop'], $data['banner_mobile']);

        if ($request->hasFile('banner_desktop')) {
            if ($collection->banner_desktop_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $collection->banner_desktop_url));
            }
            $data['banner_desktop_url'] = Storage::url(
                $request->file('banner_desktop')->store('images/collections', 'public')
            );
        }
        if ($request->hasFile('banner_mobile')) {
            if ($collection->banner_mobile_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $collection->banner_mobile_url));
            }
            $data['banner_mobile_url'] = Storage::url(
                $request->file('banner_mobile')->store('images/collections', 'public')
            );
        }

        $collection->update($data);

        return redirect()->route('admin.collections.index')->with('success', 'Collection berhasil diperbarui.');
    }

    public function destroy(Collection $collection): RedirectResponse
    {
        if ($collection->products()->exists()) {
            throw ValidationException::withMessages([
                'collection' => 'Collection yang masih memiliki produk tidak boleh dihapus permanen.',
            ]);
        }

        // Delete banner images from storage
        foreach (['banner_desktop_url', 'banner_mobile_url'] as $field) {
            if ($collection->$field) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $collection->$field));
            }
        }

        $collection->delete();

        return redirect()->route('admin.collections.index')->with('success', 'Collection berhasil dihapus.');
    }
}
