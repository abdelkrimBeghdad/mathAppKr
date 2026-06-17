<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index()
    {
        // Get top 10 students by points
        $topStudents = User::orderBy('points', 'desc')
            ->limit(10)
            ->get(['name', 'points', 'level', 'xp']);

        return response()->json($topStudents);
    }

    public function userStats(Request $request)
    {
        $user = $request->user()->load('badges');

        return response()->json([
            'points' => $user->points,
            'level' => $user->level,
            'xp' => $user->xp,
            'xp_next_level' => $user->level * 1000, // Simple formula
            'badges' => $user->badges,
        ]);
    }
    public function getPlayers(Request $request)
    {
        return User::where('id', '!=', $request->user()->id)
            ->get(['id', 'name', 'points', 'level']);
    }
}
