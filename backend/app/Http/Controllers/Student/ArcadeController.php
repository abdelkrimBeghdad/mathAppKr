<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ArcadeScore;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArcadeController extends Controller
{
    /**
     * Generate random mental math questions.
     */
    public function getQuestions()
    {
        $questions = [];
        for ($i = 0; $i < 20; $i++) {
            $questions[] = $this->generateArithmeticQuestion($i);
        }
        return response()->json($questions);
    }

    private function generateArithmeticQuestion($index)
    {
        $level = floor($index / 5) + 1; // Increase difficulty every 5 questions
        $operators = ['+', '-', '*'];
        if ($level > 2)
            $operators[] = '/';

        $op = $operators[array_rand($operators)];

        switch ($op) {
            case '*':
                $a = rand(2, 5 * $level);
                $b = rand(2, 5 * $level);
                $answer = $a * $b;
                break;
            case '/':
                $b = rand(2, 5 * $level);
                $answer = rand(1, 5 * $level);
                $a = $answer * $b;
                break;
            case '-':
                $a = rand(10 * $level, 50 * $level);
                $b = rand(1, $a);
                $answer = $a - $b;
                break;
            default: // +
                $a = rand(5 * $level, 50 * $level);
                $b = rand(5 * $level, 50 * $level);
                $answer = $a + $b;
        }

        $options = [$answer];
        while (count($options) < 4) {
            $wrong = $answer + rand(-10, 10);
            if (!in_array($wrong, $options) && $wrong >= 0) {
                $options[] = $wrong;
            }
        }
        shuffle($options);

        return [
            'id' => uniqid(),
            'question_text' => "{$a} {$op} {$b} = ?",
            'options' => $options,
            'correct_answer' => (string)$answer,
            'type' => 'mcq'
        ];
    }

    public function submitScore(Request $request)
    {
        $request->validate([
            'score' => 'required|integer|min:0',
            'max_streak' => 'required|integer|min:0',
        ]);

        $user = Auth::user();
        if (!$user instanceof \App\Models\User)
            return response()->json(['error' => 'Unauthorized'], 401);

        $arcadeScore = ArcadeScore::create([
            'user_id' => $user->id,
            'score' => $request->score,
            'max_streak' => $request->max_streak,
            'played_at' => now(),
        ]);

        // Rewards logic
        $gamification = new GamificationService();
        $xpEarned = $request->score * 5; // 5 XP per point
        $coinsEarned = floor($request->score / 5); // 1 coin per 5 points

        $gamification->awardXp($user, $xpEarned, "Arcade Mode: Score {$request->score}");
        $user->increment('coins', $coinsEarned);

        return response()->json([
            'message' => 'High score saved!',
            'xp_earned' => $xpEarned,
            'coins_earned' => $coinsEarned,
            'arcadescore' => $arcadeScore
        ]);
    }

    public function leaderboard()
    {
        return ArcadeScore::with('user:id,name')
            ->orderBy('score', 'desc')
            ->take(20)
            ->get();
    }
}
