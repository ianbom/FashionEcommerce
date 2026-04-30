<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('customer_address_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number', 100)->unique();
            $table->string('customer_name', 150);
            $table->string('customer_email', 191);
            $table->string('customer_phone', 30);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->foreignId('voucher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('voucher_code', 50)->nullable();
            $table->string('payment_status', 50)->default('pending');
            $table->string('order_status', 50)->default('pending_payment');
            $table->string('shipping_status', 50)->default('not_created');
            $table->boolean('no_return_refund_agreed')->default(false);
            $table->timestamp('no_return_refund_agreed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('payment_status');
            $table->index('order_status');
            $table->index('shipping_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
