<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_provider', 50)->default('midtrans');
            $table->string('payment_method', 100)->nullable();
            $table->string('midtrans_order_id', 100)->nullable()->unique();
            $table->string('midtrans_transaction_id', 150)->nullable();
            $table->string('midtrans_snap_token')->nullable();
            $table->string('midtrans_redirect_url')->nullable();
            $table->string('transaction_status', 50)->nullable();
            $table->string('fraud_status', 50)->nullable();
            $table->decimal('gross_amount', 15, 2);
            $table->string('currency', 10)->default('IDR');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'transaction_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
