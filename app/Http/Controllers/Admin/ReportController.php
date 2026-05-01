<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\ReportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request, string $type, ReportService $reports): Response
    {
        return inertia('admin/reports/index', $reports->data($request, $type));
    }

    public function export(Request $request, string $type, ReportService $reports): StreamedResponse
    {
        return $reports->exportCsv($request, $type);
    }
}
