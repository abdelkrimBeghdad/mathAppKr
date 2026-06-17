<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LearningController extends Controller
{
    // Get all fields with sections and lessons (structure)
    // Also include user progress status for each lesson
    public function index()
    {
        $user = Auth::user();

        $fields = Field::with(['sections.lessons' => function ($query) {
            $query->orderBy('order');
        }])->orderBy('order')->get();

        // Attach progress
        $progress = UserProgress::where('user_id', $user->id)->get()->keyBy('lesson_id');

        // Transform data to include status (locked/unlocked/completed)
        // This logic could be refined to be more performant or done via API Resource
        $fields->each(function ($field) use ($progress) {
            $field->sections->each(function ($section) use ($progress) {
                    $section->lessons->each(function ($lesson) use ($progress) {
                            $p = $progress->get($lesson->id);
                            $lesson->status = $p ? $p->status : ($lesson->is_locked ? 'locked' : 'unlocked');
                            $lesson->score = $p ? $p->score : 0;
                        }
                        );
                    }
                    );
                });

        return $fields;
    }

    public function showLesson(Lesson $lesson)
    {
        // Check if user has access (e.g. previous lesson completed) - simplified for now
        return $lesson->load('questions');
    }

    public function updateProgress(Request $request, Lesson $lesson)
    {
        $request->validate([
            'status' => 'required|in:unlocked,completed',
            'score' => 'integer'
        ]);

        $user = Auth::user();
        $isFirstCompletion = false;

        if ($request->status === 'completed') {
            $existingProgress = UserProgress::where(['user_id' => $user->id, 'lesson_id' => $lesson->id])->first();
            if (!$existingProgress || $existingProgress->status !== 'completed') {
                $isFirstCompletion = true;
            }
        }

        $progress = UserProgress::updateOrCreate(
        ['user_id' => $user->id, 'lesson_id' => $lesson->id],
        [
            'status' => $request->status,
            'score' => $request->score ?? 0
        ]
        );

        if ($isFirstCompletion) {
            $gamification = new \App\Services\GamificationService();
            $gamification->awardXp($user, 100, "Completed lesson: {$lesson->name}");
        }

        return [
            'progress' => $progress,
            'user_stats' => [
                'points' => $user->points,
                'level' => $user->level,
                'xp' => $user->xp,
                'xp_next_level' => $user->level * 1000,
            ]
        ];
    }

    public function getMasteryStats()
    {
        $user = Auth::user();
        $fields = Field::with('sections.lessons')->get();

        $stats = $fields->map(function ($field) use ($user) {
            $lessonIds = $field->sections->flatMap->lessons->pluck('id');
            $totalLessons = $lessonIds->count();

            if ($totalLessons === 0)
                return [
                'subject' => $field->name,
                'A' => 0,
                'fullMark' => 100,
                ];

            $results = UserProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $lessonIds)
                ->where('status', 'completed')
                ->get();

            $totalScore = $results->sum('score');
            // Mastery is average score across all lessons in the field (uncompleted = 0)
            $mastery = ($totalScore / ($totalLessons * 100)) * 100;

            return [
            'subject' => $field->name,
            'A' => round($mastery),
            'fullMark' => 100,
            ];
        });

        return $stats;
    }
}
