<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->nullable()->constrained('brand')->onDelete('SET NULL');
            $table->foreignId('category_id')->nullable()->constrained('category')->onDelete('SET NULL'); // liên kết trực tiếp với category
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->double('price');
            $table->double('sale_price')->nullable();
            $table->string('sku', 100)->nullable();
            $table->integer('stock')->default(0);
            $table->string('thumbnail')->nullable();
            $table->text('description')->nullable();
            $table->longText('detail')->nullable();
            $table->tinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product');
    }
};
