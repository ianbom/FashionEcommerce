<?php

namespace App\Console\Commands;

use App\Actions\Payments\SyncExpiredMidtransPaymentsAction;
use Illuminate\Console\Command;

class SyncExpiredMidtransPaymentsCommand extends Command
{
    protected $signature = 'payments:sync-expired-midtrans';

    protected $description = 'Synchronize expired pending Midtrans payments and release stock through the payment state action.';

    public function handle(SyncExpiredMidtransPaymentsAction $syncExpiredPayments): int
    {
        $stats = $syncExpiredPayments->execute();

        $this->components->info("Expired Midtrans sync checked {$stats['checked']}, expired {$stats['expired']}, skipped Midtrans-owned {$stats['skipped_midtrans_owned']}, synced {$stats['synced']}, failed {$stats['failed']}.");

        return self::SUCCESS;
    }
}
