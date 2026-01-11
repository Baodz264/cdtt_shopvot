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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('SET NULL');
            $table->foreignId('address_id')->nullable()->constrained('address')->onDelete('SET NULL');
            $table->string('fullname', 150);
            $table->string('phone', 20);
            $table->text('note')->nullable();
            $table->double('total_money');
            $table->enum('payment_method', ['cod', 'momo', 'vnpay', 'paypal']);
            $table->enum('status', ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->foreignId('voucher_id')->nullable()->constrained('voucher')->onDelete('SET NULL');
            $table->double('discount_price')->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};