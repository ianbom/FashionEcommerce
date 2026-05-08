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
            $table->timestamp('stock_reserved_at')->nullable()->after('completed_at');
            $table->timestamp('stock_released_at')->nullable()->after('stock_reserved_at');
            $table->timestamp('stock_finalized_at')->nullable()->after('stock_released_at');
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->unique('order_id');
            $table->index('midtrans_transaction_id');
            $table->timestamp('last_synced_at')->nullable()->after('expired_at');
            $table->text('failure_reason')->nullable()->after('last_synced_at');
        });

        Schema::table('shipments', function (Blueprint $table): void {
            $table->unique('order_id');
            $table->unique('biteship_order_id');
            $table->timestamp('creating_at')->nullable()->after('cancelled_at');
            $table->timestamp('last_synced_at')->nullable()->after('creating_at');
            $table->text('failed_reason')->nullable()->after('last_synced_at');
        });

        Schema::table('biteship_webhook_logs', function (Blueprint $table): void {
            $table->string('payload_hash', 64)->nullable()->after('waybill_id')->unique();
        });

        if (Schema::hasTable('payment_logs')) {
            Schema::table('payment_logs', function (Blueprint $table): void {
                $table->string('payload_hash', 64)->nullable()->after('transaction_status')->index();
            });
        }

        $driver = DB::getDriverName();
        if (in_array($driver, ['mysql', 'mariadb', 'pgsql'], true)) {
            DB::statement('ALTER TABLE product_variants ADD CONSTRAINT product_variants_stock_non_negative CHECK (stock >= 0)');
            DB::statement('ALTER TABLE product_variants ADD CONSTRAINT product_variants_reserved_stock_non_negative CHECK (reserved_stock >= 0)');
            DB::statement('ALTER TABLE product_variants ADD CONSTRAINT product_variants_reserved_stock_lte_stock CHECK (reserved_stock <= stock)');
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['stock_reserved_at', 'stock_released_at', 'stock_finalized_at']);
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->dropUnique(['order_id']);
            $table->dropIndex(['midtrans_transaction_id']);
            $table->dropColumn(['last_synced_at', 'failure_reason']);
        });

        Schema::table('shipments', function (Blueprint $table): void {
            $table->dropUnique(['order_id']);
            $table->dropUnique(['biteship_order_id']);
            $table->dropColumn(['creating_at', 'last_synced_at', 'failed_reason']);
        });

        Schema::table('biteship_webhook_logs', function (Blueprint $table): void {
            $table->dropIndex(['payload_hash']);
            $table->dropColumn('payload_hash');
        });

        Schema::table('payment_logs', function (Blueprint $table): void {
            $table->dropUnique(['payload_hash']);
            $table->dropColumn('payload_hash');
        });
    }
};
