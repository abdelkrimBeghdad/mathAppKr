<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Field;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    // === Fields ===
    public function indexFields()
    {
        return Field::with('sections.lessons')->orderBy('order')->get();
    }

    public function storeField(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'integer|min:0'
        ]);
        return Field::create($validated);
    }

    public function updateField(Request $request, Field $field)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'integer|min:0'
        ]);
        $field->update($validated);
        return $field;
    }

    public function destroyField(Field $field)
    {
        $field->delete();
        return response()->noContent();
    }

    // === Sections ===
    public function storeSection(Request $request)
    {
        $validated = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'integer|min:0'
        ]);
        return Section::create($validated);
    }

    public function updateSection(Request $request, Section $section)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'order' => 'integer|min:0'
        ]);
        $section->update($validated);
        return $section;
    }

    public function destroySection(Section $section)
    {
        $section->delete();
        return response()->noContent();
    }

    // === Lessons ===
    public function storeLesson(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'name' => 'required|string|max:255',
            'summary' => 'nullable|string|max:2000',
            'example_problem' => 'nullable|string|max:5000',
            'example_steps' => 'nullable|array',
            'application_problem' => 'nullable|string|max:5000',
            'application_solution' => 'nullable|string|max:2000',
            'order' => 'integer|min:0',
            'is_locked' => 'boolean',
            'lab_type' => 'nullable|string|max:100',
            'lab_config' => 'nullable|array'
        ]);
        return Lesson::create($validated);
    }

    public function updateLesson(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'summary' => 'nullable|string|max:2000',
            'example_problem' => 'nullable|string|max:5000',
            'example_steps' => 'nullable|array',
            'application_problem' => 'nullable|string|max:5000',
            'application_solution' => 'nullable|string|max:2000',
            'order' => 'integer|min:0',
            'is_locked' => 'boolean',
            'lab_type' => 'nullable|string|max:100',
            'lab_config' => 'nullable|array'
        ]);
        $lesson->update($validated);
        return $lesson;
    }

    public function destroyLesson(Lesson $lesson)
    {
        $lesson->delete();
        return response()->noContent();
    }

    public function getLesson(Lesson $lesson)
    {
        return $lesson;
    }
}
