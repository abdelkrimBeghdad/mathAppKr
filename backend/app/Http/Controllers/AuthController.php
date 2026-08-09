<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Session-cookie authentication (Sanctum SPA mode).
 *
 * This used to issue a Sanctum personal-access-token ($user->createToken(...))
 * that the frontend stored in localStorage and attached to every request as
 * an Authorization: Bearer header. That token was readable by any JavaScript
 * running on the page, so a single XSS bug anywhere in the app (a 3rd-party
 * script, a dependency, an unsanitized render) could exfiltrate it and let
 * an attacker act as the user indefinitely.
 *
 * Auth::login() below establishes a Laravel session instead. The session ID
 * is stored in an httpOnly, SameSite cookie the browser manages automatically
 * — client-side JavaScript cannot read or exfiltrate it. Sanctum's stateful
 * middleware (registered in bootstrap/app.php) uses that cookie to
 * authenticate API requests from the configured frontend domain, backed by
 * Laravel's CSRF protection (the frontend must first GET /sanctum/csrf-cookie
 * and axios attaches the resulting XSRF-TOKEN automatically).
 */
class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                \Illuminate\Validation\Rules\Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols(),
                'confirmed'
            ],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        Auth::login($user);
        // Rotates the session ID after privilege escalation (login) to
        // prevent session fixation attacks.
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
