<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LearningPathController extends Controller
{
    public function getRecommendations(Request $request)
    {
        $user = $request->user();
        Log::info("Generating recommendations for Student ID: " . ($user->id ?? 'Unknown'));
        $recommendations = [];

        // 1. Fetch all fields with their lessons
        $fields = \App\Models\Field::with(['sections.lessons' => function($q) {
            $q->orderBy('order');
        }])->get();

        // 2. Fetch User Progress
        $progress = UserProgress::where('user_id', $user->id)->get()->keyBy('lesson_id');

        // 3. Analyze Mastery per Field
        $fieldMastery = $fields->map(function ($field) use ($progress) {
            $lessonIds = $field->sections->flatMap->lessons->pluck('id');
            $totalLessons = $lessonIds->count();
            
            if ($totalLessons === 0) return ['field' => $field, 'score' => 0, 'completed_count' => 0, 'attempt_count' => 0];

            $fieldResults = $lessonIds->map(fn($id) => $progress->get($id))->filter();
            $totalScore = $fieldResults->sum('score');
            $mastery = ($totalScore / ($totalLessons * 100)) * 100;

            return [
                'field' => $field,
                'score' => $mastery,
                'completed_count' => $fieldResults->where('status', 'completed')->count(),
                'attempt_count' => $fieldResults->count(),
                'total_count' => $totalLessons
            ];
        });

        // 4. GENERATE ADAPTIVE RECOMMENDATIONS
        $recommendations = [];

        // A. REMEDIAL (For low mastery - prioritizing struggling areas)
        $remedialLessons = $fields->flatMap(function($f) {
            return $f->sections->flatMap(fn($s) => $s->lessons);
        })
        ->map(fn($l) => ['lesson' => $l, 'p' => $progress->get($l->id)])
        ->filter(fn($item) => $item['p'] && ($item['p']->score < 60 || $item['p']->status === 'in_progress'))
        ->sortBy(fn($item) => $item['p']->score)
        ->take(3);

        foreach ($remedialLessons as $item) {
            $recommendations[] = [
                'type' => 'remedial',
                'badge' => '🚩 تعزيز الكفاءة',
                'color' => 'rose',
                'lesson' => $item['lesson']->load('section.field'),
                'reason' => "لاحظنا تعثراً في '{$item['lesson']->name}' ({$item['p']->score}%). مراجعته الآن ستبني أساساً قوياً!"
            ];
        }

        // B. NEXT STEP / EXPLORE (Fill up to 4)
        if (count($recommendations) < 4) {
             // Try to find the next lesson in an active field
             $activeFields = $fieldMastery->where('score', '>=', 60)->where('completed_count', '<', 'total_count')->sortByDesc('score');
             foreach ($activeFields as $m) {
                 if (count($recommendations) >= 4) break;
                 
                 $nextLesson = $m['field']->sections->flatMap(fn($s) => $s->lessons)
                     ->filter(fn($l) => !$progress->get($l->id) || $progress->get($l->id)->status !== 'completed')
                     ->sortBy('order')
                     ->first();

                 if ($nextLesson) {
                     $recommendations[] = [
                         'type' => 'next',
                         'badge' => '🚀 القفزة التالية',
                         'color' => 'indigo',
                         'lesson' => $nextLesson->load('section.field'),
                         'reason' => "أنت رائع في {$m['field']->name}! درس '{$nextLesson->name}' هو خطوتك التالية."
                     ];
                 }
             }
        }

        // Final filler if still under 4
        if (count($recommendations) < 4) {
            $untouched = $fieldMastery->where('attempt_count', 0)->sortBy('field.order');
            foreach ($untouched as $m) {
                if (count($recommendations) >= 4) break;
                
                $firstLesson = $m['field']->sections->first()?->lessons->first();
                if ($firstLesson) {
                    $recommendations[] = [
                        'type' => 'explore',
                        'badge' => '🌟 آفاق جديدة',
                        'color' => 'amber',
                        'lesson' => $firstLesson->load('section.field'),
                        'reason' => "استكشف '{$m['field']->name}' بدرس '{$firstLesson->name}'."
                    ];
                }
            }
        }

        Log::info("Found " . count($recommendations) . " recommendations for User {$user->id}");
        return response()->json(array_values($recommendations));
    }
}
