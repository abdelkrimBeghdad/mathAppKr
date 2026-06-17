<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Lesson;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::where('is_admin', false)->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'parent_phone' => 'nullable|string|max:20',
            'school' => 'nullable|string|max:255',
            'wilaya' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'grade_level' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'parent_phone' => $validated['parent_phone'] ?? null,
            'school' => $validated['school'] ?? null,
            'wilaya' => $validated['wilaya'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'grade_level' => $validated['grade_level'] ?? null,
            'is_admin' => false,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'parent_phone' => 'nullable|string|max:20',
            'school' => 'nullable|string|max:255',
            'wilaya' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'grade_level' => 'nullable|string|max:100',
        ]);

        $user->fill($validated);

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        if ($user->is_admin) {
            return response()->json(['message' => 'Cannot delete admin users'], 403);
        }

        $user->delete();
        return response()->noContent();
    }

    public function showProgress(User $user)
    {
        $progress = $user->progress()->with('lesson')->get();
        return response()->json($progress);
    }

    public function updateLessonStatus(Request $request, User $user, Lesson $lesson)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:locked,unlocked,completed',
        ]);

        $progress = UserProgress::updateOrCreate(
        ['user_id' => $user->id, 'lesson_id' => $lesson->id],
        ['status' => $validated['status']]
        );

        return response()->json($progress);
    }
}
