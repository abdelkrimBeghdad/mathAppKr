<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\QuizResult;
use App\Models\UserProgress;
use App\Models\Notification;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller
{
    public function getQuiz(Lesson $lesson)
    {
        $questions = $lesson->questions()
            ->inRandomOrder()
            ->get(['id', 'question_text', 'options', 'type']);

        // Shuffle options for MCQ
        $questions->transform(function ($q) {
            if ($q->type === 'mcq' && is_array($q->options)) {
                $opts = $q->options;
                shuffle($opts);
                $q->options = $opts;
            }
            return $q;
        });

        return response()->json($questions);
    }

    public function submitQuiz(Request $request, Lesson $lesson)
    {
        $request->validate([
            'answers' => 'required|array',
            'time_taken' => 'integer'
        ]);

        $user = Auth::user();
        if (!$user instanceof \App\Models\User) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $questions = $lesson->questions;
        $totalQuestions = $questions->count();
        $correctCount = 0;
        $feedback = [];

        foreach ($questions as $question) {
            $userAnswer = $this->normalizeAnswer($request->answers[$question->id] ?? '');
            $correctAnswer = $this->normalizeAnswer($question->correct_answer ?? '');
            
            $isCorrect = $userAnswer !== '' && $userAnswer === $correctAnswer;

            if ($isCorrect) {
                $correctCount++;
            }

            $feedback[] = [
                'question_id' => $question->id,
                'is_correct' => $isCorrect,
                'correct_answer' => $question->correct_answer,
                'explanation' => $question->explanation
            ];
        }

        $score = ($totalQuestions > 0) ? round(($correctCount / $totalQuestions) * 100) : 0;

        $result = QuizResult::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'time_taken' => $request->time_taken ?: 0
        ]);

        UserProgress::updateOrCreate(
        ['user_id' => $user->id, 'lesson_id' => $lesson->id],
        ['score' => $score, 'status' => $score >= 60 ? 'completed' : 'in_progress']
        );

        // Reward points and coins
        $gamification = new GamificationService();
        $reward = $gamification->awardXp($user, $score * 2, "Quiz completed: {$lesson->name}");

        // Auto-increment goals
        if ($score >= 60) {
            $gamification->incrementGoalProgress($user->id, 'lessons', 1);
        }
        $gamification->incrementGoalProgress($user->id, 'quizzes', 1);

        // Award coins: e.g., 50% of score
        $coinsEarned = round($score / 2);
        $user->increment('coins', $coinsEarned);

        // Send Notification
        Notification::send(
            $user->id,
            'quiz',
            'تم إكمال الاختبار ✅',
            "لقد حصلت على تقييم {$score}% في درس {$lesson->name}",
            '✅'
        );

        return response()->json([
            'result' => $result,
            'feedback' => $feedback,
            'reward' => $reward,
            'score' => $score,
            'passed' => $score >= 60
        ]);
    }

    private function normalizeAnswer($str)
    {
        if (is_null($str)) return '';
        $str = (string)$str;
        // Remove all whitespace
        $str = preg_replace('/\s+/', '', $str);
        // Normalize common math characters
        $str = str_replace(['،', ';'], ',', $str);
        // Convert Arabic/Persian numbers to English
        $arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        $persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        $english = ['0','1','2','3','4','5','6','7','8','9'];
        $str = str_replace($arabic, $english, $str);
        $str = str_replace($persian, $english, $str);
        
        return strtolower(trim($str));
    }
}
