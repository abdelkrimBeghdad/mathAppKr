<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Support\Facades\Log;

class GamificationService
{
    public function awardXp(User $user, int $amount, string $reason = '', bool $shouldTriggerGoals = true)
    {
        $user->xp += $amount;
        $user->points += $amount; 

        $this->checkLevelUp($user);
        $user->save();

        // Increment XP goal progress - ONLY if triggered by external event, not by goal itself
        if ($shouldTriggerGoals) {
            $this->incrementGoalProgress($user->id, 'xp', $amount, false);
        }

        $this->checkBadges($user);

        return [
            'xp_added' => $amount,
            'new_xp' => $user->xp,
            'new_points' => $user->points,
            'new_level' => $user->level,
        ];
    }

    private function checkLevelUp(User $user)
    {
        $xpNeeded = $user->level * 1000;
        if ($xpNeeded <= 0) $xpNeeded = 1000; // Safety

        while ($user->xp >= $xpNeeded) {
            $user->level += 1;
            $user->xp -= $xpNeeded;
            Log::info("User ID {$user->id} leveled up to {$user->level}");
            $xpNeeded = $user->level * 1000;
        }
    }

    public function checkBadges(User $user)
    {
        $completedLessonsCount = $user->progress()->where('status', 'completed')->count();

        $badges = Badge::all();
        foreach ($badges as $badge) {
            // Already earned?
            if ($user->badges()->where('badge_id', $badge->id)->exists()) {
                continue;
            }

            $awarded = false;
            switch ($badge->requirement_type) {
                case 'completed_lessons':
                    if ($completedLessonsCount >= $badge->requirement_value) {
                        $awarded = true;
                    }
                    break;
                case 'total_points':
                    if ($user->points >= $badge->requirement_value) {
                        $awarded = true;
                    }
                    break;
            // Add more cases as needed
            }

            if ($awarded) {
                $user->badges()->attach($badge->id);
                Log::info("User ID {$user->id} earned badge: {$badge->name}");
            }
        }
    }

    /**
     * Increment personal goal progress automatically
     */
    public function incrementGoalProgress(int $userId, string $type, int $amount = 1, bool $shouldAwardXp = true)
    {
        $goals = \App\Models\PersonalGoal::where('user_id', $userId)
            ->where('type', $type)
            ->where('is_completed', false)
            ->get();

        foreach ($goals as $goal) {
            $goal->progress += $amount;
            if ($goal->progress >= $goal->target) {
                $goal->progress = $goal->target;
                $goal->is_completed = true;

                // Reward for completing a personal goal
                if ($shouldAwardXp) {
                    $user = \App\Models\User::find($userId);
                    if ($user) {
                        $this->awardXp($user, 100, "أكملت هدفك الشخصي: " . $goal->title, false);
                    }
                }
            }
            $goal->save();
        }
    }
}
