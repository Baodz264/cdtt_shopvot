<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_sale', function (Blueprint $table) {
            $table->id();

            // Quan hệ sản phẩm (1 sản phẩm chỉ có 1 sale)
            $table->foreignId('product_id')
                  ->unique()
                  ->constrained('product')
                  ->cascadeOnDelete();

            // Giá
            $table->double('original_price');
            $table->double('sale_price');
            $table->integer('sale_percent')->nullable(); // % giảm giá

            // Thời gian áp dụng
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Trạng thái sale
            $table->boolean('status')->default(true);

            $table->timestamps();

            // Index
            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sale');
    }
};
