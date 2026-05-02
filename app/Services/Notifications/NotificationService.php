<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function forOrder(Order $order, string $title, string $message, string $type): void
    {
        if (! $order->user_id) {
            return;
        }

        Notification::query()->create([
            'user_id' => $order->user_id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'reference_type' => 'order',
            'reference_id' => $order->id,
        ]);
    }

    public function pageData(User $user): array
    {
        return [
            'notifications' => $this->notifications($user),
        ];
    }

    public function detailData(User $user, Notification $notification): array
    {
        abort_unless($notification->user_id === $user->id, 404);

        $this->markAsRead($user, $notification);

        return [
            'notification' => $this->mapNotificationDetail($notification->fresh()),
        ];
    }

    public function markAllAsRead(User $user): void
    {
        Notification::query()
            ->whereBelongsTo($user)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function markAsRead(User $user, Notification $notification): void
    {
        abort_unless($notification->user_id === $user->id, 404);

        if ($notification->is_read) {
            return;
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    private function notifications(User $user): array
    {
        $paginator = Notification::query()
            ->whereBelongsTo($user)
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return [
            'data' => $paginator->through(fn (Notification $notification): array => $this->mapNotification($notification))->items(),
            'meta' => $this->meta($paginator),
        ];
    }

    private function mapNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'time' => $notification->created_at?->diffForHumans() ?? '-',
            'is_read' => $notification->is_read,
        ];
    }

    private function mapNotificationDetail(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'time' => $notification->created_at?->diffForHumans() ?? '-',
            'created_at' => $notification->created_at?->toDateTimeString(),
            'read_at' => $notification->read_at?->toDateTimeString(),
            'is_read' => $notification->is_read,
            'reference_type' => $notification->reference_type,
            'reference_id' => $notification->reference_id,
        ];
    }

    private function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
