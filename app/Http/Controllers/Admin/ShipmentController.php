<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateShipmentRequest;
use App\Http\Requests\Admin\ShipmentStatusRequest;
use App\Models\Order;
use App\Models\Shipment;
use App\Services\Admin\ShipmentManagementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ShipmentController extends Controller
{
    public function index(Request $request, ShipmentManagementService $shipments): Response
    {
        return inertia('admin/shipments/index', $shipments->indexData($request));
    }

    public function show(Shipment $shipment, ShipmentManagementService $shipments): Response
    {
        return inertia('admin/shipments/show', $shipments->detailData($shipment));
    }

    public function createFromOrder(CreateShipmentRequest $request, Order $order, ShipmentManagementService $shipments): RedirectResponse
    {
        $shipment = $shipments->createFromOrder($request, $order);

        return redirect()->route('admin.shipments.show', $shipment)->with('success', 'Shipment berhasil dibuat.');
    }

    public function updateStatus(ShipmentStatusRequest $request, Shipment $shipment, ShipmentManagementService $shipments): RedirectResponse
    {
        $shipments->updateStatus($shipment, $request);

        return back()->with('success', 'Shipment status berhasil diperbarui.');
    }

    public function refreshTracking(Shipment $shipment, ShipmentManagementService $shipments): RedirectResponse
    {
        $shipments->refreshTracking($shipment);

        return back()->with('success', 'Tracking berhasil direfresh.');
    }
}
