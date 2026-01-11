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
        Schema::create('import_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_id')->constrained('import')->onDelete('CASCADE');
            $table->foreignId('product_id')->constrained('product')->onDelete('CASCADE');
            $table->integer('quantity');
            $table->double('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_item');
    }
};