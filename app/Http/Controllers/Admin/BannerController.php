<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Models\Banner;
use App\Services\Admin\BannerManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(Request $request, BannerManagementService $banners): Response
    {
        return inertia('admin/banners/index', $banners->indexData($request));
    }

    public function create(BannerManagementService $banners): Response
    {
        return inertia('admin/banners/form', [
            'mode' => 'create',
            'banner' => null,
            'placements' => $banners->placements(),
        ]);
    }

    public function store(BannerRequest $request, BannerManagementService $banners): RedirectResponse
    {
        $banners->create($request);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil dibuat.');
    }

    public function edit(Banner $banner, BannerManagementService $banners): Response
    {
        return inertia('admin/banners/form', [
            'mode' => 'edit',
            'banner' => $banners->row($banner),
            'placements' => $banners->placements(),
        ]);
    }

    public function update(BannerRequest $request, Banner $banner, BannerManagementService $banners): RedirectResponse
    {
        $banners->update($banner, $request);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil diperbarui.');
    }

    public function destroy(Banner $banner, BannerManagementService $banners): RedirectResponse
    {
        $banners->delete($banner);

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil dihapus.');
    }
}
