<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biteship_webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 100)->nullable();
            $table->string('biteship_order_id', 150)->nullable();
            $table->string('biteship_tracking_id', 150)->nullable();
            $table->string('waybill_id', 150)->nullable();
            $table->json('payload');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('event_type');
            $table->index('biteship_order_id');
            $table->index('biteship_tracking_id');
            $table->index('waybill_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biteship_webhook_logs');
    }
};
