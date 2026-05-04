<?php

namespace App\Services\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategoryManagementService
{
    use StoresUploadedFiles;
    use ResolvesAdminPagination;

    public function indexData(Request $request): array
    {
        $search = $request->string('search')->toString();

        return [
            'categories' => Category::query()
                ->withCount('products')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")))
                ->latest()
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (Category $category): array => $this->row($category)),
            'filters' => ['search' => $search],
            'stats' => [
                'total' => Category::query()->count(),
                'active' => Category::query()->where('is_active', true)->count(),
                'inactive' => Category::query()->where('is_active', false)->count(),
            ],
        ];
    }

    public function create(Request $request): Category
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);
        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_url'] = $this->storePublicFile($request->file('image'), 'images/categories');
        }

        return Category::query()->create($data);
    }

    public function update(Category $category, Request $request): void
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image']);

        if ($request->hasFile('image')) {
            $this->deletePublicFile($category->image_url);
            $data['image_url'] = $this->storePublicFile($request->file('image'), 'images/categories');
        }

        $category->update($data);
    }

    public function delete(Category $category): void
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Category yang masih memiliki produk tidak boleh dihapus permanen.',
            ]);
        }

        $this->deletePublicFile($category->image_url);
        $category->delete();
    }

    public function row(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image_url' => $category->image_url,
            'is_active' => $category->is_active,
            'products_count' => $category->products_count,
            'created_at' => $category->created_at?->toFormattedDateString(),
        ];
    }
}
