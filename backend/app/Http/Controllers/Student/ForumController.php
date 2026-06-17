<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ForumQuestion;
use App\Models\ForumAnswer;
use App\Models\Vote;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForumController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'newest');
        $query = ForumQuestion::with('user')->withCount('answers', 'votes');

        switch ($filter) {
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            case 'unsolved':
                $query->where('is_solved', false)->orderBy('created_at', 'desc');
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate(10);
    }

    public function show(ForumQuestion $question)
    {
        $question->increment('views_count');

        return $question->load([
            'user',
            'answers.user',
            'answers.votes',
            'votes'
        ])->loadCount('votes');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $validated['title'] = htmlspecialchars($validated['title'], ENT_QUOTES, 'UTF-8');
        $validated['content'] = htmlspecialchars($validated['content'], ENT_QUOTES, 'UTF-8');

        $question = $request->user()->forumQuestions()->create($validated);

        return response()->json($question, 201);
    }

    public function getQuestionVotes(ForumQuestion $question, Request $request)
    {
        $userVote = $question->votes()->where('user_id', $request->user()->id)->first();
        return response()->json([
            'score' => $question->score,
            'user_vote' => optional($userVote)->value ?? 0
        ]);
    }

    public function voteQuestion(Request $request, ForumQuestion $question)
    {
        $validated = $request->validate(['value' => 'required|in:1,-1']);

        $vote = $question->votes()->updateOrCreate(
        ['user_id' => $request->user()->id],
        ['value' => $validated['value']]
        );

        return response()->json(['score' => $question->score]);
    }

    public function storeAnswer(Request $request, ForumQuestion $question)
    {
        if ($question->is_locked) {
            return response()->json([
                'error' => 'Question locked',
                'message' => 'هذا النقاش مغلق ولا يمكن إضافة ردود جديدة.'
            ], 403);
        }

        $validated = $request->validate(['content' => 'required|string']);

        $answer = $question->answers()->create([
            'user_id' => $request->user()->id,
            'content' => htmlspecialchars($validated['content'], ENT_QUOTES, 'UTF-8')
        ]);

        return response()->json($answer->load('user'), 201);
    }

    public function voteAnswer(Request $request, ForumAnswer $answer)
    {
        $validated = $request->validate(['value' => 'required|in:1,-1']);

        $vote = $answer->votes()->updateOrCreate(
        ['user_id' => $request->user()->id],
        ['value' => $validated['value']]
        );

        return response()->json(['score' => $answer->score]);
    }

    public function markSolved(Request $request, ForumAnswer $answer)
    {
        $question = $answer->question;

        if ($request->user()->id !== $question->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($question, $answer) {
            $question->update(['is_solved' => true]);

            // Reset other answers
            $question->answers()->update(['is_accepted' => false]);

            // Mark this accepted
            $answer->update(['is_accepted' => true]);

            // Award XP to answer author
            if ($answer->user_id !== $question->user_id) {
                $gamification = new GamificationService();
                $gamification->awardXp($answer->user, 50, "Accepted solution: {$question->title}");
            }
        });

        return response()->json(['message' => 'Marked as solved']);
    }
}
