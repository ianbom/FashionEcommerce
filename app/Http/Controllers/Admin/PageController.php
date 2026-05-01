<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        $pages = Page::query()
            ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                ->where('title', 'like', "%{$filters['search']}%")
                ->orWhere('slug', 'like', "%{$filters['search']}%")))
            ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Page $page): array => $this->row($page));

        return inertia('admin/pages/index', [
            'pages' => $pages,
            'filters' => $filters,
            'types' => $this->types(),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/pages/form', [
            'mode' => 'create',
            'page' => null,
            'types' => $this->types(),
        ]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug']);
        $data['is_active'] = $request->boolean('is_active', true);

        Page::query()->create($data);

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil dibuat.');
    }

    public function edit(Page $page): Response
    {
        return inertia('admin/pages/form', [
            'mode' => 'edit',
            'page' => $this->row($page),
            'types' => $this->types(),
        ]);
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug']);
        $data['is_active'] = $request->boolean('is_active');

        $page->update($data);

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil diperbarui.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil dihapus.');
    }

    private function row(Page $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'content' => $page->content,
            'type' => $page->type,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'is_active' => $page->is_active,
            'created_at' => $page->created_at?->toFormattedDateString(),
            'updated_at' => $page->updated_at?->toDateTimeString(),
        ];
    }

    private function types(): array
    {
        return ['about', 'contact', 'faq', 'terms_conditions', 'privacy_policy', 'shipping_policy', 'no_return_refund_policy', 'size_guide'];
    }
}
