<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $categories = Category::query()
            ->withCount('products')
            ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image_url' => $category->image_url,
                'is_active' => $category->is_active,
                'products_count' => $category->products_count,
                'created_at' => $category->created_at?->toFormattedDateString(),
            ]);

        return inertia('admin/categories/index', [
            'categories' => $categories,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/categories/form', [
            'mode' => 'create',
            'category' => null,
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active', true);
        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_url'] = Storage::url(
                $request->file('image')->store('images/categories', 'public')
            );
        }

        Category::query()->create($data);

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil dibuat.');
    }

    public function edit(Category $category): Response
    {
        return inertia('admin/categories/form', [
            'mode' => 'edit',
            'category' => $category,
        ]);
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $request->boolean('is_active');
        unset($data['image']);

        if ($request->hasFile('image')) {
            // Delete old image from storage
            if ($category->image_url) {
                $oldPath = str_replace('/storage/', '', $category->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $data['image_url'] = Storage::url(
                $request->file('image')->store('images/categories', 'public')
            );
        }

        $category->update($data);

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Category yang masih memiliki produk tidak boleh dihapus permanen.',
            ]);
        }

        // Delete image from storage
        if ($category->image_url) {
            $oldPath = str_replace('/storage/', '', $category->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $category->delete();

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil dihapus.');
    }
}
