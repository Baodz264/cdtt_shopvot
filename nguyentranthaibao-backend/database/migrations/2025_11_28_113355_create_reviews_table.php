// database/migrations/2025_11_28_113355_create_reviews_table.php
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
        Schema::create('review', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('SET NULL');
            $table->foreignId('product_id')->constrained('product')->onDelete('CASCADE');
            $table->tinyInteger('rating')->unsigned(); // GIỮ DÒNG NÀY
            $table->text('content')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('created_at')->useCurrent();
            // $table->checkConstraint('rating BETWEEN 1 AND 5', 'review_rating_check'); // XÓA DÒNG GÂY LỖI
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review');
    }
};