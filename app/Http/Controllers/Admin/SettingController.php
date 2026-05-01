<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Services\Admin\SettingManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SettingController extends Controller
{
    public function index(Request $request, SettingManagementService $settings): Response
    {
        return inertia('admin/settings/index', $settings->indexData($request));
    }

    public function update(SettingRequest $request, SettingManagementService $settings): RedirectResponse
    {
        $settings->update($request->validated());

        return back()->with('success', 'Settings berhasil disimpan.');
    }
}
