<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Events\StudentActivity;

class ActivityController extends Controller
{
    public function log(Request $request, $lessonId)
    {
        $request->validate([
            'type' => 'required|string',
            'payload' => 'nullable|array'
        ]);

        $user = $request->user();

        // Broadcast the event
        broadcast(new StudentActivity(
        [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar
        ],
            $lessonId,
            $request->type,
            $request->payload ?? []
            ));

        return response()->json(['status' => 'Activity logged and broadcasted']);
    }
}
