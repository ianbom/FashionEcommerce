<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $admins = User::query()
            ->where('role', 'admin')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $admin): array => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'avatar_url' => $admin->avatar_url,
                'is_active' => $admin->is_active,
                'created_at' => $admin->created_at?->toFormattedDateString(),
                'edit_url' => route('admin.admin-users.edit', $admin, false),
            ]);

        return inertia('admin/admin-users/index', [
            'admins' => $admins,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/admin-users/form', [
            'mode' => 'create',
            'adminUser' => null,
        ]);
    }

    public function store(StoreAdminUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['password_confirmation']);

        $data['role'] = 'admin';
        $data['is_active'] = $request->boolean('is_active', true);

        User::query()->create($data);

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user berhasil dibuat.');
    }

    public function edit(User $adminUser): Response
    {
        $this->ensureAdmin($adminUser);

        return inertia('admin/admin-users/form', [
            'mode' => 'edit',
            'adminUser' => [
                'id' => $adminUser->id,
                'name' => $adminUser->name,
                'email' => $adminUser->email,
                'phone' => $adminUser->phone,
                'avatar_url' => $adminUser->avatar_url,
                'is_active' => $adminUser->is_active,
            ],
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $adminUser): RedirectResponse
    {
        $this->ensureAdmin($adminUser);

        $data = $request->validated();
        unset($data['password_confirmation']);

        if (($data['password'] ?? '') === '') {
            unset($data['password']);
        }

        $data['is_active'] = $request->boolean('is_active');

        if ($adminUser->is($request->user()) && ! $data['is_active']) {
            throw ValidationException::withMessages([
                'is_active' => 'Admin tidak dapat menonaktifkan akun sendiri.',
            ]);
        }

        if ($adminUser->is_active && ! $data['is_active'] && $this->activeAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'is_active' => 'Minimal harus ada satu admin aktif.',
            ]);
        }

        $adminUser->update($data);

        return redirect()
            ->route('admin.admin-users.index')
            ->with('success', 'Admin user berhasil diperbarui.');
    }

    private function ensureAdmin(User $user): void
    {
        abort_unless($user->role === 'admin', 404);
    }

    private function activeAdminCount(): int
    {
        return User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->count();
    }
}
