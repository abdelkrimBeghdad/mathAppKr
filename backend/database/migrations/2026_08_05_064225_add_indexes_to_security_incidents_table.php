<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the indexes security_incidents was missing for the queries
 * Admin\SecurityController actually runs today:
 *
 *   - ->orderBy('created_at', 'desc')->paginate(20)   (the admin incident list)
 *   - ->where('severity', 'critical')->count()
 *   - ->where('severity', 'high')->count()
 *   - ->where('created_at', '>=', now()->subDays(7))->count()
 *
 * None of these columns had an index — every one of those queries was doing
 * a full table scan. user_id already has an index automatically from
 * foreignId()->constrained(), so it's untouched here.
 *
 * This matters more starting today specifically: the 5 new Verifier classes
 * (Algebra/Geometry/Trig/Vector/StatsVerifier) call logSecurityIncident() on
 * every rejected answer across ~20 new verification types, so this table's
 * write volume — and therefore the cost of scanning it without an index —
 * is meaningfully higher than it was before this session's work.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('security_incidents', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('severity');
        });
    }

    public function down(): void
    {
        Schema::table('security_incidents', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['severity']);
        });
    }
};
