<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            if (! Schema::hasColumn('orders', 'checkout_idempotency_key')) {
                $table->string('checkout_idempotency_key', 100)->nullable()->after('order_number');
                $table->unique(['user_id', 'checkout_idempotency_key']);
            }
        });

        Schema::table('payments', function (Blueprint $table): void {
            if (! Schema::hasColumn('payments', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('expired_at')->index();
            }

            $table->index(['transaction_status', 'created_at']);
            $table->index('last_synced_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropIndex(['transaction_status', 'created_at']);
            $table->dropIndex(['last_synced_at']);
            $table->dropColumn('expires_at');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'checkout_idempotency_key']);
            $table->dropColumn('checkout_idempotency_key');
        });
    }
};
