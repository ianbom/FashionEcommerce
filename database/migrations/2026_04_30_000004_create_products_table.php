<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('collection_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 180);
            $table->string('slug', 200)->unique();
            $table->string('sku', 100)->nullable()->unique();
            $table->text('short_description')->nullable();
            $table->text('description')->nullable();
            $table->string('material', 150)->nullable();
            $table->text('care_instruction')->nullable();
            $table->decimal('base_price', 15, 2);
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->integer('weight')->default(0);
            $table->integer('length')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('status', 30)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_best_seller')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'is_featured']);
            $table->index(['status', 'is_new_arrival']);
            $table->index(['status', 'is_best_seller']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
