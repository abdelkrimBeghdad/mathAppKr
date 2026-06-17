<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityIncident;
use App\Models\User;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    public function index()
    {
        return SecurityIncident::with('user:id,name,email,is_suspended')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
    }

    public function show(SecurityIncident $incident)
    {
        return $incident->load('user');
    }

    public function suspendUser(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $user->update([
            'is_suspended' => true,
            'suspension_reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'User has been suspended.',
            'user' => $user
        ]);
    }

    public function unsuspendUser(User $user)
    {
        $user->update([
            'is_suspended' => false,
            'suspension_reason' => null,
        ]);

        return response()->json([
            'message' => 'User suspension has been lifted.',
            'user' => $user
        ]);
    }

    public function statistics()
    {
        return response()->json([
            'total_incidents' => SecurityIncident::count(),
            'critical_incidents' => SecurityIncident::where('severity', 'critical')->count(),
            'high_incidents' => SecurityIncident::where('severity', 'high')->count(),
            'suspended_users' => User::where('is_suspended', true)->count(),
            'recent_incidents' => SecurityIncident::where('created_at', '>=', now()->subDays(7))->count(),
        ]);
    }
}
