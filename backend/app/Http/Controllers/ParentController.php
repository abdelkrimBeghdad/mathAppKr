<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProgress;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParentController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'parent_phone' => 'required|string',
            'student_email' => 'required|email',
        ]);

        $student = User::where('email', $request->student_email)
            ->where('parent_phone', $request->parent_phone)
            ->where('is_admin', false)
            ->first();

        if (!$student) {
            return response()->json(['message' => 'بيانات غير صحيحة'], 401);
        }

        // Create a limited token for parent access
        $token = $student->createToken('parent-access', ['parent:view'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'school' => $student->school,
                'grade_level' => $student->grade_level,
                'points' => $student->points,
                'level' => $student->level,
                'xp' => $student->xp,
            ],
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Get progress data
        $progress = UserProgress::where('user_id', $user->id)
            ->with('lesson:id,name,section_id')
            ->get();

        $completedLessons = $progress->where('status', 'completed')->count();
        $totalLessons = DB::table('lessons')->count();

        // Calculate weekly activity
        $weeklyActivity = UserProgress::where('user_id', $user->id)
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();

        // Get recent quiz scores
        $recentScores = $progress->sortByDesc('updated_at')
            ->take(10)
            ->map(function ($p) {
            return [
            'lesson' => $p->lesson->name ?? 'درس',
            'score' => $p->score,
            'status' => $p->status,
            'date' => $p->updated_at->format('Y-m-d'),
            ];
        })->values();

        // Field-level mastery
        $fieldMastery = DB::table('user_progress')
            ->join('lessons', 'user_progress.lesson_id', '=', 'lessons.id')
            ->join('sections', 'lessons.section_id', '=', 'sections.id')
            ->join('fields', 'sections.field_id', '=', 'fields.id')
            ->where('user_progress.user_id', $user->id)
            ->select('fields.name as field_name', DB::raw('AVG(user_progress.score) as avg_score'), DB::raw('COUNT(*) as lessons_done'))
            ->groupBy('fields.name')
            ->get();

        return response()->json([
            'student' => [
                'name' => $user->name,
                'school' => $user->school,
                'points' => $user->points,
                'level' => $user->level,
                'xp' => $user->xp,
            ],
            'summary' => [
                'completed_lessons' => $completedLessons,
                'total_lessons' => $totalLessons,
                'completion_rate' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
                'weekly_activity' => $weeklyActivity,
            ],
            'recent_scores' => $recentScores,
            'field_mastery' => $fieldMastery,
        ]);
    }
}
