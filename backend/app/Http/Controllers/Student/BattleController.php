<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizBattle;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Notification;
use App\Events\BattleUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BattleController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $battles = QuizBattle::with(['challenger', 'opponent', 'lesson'])
            ->where('challenger_id', $user->id)
            ->orWhere('opponent_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $battles;
    }

    public function createChallenge(Request $request)
    {
        $request->validate([
            'opponent_id' => 'required|exists:users,id',
            'lesson_id' => 'required|exists:lessons,id'
        ]);

        $user = $request->user();

        if ($user->id === (int)$request->opponent_id) {
            return response()->json(['error' => 'You cannot challenge yourself'], 422);
        }

        $battle = QuizBattle::create([
            'challenger_id' => $user->id,
            'opponent_id' => $request->opponent_id,
            'lesson_id' => $request->lesson_id,
            'status' => 'pending'
        ]);

        // Notify Opponent
        \App\Models\Notification::send(
            $request->opponent_id,
            'challenge',
            'تحدي جديد! ⚔️',
            "لقد تحداك {$request->user()->name} في مسابقة سريعة",
            '⚔️',
            "/student/battles/{$battle->id}"
        );

        return response()->json($battle);
    }

    public function submitScore(Request $request, QuizBattle $battle)
    {
        $request->validate(['score' => 'required|integer|min:0|max:100']);

        $user = $request->user();

        if ($battle->challenger_id == $user->id) {
            $battle->update(['challenger_score' => $request->score]);
        }
        elseif ($battle->opponent_id == $user->id) {
            $battle->update(['opponent_score' => $request->score]);
        }
        else {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Update status
        if ($battle->status === 'pending') {
            $battle->update(['status' => 'ongoing']);
        }

        if ($battle->challenger_score !== null && $battle->opponent_score !== null && $battle->status !== 'completed') {
            $battle->update(['status' => 'completed']);
            $this->awardWinner($battle);

            // Notify both players of completion
            Notification::send(
                $battle->challenger_id,
                'challenge',
                'انتهت المعركة! 🏁',
                "تم تحديد الفائز في تحديك مع {$battle->opponent->name}",
                '🏁'
            );
            Notification::send(
                $battle->opponent_id,
                'challenge',
                'انتهت المعركة! 🏁',
                "تم تحديد الفائز في تحديك مع {$battle->challenger->name}",
                '🏁'
            );
        }

        $battleData = $battle->load(['challenger', 'opponent', 'lesson']);

        // Broadcast the update to the players - Wrapped in try-catch to prevent 500 error if broadcasting server is down
        try {
            broadcast(new BattleUpdated($battleData));
        }
        catch (\Exception $e) {
            \Log::warning("Broadcasting failed for battle {$battle->id}: " . $e->getMessage());
        }

        return $battleData;
    }

    private function awardWinner($battle)
    {
        $gamification = new \App\Services\GamificationService();

        if ($battle->challenger_score > $battle->opponent_score) {
            $gamification->awardXp($battle->challenger, 200, "Won a quiz battle against {$battle->opponent->name}");
            $gamification->awardXp($battle->opponent, 50, "Participated in a quiz battle");
            $gamification->incrementGoalProgress($battle->challenger_id, 'battles', 1);
        }
        elseif ($battle->opponent_score > $battle->challenger_score) {
            $gamification->awardXp($battle->opponent, 200, "Won a quiz battle against {$battle->challenger->name}");
            $gamification->awardXp($battle->challenger, 50, "Participated in a quiz battle");
            $gamification->incrementGoalProgress($battle->opponent_id, 'battles', 1);
        }
        else {
            // Draw
            $gamification->awardXp($battle->challenger, 100, "Draw in a quiz battle");
            $gamification->awardXp($battle->opponent, 100, "Draw in a quiz battle");
        }
    }
}
