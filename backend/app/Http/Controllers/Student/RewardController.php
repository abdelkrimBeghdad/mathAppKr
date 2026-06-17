<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

        // Base reward for any lab completion
        $coins = 100;
        $xp = 200;

        $user->increment('coins', $coins);
        $user->increment('xp', $xp);

        // Logic for awarding a special badge if they complete many labs
        // For simplicity, let's say after 5 completions across all labs, they get "Algebra Explorer"
        // This is a placeholder for more complex logic
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
}
