<?php

namespace App\Console\Commands;

use App\Services\Admin\ShipmentManagementService;
use Illuminate\Console\Command;

class ReplayBiteshipWebhooksCommand extends Command
{
    protected $signature = 'shipments:replay-biteship-webhooks';

    protected $description = 'Process pending Biteship receipts without creating provider bookings.';

    public function handle(ShipmentManagementService $shipments): int
    {
        $stats = $shipments->replayWebhooks();
        $this->info("Processed {$stats['processed']}, pending {$stats['pending']}, failed {$stats['failed']}.");

        return $stats['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
