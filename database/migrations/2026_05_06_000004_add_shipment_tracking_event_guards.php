<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipment_trackings', function (Blueprint $table): void {
            if (! Schema::hasColumn('shipment_trackings', 'provider_happened_at')) {
                $table->timestamp('provider_happened_at')->nullable()->after('happened_at');
                $table->string('payload_hash', 64)->nullable()->after('provider_happened_at')->unique();
                $table->index(['shipment_id', 'provider_happened_at']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('shipment_trackings', function (Blueprint $table): void {
            $table->dropIndex(['shipment_id', 'provider_happened_at']);
            $table->dropUnique(['payload_hash']);
            $table->dropColumn(['provider_happened_at', 'payload_hash']);
        });
    }
};
