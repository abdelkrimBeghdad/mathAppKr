<?php

namespace App\Http\Controllers;

use App\Models\PersonalGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalGoalController extends Controller
{
    public function index()
    {
        return PersonalGoal::where('user_id', Auth::id())->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:lessons,xp,battles,quizzes',
            'target' => 'required|integer|min:1',
        ]);

        $goal = PersonalGoal::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'type' => $request->type,
            'target' => $request->target,
            'progress' => 0,
            'is_completed' => false,
        ]);

        return response()->json($goal, 201);
    }

    public function updateProgress(Request $request, PersonalGoal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate(['progress_added' => 'required|integer|min:1']);

        $goal->progress += $request->progress_added;

        if ($goal->progress >= $goal->target && !$goal->is_completed) {
            $goal->progress = $goal->target;
            $goal->is_completed = true;

            // Simple gamification logic
            $gamification = new \App\Services\GamificationService();
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $gamification->awardXp($user, 50, "أكملت هدفك الشخصي: {$goal->title}");
        }

        $goal->save();
        return response()->json($goal);
    }

    public function destroy(PersonalGoal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $goal->delete();
        return response()->json(['message' => 'Goal deleted']);
    }
}
