<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create login response.
     */
    public function toResponse($request): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        $target = match ($user?->role) {
            'admin' => route('admin.dashboard', absolute: false),
            default => route('home', absolute: false),
        };

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false])
            : redirect()->intended($target);
    }
}
