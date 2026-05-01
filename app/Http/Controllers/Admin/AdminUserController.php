<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\User;
use App\Services\Admin\AdminUserManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request, AdminUserManagementService $admins): Response
    {
        return inertia('admin/admin-users/index', $admins->indexData($request));
    }

    public function create(): Response
    {
        return inertia('admin/admin-users/form', [
            'mode' => 'create',
            'adminUser' => null,
        ]);
    }

    public function store(StoreAdminUserRequest $request, AdminUserManagementService $admins): RedirectResponse
    {
        $admins->create($request->validated(), $request);

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user berhasil dibuat.');
    }

    public function edit(User $adminUser, AdminUserManagementService $admins): Response
    {
        return inertia('admin/admin-users/form', [
            'mode' => 'edit',
            'adminUser' => $admins->formData($adminUser),
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $adminUser, AdminUserManagementService $admins): RedirectResponse
    {
        $admins->update($adminUser, $request->validated(), $request);

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user berhasil diperbarui.');
    }
}
