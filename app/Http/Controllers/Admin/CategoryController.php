<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Services\Admin\CategoryManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request, CategoryManagementService $categories): Response
    {
        return inertia('admin/categories/index', $categories->indexData($request));
    }

    public function create(): Response
    {
        return inertia('admin/categories/form', [
            'mode' => 'create',
            'category' => null,
        ]);
    }

    public function store(CategoryRequest $request, CategoryManagementService $categories): RedirectResponse
    {
        $categories->create($request);

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil dibuat.');
    }

    public function edit(Category $category): Response
    {
        return inertia('admin/categories/form', [
            'mode' => 'edit',
            'category' => $category,
        ]);
    }

    public function update(CategoryRequest $request, Category $category, CategoryManagementService $categories): RedirectResponse
    {
        $categories->update($category, $request);

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil diperbarui.');
    }

    public function destroy(Category $category, CategoryManagementService $categories): RedirectResponse
    {
        $categories->delete($category);

        return redirect()->route('admin.categories.index')->with('success', 'Category berhasil dihapus.');
    }
}
