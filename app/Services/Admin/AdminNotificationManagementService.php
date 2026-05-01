<?php

namespace App\Services\Admin;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminNotificationManagementService
{
    public const TYPES = ['order', 'payment', 'shipping', 'promo', 'system'];

    public function indexData(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'read' => $request->string('read')->toString(),
        ];

        return [
            'notifications' => Notification::query()
                ->with('user:id,name,email')
                ->when($filters['search'] !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('title', 'like', "%{$filters['search']}%")
                    ->orWhere('message', 'like', "%{$filters['search']}%")
                    ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$filters['search']}%")->orWhere('email', 'like', "%{$filters['search']}%"))))
                ->when($filters['type'] !== '', fn ($query) => $query->where('type', $filters['type']))
                ->when($filters['read'] !== '', fn ($query) => $query->where('is_read', $filters['read'] === 'read'))
                ->latest()
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Notification $notification): array => $this->row($notification)),
            'filters' => $filters,
            'types' => self::TYPES,
        ];
    }

    public function createData(): array
    {
        return [
            'customers' => User::query()
                ->where('role', 'customer')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'is_active']),
            'types' => self::TYPES,
        ];
    }

    public function send(array $data): int
    {
        $users = match ($data['target']) {
            'one' => User::query()->whereKey($data['user_id'])->where('role', 'customer')->get(['id']),
            'active' => User::query()->where('role', 'customer')->where('is_active', true)->get(['id']),
            default => User::query()->where('role', 'customer')->get(['id']),
        };

        if ($users->isEmpty()) {
            throw ValidationException::withMessages([
                'target' => 'Tidak ada customer yang cocok dengan target notifikasi.',
            ]);
        }

        $now = now();
        DB::table('notifications')->insert($users->map(fn (User $user): array => [
            'user_id' => $user->id,
            'title' => $data['title'],
            'message' => $data['message'],
            'type' => $data['type'],
            'reference_type' => $data['reference_type'] ?? null,
            'reference_id' => $data['reference_id'] ?? null,
            'is_read' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());

        return $users->count();
    }

    private function row(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'customer' => $notification->user?->name,
            'customer_email' => $notification->user?->email,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'reference_type' => $notification->reference_type,
            'reference_id' => $notification->reference_id,
            'is_read' => $notification->is_read,
            'read_at' => $notification->read_at?->toDateTimeString(),
            'created_at' => $notification->created_at?->toFormattedDateString(),
        ];
    }
}
