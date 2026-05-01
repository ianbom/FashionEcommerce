<?php

namespace App\Services\Admin;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageManagementService
{
    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'is_active' => $request->string('is_active')->toString(),
        ];

        return [
            'pages' => Page::query()
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('slug', 'like', "%{$filters['search']}%")))
                ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
                ->when($filters['is_active'] !== '', fn ($query) => $query->where('is_active', $filters['is_active'] === 'active'))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Page $page): array => $this->row($page)),
            'filters' => $filters,
            'types' => $this->types(),
        ];
    }

    public function create(Request $request): Page
    {
        return Page::query()->create($this->payload($request, true));
    }

    public function update(Page $page, Request $request): void
    {
        $page->update($this->payload($request, false));
    }

    public function delete(Page $page): void
    {
        $page->delete();
    }

    public function row(Page $page): array
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

    public function types(): array
    {
        return ['about', 'contact', 'faq', 'terms_conditions', 'privacy_policy', 'shipping_policy', 'no_return_refund_policy', 'size_guide'];
    }

    private function payload(Request $request, bool $defaultActive): array
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['slug']);
        $data['is_active'] = $request->boolean('is_active', $defaultActive);

        return $data;
    }
}
