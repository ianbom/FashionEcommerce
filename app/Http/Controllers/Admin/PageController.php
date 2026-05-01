<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use App\Services\Admin\PageManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PageController extends Controller
{
    public function index(Request $request, PageManagementService $pages): Response
    {
        return inertia('admin/pages/index', $pages->indexData($request));
    }

    public function create(PageManagementService $pages): Response
    {
        return inertia('admin/pages/form', [
            'mode' => 'create',
            'page' => null,
            'types' => $pages->types(),
        ]);
    }

    public function store(PageRequest $request, PageManagementService $pages): RedirectResponse
    {
        $pages->create($request);

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil dibuat.');
    }

    public function edit(Page $page, PageManagementService $pages): Response
    {
        return inertia('admin/pages/form', [
            'mode' => 'edit',
            'page' => $pages->row($page),
            'types' => $pages->types(),
        ]);
    }

    public function update(PageRequest $request, Page $page, PageManagementService $pages): RedirectResponse
    {
        $pages->update($page, $request);

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil diperbarui.');
    }

    public function destroy(Page $page, PageManagementService $pages): RedirectResponse
    {
        $pages->delete($page);

        return redirect()->route('admin.pages.index')->with('success', 'Page berhasil dihapus.');
    }
}
