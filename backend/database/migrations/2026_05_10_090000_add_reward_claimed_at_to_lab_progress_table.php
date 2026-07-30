<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lab_progress', function (Blueprint $table) {
            // Marks the exact moment the coin/xp reward for this lab was granted.
            // Presence of this timestamp blocks any further reward claims for the same
            // (user_id, lab_id) pair, closing the infinite reward-farming bug.
            $table->timestamp('reward_claimed_at')->nullable()->after('completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('lab_progress', function (Blueprint $table) {
            $table->dropColumn('reward_claimed_at');
        });
    }
};
