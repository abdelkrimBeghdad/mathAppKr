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
            $table->integer('coins')->default(0)->after('xp');
            $table->timestamp('last_daily_reward_at')->nullable()->after('coins');
        });

        Schema::create('store_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // avatar, theme, banner
            $table->text('description')->nullable();
            $table->integer('price')->default(0);
            $table->string('image_url')->nullable();
            $table->json('metadata')->nullable(); // For theme colors or special properties
            $table->timestamps();
        });

        Schema::create('user_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_item_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_equipped')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'store_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['coins', 'last_daily_reward_at']);
        });
        Schema::dropIfExists('user_inventory');
        Schema::dropIfExists('store_items');
    }
};
