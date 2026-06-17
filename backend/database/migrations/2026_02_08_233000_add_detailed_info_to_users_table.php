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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('parent_phone')->nullable()->after('phone');
            $table->string('school')->nullable()->after('parent_phone');
            $table->string('wilaya')->nullable()->after('school');
            $table->date('birth_date')->nullable()->after('wilaya');
            $table->string('grade_level')->nullable()->after('birth_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'parent_phone', 'school', 'wilaya', 'birth_date', 'grade_level']);
        });
    }
};
