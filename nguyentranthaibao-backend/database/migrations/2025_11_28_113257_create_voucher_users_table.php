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
        Schema::create('voucher_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_id')->constrained('voucher')->onDelete('CASCADE');
            $table->foreignId('user_id')->constrained('users')->onDelete('CASCADE');
            $table->foreignId('order_id')->constrained('orders')->onDelete('CASCADE');
            $table->timestamp('used_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_user');
    }
};