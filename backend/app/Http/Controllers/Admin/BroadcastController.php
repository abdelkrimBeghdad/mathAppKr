<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class BroadcastController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|string|in:info,warning,success,reward',
            'icon' => 'nullable|string|max:100',
            'action_url' => 'nullable|url|max:2048'
        ]);

        Notification::sendToAll(
            $validated['type'],
            $validated['title'],
            $validated['message'],
            $validated['icon'] ?? 'Bell',
            $validated['action_url'] ?? null
        );

        return response()->json([
            'message' => 'تم إرسال الإعلان لجميع الطلاب بنجاح (عدد الطلاب: ' . User::where('is_admin', false)->count() . ')'
        ]);
    }

    public function stats()
    {
        return response()->json([
            'total_students' => User::where('is_admin', false)->count(),
            'total_notifications_sent' => Notification::count(), // Just a rough stat
        ]);
    }
}
