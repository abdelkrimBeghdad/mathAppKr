<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumQuestion;
use App\Models\ForumAnswer;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index()
    {
        return ForumQuestion::with(['user', 'answers.user'])
            ->withCount(['answers', 'votes'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function destroy(ForumQuestion $question)
    {
        $question->delete();
        return response()->json(['message' => 'Question deleted successfully']);
    }

    public function destroyAnswer(ForumAnswer $answer)
    {
        $answer->delete();
        return response()->json(['message' => 'Answer deleted successfully']);
    }

    public function togglePin(ForumQuestion $question)
    {
        $question->update(['is_pinned' => !$question->is_pinned]);
        return response()->json([
            'message' => $question->is_pinned ? 'Question pinned' : 'Question unpinned',
            'is_pinned' => $question->is_pinned
        ]);
    }

    public function toggleLock(ForumQuestion $question)
    {
        $question->update(['is_locked' => !$question->is_locked]);
        return response()->json([
            'message' => $question->is_locked ? 'Question locked' : 'Question unlocked',
            'is_locked' => $question->is_locked
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'total_questions' => ForumQuestion::count(),
            'total_answers' => ForumAnswer::count(),
            'solved_questions' => ForumQuestion::where('is_solved', true)->count(),
            'unsolved_questions' => ForumQuestion::where('is_solved', false)->count(),
        ]);
    }
}
