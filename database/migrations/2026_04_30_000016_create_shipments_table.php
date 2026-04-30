<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('shipping_provider', 50)->default('biteship');
            $table->string('biteship_order_id', 150)->nullable();
            $table->string('biteship_tracking_id', 150)->nullable();
            $table->string('waybill_id', 150)->nullable();
            $table->string('courier_company', 100);
            $table->string('courier_type', 100);
            $table->string('courier_service_name', 150)->nullable();
            $table->string('delivery_type', 50)->default('now');
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('insurance_cost', 15, 2)->default(0);
            $table->string('estimated_delivery', 100)->nullable();
            $table->string('shipping_status', 50)->default('not_created');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->json('raw_rate_response')->nullable();
            $table->json('raw_order_response')->nullable();
            $table->timestamps();

            $table->index('biteship_order_id');
            $table->index('biteship_tracking_id');
            $table->index('waybill_id');
            $table->index('shipping_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
