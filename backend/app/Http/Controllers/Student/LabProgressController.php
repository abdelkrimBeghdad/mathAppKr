<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LabProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LabProgressController extends Controller
{
    public function index()
    {
        $progress = LabProgress::where('user_id', Auth::id())->get();
        return response()->json($progress);
    }

    public function show($labId)
    {
        $progress = LabProgress::where('user_id', Auth::id())
            ->where('lab_id', $labId)
            ->first();

        return response()->json($progress ?: ['lab_id' => $labId, 'phase' => 'intro', 'best_score' => 0, 'attempts' => 0]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'lab_id' => 'required|string',
            'phase' => 'required|in:intro,learn,practice,completed',
            'score' => 'nullable|integer',
        ]);

        $progress = LabProgress::firstOrNew([
            'user_id' => Auth::id(),
            'lab_id' => $request->lab_id,
        ]);

        $progress->phase = $request->phase;
        
        if ($request->has('score')) {
            if ($request->score > $progress->best_score) {
                $progress->best_score = $request->score;
            }
            $progress->attempts += 1;
        }

        if ($request->phase === 'completed' && !$progress->completed_at) {
            $progress->completed_at = now();
        }

        $progress->save();

        return response()->json([
            'status' => 'success',
            'data' => $progress
        ]);
    }
}
