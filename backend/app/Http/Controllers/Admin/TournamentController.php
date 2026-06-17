<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tournament;
use App\Models\TournamentParticipant;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    /**
     * Display a listing of the tournaments.
     */
    public function index()
    {
        return Tournament::withCount('participants')
            ->orderBy('start_time', 'desc')
            ->paginate(15);
    }

    /**
     * Store a newly created tournament in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'prize_coins' => 'required|integer|min:0',
            'prize_xp' => 'required|integer|min:0',
            'min_level' => 'required|integer|min:1',
            'status' => 'required|in:upcoming,active,finished',
        ]);

        $tournament = Tournament::create($validated);

        return response()->json([
            'message' => 'تم إنشاء البطولة بنجاح',
            'tournament' => $tournament
        ], 201);
    }

    /**
     * Display the specified tournament with statistics.
     */
    public function show(Tournament $tournament)
    {
        $tournament->load(['participants.user:id,name']);

        $stats = [
            'total_participants' => $tournament->participants()->count(),
            'finished_participants' => $tournament->participants()->whereNotNull('finished_at')->count(),
            'average_score' => $tournament->participants()->whereNotNull('finished_at')->avg('score') ?? 0,
            'top_score' => $tournament->participants()->max('score') ?? 0,
        ];

        return response()->json([
            'tournament' => $tournament,
            'stats' => $stats
        ]);
    }

    /**
     * Update the specified tournament in storage.
     */
    public function update(Request $request, Tournament $tournament)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'prize_coins' => 'required|integer|min:0',
            'prize_xp' => 'required|integer|min:0',
            'min_level' => 'required|integer|min:1',
            'status' => 'required|in:active,draft,finished',
        ]);

        $tournament->update($validated);

        return response()->json([
            'message' => 'تم تحديث البطولة بنجاح',
            'tournament' => $tournament
        ]);
    }

    /**
     * Remove the specified tournament from storage.
     */
    public function destroy(Tournament $tournament)
    {
        // Maybe check if it has participants before deleting, or just delete everything cascade
        $tournament->delete();

        return response()->json(['message' => 'تم حذف البطولة بنجاح']);
    }
}
