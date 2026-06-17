<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentParticipant;
use App\Models\Question;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TournamentController extends Controller
{
    public function index()
    {
        return Tournament::orderBy('start_time', 'desc')->get();
    }

    public function show(Tournament $tournament)
    {
        return $tournament->load(['participants.user:id,name']);
    }

    public function join(Request $request, Tournament $tournament)
    {
        $user = $request->user();

        if ($tournament->status !== 'active') {
            return response()->json(['message' => 'البطولة غير نشطة حالياً'], 422);
        }

        if ($user->level < $tournament->min_level) {
            return response()->json(['message' => "تحتاج للمستوى {$tournament->min_level} للمشاركة"], 422);
        }

        $participant = TournamentParticipant::firstOrCreate([
            'tournament_id' => $tournament->id,
            'user_id' => $user->id,
        ]);

        return response()->json(['participant' => $participant, 'tournament' => $tournament]);
    }

    public function getQuestions(Tournament $tournament)
    {
        // For simplicity, we pick 10 random questions from all lessons
        // In a real scenario, tournaments might have specific pools
        $questions = Question::inRandomOrder()->take(10)->get(['id', 'question_text', 'options', 'type']);
        return response()->json($questions);
    }

    public function submitScore(Request $request, Tournament $tournament)
    {
        $request->validate([
            'answers' => 'required|array',
            'time_taken' => 'required|integer',
        ]);

        $user = $request->user();

        // Calculate corectness
        $correctCount = 0;
        $totalQuestions = count($request->answers);

        foreach ($request->answers as $questionId => $userAnswer) {
            $question = Question::find($questionId);
            if ($question && (string)$question->correct_answer === (string)$userAnswer) {
                $correctCount++;
            }
        }

        $calculatedScore = ($totalQuestions > 0) ? round(($correctCount / $totalQuestions) * 100) : 0;

        $participant = TournamentParticipant::where('tournament_id', $tournament->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'يجب التسجيل في البطولة أولاً'], 422);
        }

        if ($participant->finished_at) {
            return response()->json(['message' => 'لقد شاركت بالفعل في هذه البطولة'], 422);
        }

        $participant->update([
            'score' => $calculatedScore,
            'time_taken' => $request->time_taken,
            'finished_at' => now(),
        ]);

        // Immediate rewards for participation
        $gamification = new GamificationService();
        $participationXp = 50;
        $gamification->awardXp($user, $participationXp, "شارك في بطولة: {$tournament->title}");

        // Bonus for high score during submission
        if ($calculatedScore >= 80) {
            $user->increment('coins', 50);
        }

        return response()->json([
            'message' => 'تم تسجيل نتيجتك بنجاح!',
            'score' => $calculatedScore,
            'xp_earned' => $participationXp
        ]);
    }

    public function leaderboard(Tournament $tournament)
    {
        $leaderboard = TournamentParticipant::where('tournament_id', $tournament->id)
            ->whereNotNull('finished_at')
            ->with('user:id,name')
            ->orderBy('score', 'desc')
            ->orderBy('time_taken', 'asc')
            ->get();

        return response()->json($leaderboard);
    }
}
