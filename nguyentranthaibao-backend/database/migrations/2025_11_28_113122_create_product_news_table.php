<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_new', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                  ->unique()
                  ->constrained('product')
                  ->cascadeOnDelete();

            // Thời gian được coi là "sản phẩm mới"
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Trạng thái
            $table->boolean('status')->default(true);

            $table->timestamps();

            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_new');
    }
};
