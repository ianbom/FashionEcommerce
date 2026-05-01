<?php

namespace App\Services\Notifications;

use App\Models\Notification;
use App\Models\Order;

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
}
