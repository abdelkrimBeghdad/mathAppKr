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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('summary')->nullable(); // Hawsala
            $table->text('example_problem')->nullable(); // Mithal
            $table->json('example_steps')->nullable(); // Thinking process steps
            $table->text('application_problem')->nullable(); // Tatbiq
            $table->text('application_solution')->nullable(); // Solution
            $table->integer('order')->default(0);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
