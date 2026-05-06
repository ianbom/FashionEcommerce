<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('orders', 'voucher_released_at')) {
                $table->timestamp('voucher_released_at')->nullable()->after('stock_finalized_at');
            }
        });

        if (Schema::hasColumn('payment_logs', 'payload_hash')) {
            Schema::table('payment_logs', function (Blueprint $table): void {
                $table->dropIndex(['payload_hash']);
                $table->unique('payload_hash');
            });
        }

        if (in_array(DB::getDriverName(), ['mysql', 'mariadb', 'pgsql'], true)) {
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_payment_status_allowed CHECK (payment_status IN ('pending','paid','manual_review','failed','cancelled','expired','refunded','partially_refunded'))");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_order_status_allowed CHECK (order_status IN ('pending_payment','paid','processing','ready_to_ship','shipment_created','shipped','delivered','completed','cancelled','payment_failed','payment_expired','shipment_failed','shipment_problem','lost','returned','refunded'))");
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_shipping_status_allowed CHECK (shipping_status IN ('not_created','creating','confirmed','allocated','picked','in_transit','delivered','cancelled','failed','problem','lost','returned'))");
            DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_transaction_status_allowed CHECK (transaction_status IS NULL OR transaction_status IN ('pending','capture','settlement','deny','cancel','expire','failure','refund','partial_refund','authorize','manual_review','snap_failed'))");
            DB::statement("ALTER TABLE shipments ADD CONSTRAINT shipments_shipping_status_allowed CHECK (shipping_status IN ('not_created','creating','confirmed','allocated','picked','in_transit','delivered','cancelled','failed','problem','lost','returned'))");
        }
    }

    public function down(): void
    {
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE orders DROP CHECK orders_payment_status_allowed');
            DB::statement('ALTER TABLE orders DROP CHECK orders_order_status_allowed');
            DB::statement('ALTER TABLE orders DROP CHECK orders_shipping_status_allowed');
            DB::statement('ALTER TABLE payments DROP CHECK payments_transaction_status_allowed');
            DB::statement('ALTER TABLE shipments DROP CHECK shipments_shipping_status_allowed');
        }

        Schema::table('payment_logs', function (Blueprint $table): void {
            $table->dropUnique(['payload_hash']);
            $table->index('payload_hash');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn('voucher_released_at');
        });
    }
};
