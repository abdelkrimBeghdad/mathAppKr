<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\SecurityIncident;
use Illuminate\Support\Facades\Log;

class RewardController extends Controller
{
    public function getDailyStatus(Request $request)
    {
        $user = $request->user();
        $lastClaim = $user->last_daily_reward_at;

        // Check if claimed today (calendar day)
        $canClaim = !$lastClaim || !Carbon::parse($lastClaim)->isToday();

        return response()->json([
            'can_claim' => $canClaim,
            'last_claimed_at' => $lastClaim,
        ]);
    }

    public function claimDaily(Request $request)
    {
        $user = $request->user();
        $lastClaim = $user->last_daily_reward_at;

        if ($lastClaim && Carbon::parse($lastClaim)->isToday()) {
            return response()->json(['message' => 'لقد حصلت على مكافأتك اليومية بالفعل اليوم'], 422);
        }

        $rewardAmount = rand(50, 150); // Random coins between 50 and 150

        $user->increment('coins', $rewardAmount);
        $user->update(['last_daily_reward_at' => now()]);

        return response()->json([
            'message' => 'مبروك! لقد حصلت على مكافأة يومية',
            'amount' => $rewardAmount,
            'new_balance' => $user->coins,
        ]);
    }

    /**
     * Award rewards for completing an interactive lab.
     */
    public function awardLabCompletion(Request $request)
    {
        $request->validate([
            'lab_id' => 'required|string',
        ]);

        $user = $request->user();
        $labId = $request->lab_id;
        $verification = $request->input('verification');

        // 1. التحقق العام من وجود تقدم للمختبر لجميع مختبرات MasteryWorld (48+ مختبر)
        $allProgress = \App\Models\LabProgress::where('user_id', $user->id)->get();
        $progress = $allProgress->first(function ($p) use ($labId) {
            $pLabId = $p->lab_id;
            if ($pLabId === $labId) {
                return true;
            }
            $prefix = substr($labId, 0, 8);
            if (str_starts_with($labId, $pLabId) || str_starts_with($pLabId, $labId) || str_starts_with($pLabId, $prefix)) {
                return true;
            }
            return false;
        });

        if (!$progress || !in_array($progress->phase, ['practice', 'completed'])) {
            $this->logSecurityIncident($user, 'missing_lab_progress', $labId, $request);
            return response()->json([
                'error' => 'Cheat detected',
                'message' => 'You must start and practice the lab before claiming the reward.'
            ], 403);
        }

        // 2. التحقق الرياضي المخصص للمختبرات المفروض عليها التحقق حالياً
        $enforcedLabs = ['sys-add-mastery'];

        if (in_array($labId, $enforcedLabs)) {
            if (!$verification || !is_array($verification)) {
                $this->logSecurityIncident($user, 'missing_verification', $labId, $request);
                return response()->json([
                    'error' => 'Cheat detected',
                    'message' => 'Missing verification payload for enforced security lab.'
                ], 403);
            }

            $type = $verification['type'] ?? '';

            if ($type === 'system') {
                $eq1 = $verification['eq1'] ?? null;
                $eq2 = $verification['eq2'] ?? null;
                $x = $verification['x'] ?? null;
                $y = $verification['y'] ?? null;

                if ($eq1 === null || $eq2 === null || $x === null || $y === null) {
                    $this->logSecurityIncident($user, 'invalid_verification_structure', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Invalid verification payload structure.'
                    ], 403);
                }

                if (!is_numeric($x) || !is_numeric($y)) {
                    $this->logSecurityIncident($user, 'non_numeric_answers', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Answers must be numeric.'
                    ], 403);
                }

                // التحقق الرياضي من المعادلة الأولى
                $lhs1 = ($eq1['a'] ?? 0) * $x + ($eq1['b'] ?? 0) * $y;
                $rhs1 = $eq1['c'] ?? 0;

                // التحقق الرياضي من المعادلة الثانية
                $lhs2 = ($eq2['a'] ?? 0) * $x + ($eq2['b'] ?? 0) * $y;
                $rhs2 = $eq2['c'] ?? 0;

                if (abs($lhs1 - $rhs1) > 0.0001 || abs($lhs2 - $rhs2) > 0.0001) {
                    $this->logSecurityIncident($user, 'invalid_math_solution', $labId, $request, [
                        'eq1' => $eq1,
                        'eq2' => $eq2,
                        'submitted_x' => $x,
                        'submitted_y' => $y,
                    ]);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'The provided answers do not satisfy the equations.'
                    ], 403);
                }

                // منع المحاولات التافهة مثل 0x + 0y = 0
                if ((($eq1['a'] ?? 0) == 0 && ($eq1['b'] ?? 0) == 0) || (($eq2['a'] ?? 0) == 0 && ($eq2['b'] ?? 0) == 0)) {
                    $this->logSecurityIncident($user, 'trivial_equations', $labId, $request);
                    return response()->json([
                        'error' => 'Cheat detected',
                        'message' => 'Trivial equations are not allowed.'
                    ], 403);
                }
            } else {
                $this->logSecurityIncident($user, 'unknown_verification_type', $labId, $request);
                return response()->json([
                    'error' => 'Cheat detected',
                    'message' => 'Unknown verification type.'
                ], 403);
            }
        }

        // Base reward for any lab completion
        $coins = 100;
        $xp = 200;

        $user->increment('coins', $coins);
        $user->increment('xp', $xp);

        // Logic for awarding a special badge if they complete many labs
        $completionCount = \App\Models\UserProgress::where('user_id', $user->id)
            ->where('is_completed', true)
            ->count();

        $badgeAwarded = null;
        if ($completionCount >= 5) {
            $badge = \App\Models\Badge::where('slug', 'algebra-explorer')->first();
            if ($badge && !$user->badges->contains($badge->id)) {
                $user->badges()->attach($badge->id);
                $badgeAwarded = $badge;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'أحسنت! لقد أتممت المختبر بنجاح وحصلت على مكافأة',
            'reward' => [
                'coins' => $coins,
                'xp' => $xp
            ],
            'badge' => $badgeAwarded ? [
                'name' => $badgeAwarded->name,
                'icon' => $badgeAwarded->icon,
                'description' => $badgeAwarded->description
            ] : null
        ]);
    }

    private function logSecurityIncident($user, $type, $labId, Request $request, $extraDetails = [])
    {
        SecurityIncident::create([
            'user_id' => $user->id,
            'type' => 'lab_cheating',
            'severity' => 'high',
            'details' => array_merge([
                'cheat_type' => $type,
                'lab_id' => $labId,
                'path' => $request->path()
            ], $extraDetails),
            'ip_address' => $request->ip(),
        ]);
        Log::warning("AntiCheat: Lab cheating detected from User {$user->id} on lab {$labId} - Type: {$type}");
    }
}
