<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_verified')->default(false);
            $table->string('email_verification_token', 255)->nullable();
            $table->string('otp', 6)->nullable();
            $table->timestamp('otp_expired_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_verified', 'email_verification_token', 'otp', 'otp_expired_at']);
        });
    }
};
