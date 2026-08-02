<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\QuizResult;
use App\Models\UserProgress;
use App\Models\Field;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        $data = Cache::remember('admin_analytics_stats', 300, function () {
            // Total stats
            $stats = [
                'total_students' => User::where('is_admin', false)->count(),
                'avg_quiz_score' => QuizResult::avg('score') ?? 0,
                'lessons_completed' => UserProgress::where('status', 'completed')->count(),
                'total_points_distributed' => User::sum('xp'),
            ];

            // Quiz performance by field
            $fieldPerformance = Field::with(['lessons.quizResults'])
                ->get()
                ->map(function ($field) {
                    $scores = $field->lessons->flatMap->quizResults->pluck('score');
                    return [
                        'name' => $field->name,
                        'avg_score' => $scores->avg() ?? 0,
                        'count' => $scores->count()
                    ];
                });

            // Top 5 Students
            $topStudents = User::where('is_admin', false)
                ->orderBy('points', 'desc')
                ->limit(5)
                ->get(['name', 'points', 'xp', 'level', 'wilaya']);

            return [
                'summary' => $stats,
                'field_performance' => $fieldPerformance,
                'top_students' => $topStudents
            ];
        });

        return response()->json($data);
    }

    public function deepInsights()
    {
        $data = Cache::remember('admin_analytics_deep_insights', 300, function () {
            // 1. Difficulty Analysis (Lessons with lowest average quiz scores)
            $difficultLessons = Lesson::whereHas('quizResults')
                ->withCount('quizResults')
                ->withAvg('quizResults', 'score')
                ->orderBy('quiz_results_avg_score', 'asc')
                ->limit(10)
                ->get();

            // 2. Engagement Trends (Daily Active Users - last 30 days)
            $engagement = QuizResult::select(DB::raw('DATE(created_at) as date'), DB::raw('count(distinct user_id) as active_users'))
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            // 3. Completion Funnel (Percent of students at each field stage)
            $totalStudents = User::where('is_admin', false)->count();
            $fields = Field::withCount('lessons')->get();

            $funnel = $fields->map(function ($field) use ($totalStudents) {
                $studentsReached = UserProgress::whereIn('lesson_id', function ($query) use ($field) {
                    $query->select('lessons.id')
                        ->from('lessons')
                        ->join('sections', 'lessons.section_id', '=', 'sections.id')
                        ->where('sections.field_id', $field->id);
                })->distinct()->count('user_id');

                return [
                    'field' => $field->name,
                    'students_reached' => $studentsReached,
                    'reach_percent' => $totalStudents > 0 ? round(($studentsReached / $totalStudents) * 100, 1) : 0
                ];
            });

            return [
                'difficult_lessons' => $difficultLessons,
                'engagement' => $engagement,
                'funnel' => $funnel,
            ];
        });

        return response()->json($data);
    }

    public function studentActivity(Request $request)
    {
        $days = (int) $request->query('days', 7);

        $activity = Cache::remember("admin_analytics_activity_{$days}", 300, function () use ($days) {
            return DB::table('user_progress')
                ->select(DB::raw('DATE(updated_at) as date'), 'status', DB::raw('count(*) as count'))
                ->where('updated_at', '>=', now()->subDays($days))
                ->groupBy('date', 'status')
                ->get();
        });

        return response()->json($activity);
    }
}
