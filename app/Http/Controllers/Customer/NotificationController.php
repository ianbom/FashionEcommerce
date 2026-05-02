<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request, NotificationService $notifications): Response
    {
        return Inertia::render('customer/notification/list-notification', $notifications->pageData($this->user($request)));
    }

    public function show(Request $request, Notification $notification, NotificationService $notifications): Response
    {
        return Inertia::render('customer/notification/detail-notification', $notifications->detailData($this->user($request), $notification));
    }

    public function markAllAsRead(Request $request, NotificationService $notifications): RedirectResponse
    {
        $notifications->markAllAsRead($this->user($request));

        return redirect()->back();
    }

    public function markAsRead(Request $request, Notification $notification, NotificationService $notifications): RedirectResponse
    {
        $notifications->markAsRead($this->user($request), $notification);

        return redirect()->back();
    }

    private function user(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(403);
        }

        return $user;
    }
}
