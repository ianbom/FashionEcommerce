<?php

namespace App\Services\Admin;

use Illuminate\Http\Request;

trait ResolvesAdminPagination
{
    private const ADMIN_PER_PAGE_OPTIONS = [10, 50, 100];

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->integer('per_page', 10);

        return in_array($perPage, self::ADMIN_PER_PAGE_OPTIONS, true) ? $perPage : 10;
    }
}
