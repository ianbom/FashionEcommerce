<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminUserManagementService
{
    use ResolvesAdminPagination;

    public function indexData(Request $request): array
    {
        $search = $request->string('search')->toString();

        return [
            'admins' => User::query()
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
                ->paginate($this->perPage($request))
                ->withQueryString()
                ->through(fn (User $admin): array => $this->row($admin)),
            'filters' => ['search' => $search],
        ];
    }

    public function create(array $data, Request $request): User
    {
        unset($data['password_confirmation']);

        $admin = User::query()->create($data);
        $admin->forceFill([
            'role' => 'admin',
            'is_active' => $request->boolean('is_active', true),
        ])->save();

        return $admin;
    }

    public function formData(User $admin): array
    {
        $this->ensureAdmin($admin);

        return [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'phone' => $admin->phone,
            'avatar_url' => $admin->avatar_url,
            'is_active' => $admin->is_active,
        ];
    }

    public function update(User $admin, array $data, Request $request): void
    {
        $this->ensureAdmin($admin);
        unset($data['password_confirmation']);

        if (($data['password'] ?? '') === '') {
            unset($data['password']);
        }

        $isActive = $request->boolean('is_active');

        if ($admin->is($request->user()) && ! $isActive) {
            throw ValidationException::withMessages([
                'is_active' => 'Admin tidak dapat menonaktifkan akun sendiri.',
            ]);
        }

        if ($admin->is_active && ! $isActive && $this->activeAdminCount() <= 1) {
            throw ValidationException::withMessages([
                'is_active' => 'Minimal harus ada satu admin aktif.',
            ]);
        }

        $admin->update($data);
        $admin->forceFill(['is_active' => $isActive])->save();
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

    private function row(User $admin): array
    {
        return [
            'id' => $admin->id,
            'name' => $admin->name,
            'email' => $admin->email,
            'phone' => $admin->phone,
            'avatar_url' => $admin->avatar_url,
            'is_active' => $admin->is_active,
            'created_at' => $admin->created_at?->toFormattedDateString(),
            'edit_url' => route('admin.admin-users.edit', $admin, false),
        ];
    }
}
