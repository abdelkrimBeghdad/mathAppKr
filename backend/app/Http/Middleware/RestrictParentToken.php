<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Enforces the restriction that ParentController::login's token was always
 * *supposed* to have: a token created with only the 'parent:view' ability
 * (see ParentController::login) should be able to reach exactly one route,
 * GET /parent/dashboard.
 *
 * Until now nothing actually checked that ability anywhere, so a parent
 * token — issued from just a phone number + the student's email, with no
 * password — could be used to call any other endpoint in the big
 * `auth:sanctum` route group as if it were the student's own session
 * (claiming lab rewards, posting to the forum, joining tournaments, etc.),
 * not just viewing the read-only dashboard it was meant for.
 *
 * Sits on the same route group as `auth:sanctum`; normal student
 * session-cookie auth is unaffected (session guards don't have a Sanctum
 * PAT with restricted abilities, so this middleware is a no-op for them).
 */
class RestrictParentToken
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();

        // No Sanctum personal-access-token on this request (e.g. the normal
        // student session-cookie auth) — nothing to restrict, continue.
        if (!$token || !isset($token->abilities)) {
            return $next($request);
        }

        $abilities = $token->abilities;
        $isParentScopedToken = in_array('parent:view', $abilities, true) && !in_array('*', $abilities, true);

        if ($isParentScopedToken && !$request->routeIs('parent.dashboard')) {
            return response()->json([
                'message' => 'This token is restricted to the parent dashboard only.',
            ], 403);
        }

        return $next($request);
    }
}
