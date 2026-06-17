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
        Schema::create('tournaments', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('title');
            $blueprint->text('description')->nullable();
            $blueprint->dateTime('start_time');
            $blueprint->dateTime('end_time');
            $blueprint->integer('prize_coins')->default(0);
            $blueprint->integer('prize_xp')->default(0);
            $blueprint->integer('min_level')->default(1);
            $blueprint->enum('status', ['upcoming', 'active', 'finished'])->default('upcoming');
            $blueprint->timestamps();
        });

        Schema::create('tournament_participants', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('tournament_id')->constrained()->onDelete('cascade');
            $blueprint->foreignId('user_id')->constrained()->onDelete('cascade');
            $blueprint->integer('score')->nullable();
            $blueprint->integer('time_taken')->nullable(); // in seconds
            $blueprint->dateTime('finished_at')->nullable();
            $blueprint->timestamps();

            $blueprint->unique(['tournament_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_participants');
        Schema::dropIfExists('tournaments');
    }
};
