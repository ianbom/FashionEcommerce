<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_name', 150);
            $table->string('recipient_phone', 30);
            $table->string('province', 100);
            $table->string('city', 100);
            $table->string('district', 100);
            $table->string('subdistrict', 100)->nullable();
            $table->string('postal_code', 20);
            $table->string('biteship_area_id', 100)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('full_address');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_addresses');
    }
};
