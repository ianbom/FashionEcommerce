<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipment_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->cascadeOnDelete();
            $table->string('status', 100);
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('happened_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index(['shipment_id', 'happened_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_trackings');
    }
};
