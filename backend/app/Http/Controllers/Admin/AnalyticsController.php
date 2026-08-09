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
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Total stats
        $stats = [
            'total_students' => User::where('is_admin', false)->count(),
            'avg_quiz_score' => QuizResult::avg('score') ?? 0,
            'lessons_completed' => UserProgress::where('status', 'completed')->count(),
            'total_points_distributed' => User::sum('xp'), // Assuming xp is the main point system now
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

        return response()->json([
            'summary' => $stats,
            'field_performance' => $fieldPerformance,
            'top_students' => $topStudents
        ]);
    }

    public function deepInsights()
    {
        // 1. Difficulty Analysis (Lessons with lowest average quiz scores)
        $difficultLessons = Lesson::whereHas('quizResults')
            ->withCount('quizResults')
            ->withAvg('quizResults', 'score')
            ->orderBy('quiz_results_avg_score', 'asc')
            ->limit(10)
            ->get();

        // 2. Engagement Trends (Daily Active Users - last 30 days)
        // Note: For now we approximate DAU based on quiz results and progress updates
        $engagement = QuizResult::select(DB::raw('DATE(created_at) as date'), DB::raw('count(distinct user_id) as active_users'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // 3. Completion Funnel (Percent of students at each field stage)
        // إصلاح خلل N+1: كانت الحلقة أدناه تُشغّل استعلاماً منفصلاً لكل مادة
        // (field) — مع 8 مواد مثلاً، هذا يعني 8 استعلامات في حلقة بدل واحد.
        // الاستعلام الوحيد أدناه يحسب عدد الطلاب الفريدين لكل مادة دفعة واحدة
        // عبر GROUP BY، ثم نطابق النتائج بالذاكرة بدل ضرب القاعدة مجدداً.
        $totalStudents = User::where('is_admin', false)->count();
        $fields = Field::withCount('lessons')->get();

        $reachByField = DB::table('user_progress')
            ->join('lessons', 'user_progress.lesson_id', '=', 'lessons.id')
            ->join('sections', 'lessons.section_id', '=', 'sections.id')
            ->select('sections.field_id', DB::raw('COUNT(DISTINCT user_progress.user_id) as students_reached'))
            ->groupBy('sections.field_id')
            ->get()
            ->keyBy('field_id');

        $funnel = $fields->map(function ($field) use ($reachByField, $totalStudents) {
                $studentsReached = $reachByField->get($field->id)->students_reached ?? 0;

                return [
                'field' => $field->name,
                'students_reached' => $studentsReached,
                'reach_percent' => $totalStudents > 0 ? round(($studentsReached / $totalStudents) * 100, 1) : 0
                ];
            });

        return response()->json([
            'difficult_lessons' => $difficultLessons,
            'engagement' => $engagement,
            'funnel' => $funnel,
        ]);
    }

    public function studentActivity(Request $request)
    {
        $days = $request->query('days', 7);

        $activity = DB::table('user_progress')
            ->select(DB::raw('DATE(updated_at) as date'), 'status', DB::raw('count(*) as count'))
            ->where('updated_at', '>=', now()->subDays($days))
            ->groupBy('date', 'status')
            ->get();

        return response()->json($activity);
    }
}
