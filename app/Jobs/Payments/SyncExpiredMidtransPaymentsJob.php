<?php

namespace App\Jobs\Payments;

use App\Actions\Payments\SyncExpiredMidtransPaymentsAction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncExpiredMidtransPaymentsJob implements ShouldQueue
{
    use Queueable;

    public function handle(SyncExpiredMidtransPaymentsAction $syncExpiredPayments): void
    {
        $syncExpiredPayments->execute();
    }
}
