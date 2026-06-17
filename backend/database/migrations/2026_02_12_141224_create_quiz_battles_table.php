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
        Schema::create('quiz_battles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenger_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('opponent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->integer('challenger_score')->default(0);
            $table->integer('opponent_score')->default(0);
            $table->string('status')->default('pending'); // pending, ongoing, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiz_battles');
    }
};
