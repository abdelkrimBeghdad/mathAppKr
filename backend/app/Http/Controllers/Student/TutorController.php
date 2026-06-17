<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TutorController extends Controller
{
    /**
     * Provide a contextual hint for a specific question.
     */
    public function getHint(Request $request)
    {
        $request->validate([
            'question_id' => 'required',
            'lesson_id' => 'required|exists:lessons,id'
        ]);

        $user = Auth::user();
        if (!$user instanceof \App\Models\User)
            return response()->json(['error' => 'Unauthorized'], 401);

        // Deduct coins (e.g., 5 coins)
        if ($user->coins < 5) {
            return response()->json(['message' => 'ليس لديك رصيد كافٍ من العملات للحصول على تلميح (تحتاج 5 عملات)'], 422);
        }

        $user->decrement('coins', 5);

        // Find the question and generate a hint
        // In a production app, this could call an LLM.
        // For now, we use a template-based logic.
        $question = Question::find($request->question_id);

        if (!$question) {
            // Probably a procedural question (Arcade)
            return response()->json([
                'hint' => "حاول التركيز على العملية الحسابية المطلوبة. يمكنك تجربة تبسيط الأرقام ذهنياً أولاً!",
                'coins_left' => $user->coins
            ]);
        }

        $hint = $this->generateLogicalHint($question);

        return response()->json([
            'hint' => $hint,
            'coins_left' => $user->coins
        ]);
    }

    /**
     * Generate a clever math hint based on question type/text.
     */
    private function generateLogicalHint($question)
    {
        $text = $question->question_text;

        if (str_contains($text, '+') || str_contains($text, '-')) {
            return "تذكر أن تجمع أو تطرح الآحاد أولاً ثم العشرات. دقة البداية تضمن صحة النهاية!";
        }

        if (str_contains($text, '*') || str_contains($text, 'ضرب')) {
            return "هل جربت استخدام الضرب بالتوزيع؟ مثلاً 12 * 5 هي (10 * 5) + (2 * 5).";
        }

        if (str_contains($text, '/') || str_contains($text, 'قسمة')) {
            return "القسمة هي عكس الضرب. فكر: ما هو الرقم الذي إذا ضربته في المقسوم عليه يعطيك المقسوم؟";
        }

        if (str_contains($text, 'x') || str_contains($text, 'معادلة')) {
            return "الهدف هو عزل المجهول 'x' في جهة واحدة. ابدأ بنقل الأرقام الثابتة إلى الجهة الأخرى بتغيير إشارتها.";
        }

        return "فكر في القواعد الأساسية التي تعلمناها في هذا الدرس. الحل غالباً ما يكون أبسط مما يبدو!";
    }

    /**
     * Provide a detailed explanation for a lesson section.
     */
    public function explainStep(Request $request, Lesson $lesson)
    {
        return response()->json([
            'explanation' => "في هذا الجزء من درس '{$lesson->name}'، نركز على الربط بين المفاهيم النظرية والتطبيق العملي. حاول دائماً رسم المسألة إذا أمكن!"
        ]);
    }
}
