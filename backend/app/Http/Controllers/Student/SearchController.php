<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\ForumQuestion;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('q');

        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        // Search Lessons
        $lessons = Lesson::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->select('id', 'name', 'description', 'updated_at')
            ->limit(5)
            ->get()
            ->map(function ($lesson) {
                $lesson->type = 'lesson';
                $lesson->url = "/student/lessons/{$lesson->id}";
                return $lesson;
            });

        // Search Forum
        $questions = ForumQuestion::where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->select('id', 'title', 'created_at')
            ->limit(5)
            ->get()
            ->map(function ($q) {
                $q->type = 'discussion';
                $q->name = $q->title; // Normalize for frontend
                $q->description = "نقاش في المنتدى";
                $q->url = "/student/forum/{$q->id}";
                return $q;
            });

        return response()->json([
            'results' => $lessons->concat($questions)
        ]);
    }
}
