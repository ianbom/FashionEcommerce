<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminNotificationRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class AdminNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'read' => $request->string('read')->toString(),
        ];

        $notifications = Notification::query()
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
            ->through(fn (Notification $notification): array => $this->row($notification));

        return inertia('admin/notifications/index', [
            'notifications' => $notifications,
            'filters' => $filters,
            'types' => $this->types(),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/notifications/form', [
            'customers' => User::query()
                ->where('role', 'customer')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'is_active']),
            'types' => $this->types(),
        ]);
    }

    public function store(AdminNotificationRequest $request): RedirectResponse
    {
        $data = $request->validated();
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

        return redirect()->route('admin.notifications.index')->with('success', "Notifikasi berhasil dikirim ke {$users->count()} customer.");
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

    private function types(): array
    {
        return ['order', 'payment', 'shipping', 'promo', 'system'];
    }
}
