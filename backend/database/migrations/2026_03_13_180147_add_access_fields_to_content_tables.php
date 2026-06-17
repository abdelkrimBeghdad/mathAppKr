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
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('access_type')->default('classic');
            $table->integer('price')->default(0);
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->string('access_type')->default('classic');
            $table->integer('price')->default(0);
        });

        Schema::table('fields', function (Blueprint $table) {
            $table->string('access_type')->default('classic');
            $table->integer('price')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['access_type', 'price']);
        });
        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn(['access_type', 'price']);
        });
        Schema::table('fields', function (Blueprint $table) {
            $table->dropColumn(['access_type', 'price']);
        });
    }
};
