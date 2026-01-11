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
        Schema::create('post', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->nullable()->constrained('topic')->onDelete('SET NULL');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('SET NULL');
            $table->string('title', 200);
            $table->string('slug', 200)->unique();
            $table->string('excerpt', 500)->nullable();
            $table->longText('content');
            $table->string('image')->nullable();
            $table->enum('type', ['post', 'page'])->default('post');
            $table->tinyInteger('status')->default(1);
            $table->integer('views')->default(0);
            $table->string('seo_title', 255)->nullable();
            $table->string('seo_description', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post');
    }
};