<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminNotificationRequest;
use App\Services\Admin\AdminNotificationManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AdminNotificationController extends Controller
{
    public function index(Request $request, AdminNotificationManagementService $notifications): Response
    {
        return inertia('admin/notifications/index', $notifications->indexData($request));
    }

    public function create(AdminNotificationManagementService $notifications): Response
    {
        return inertia('admin/notifications/form', $notifications->createData());
    }

    public function store(AdminNotificationRequest $request, AdminNotificationManagementService $notifications): RedirectResponse
    {
        $sent = $notifications->send($request->validated());

        return redirect()->route('admin.notifications.index')->with('success', "Notifikasi berhasil dikirim ke {$sent} customer.");
    }
}
