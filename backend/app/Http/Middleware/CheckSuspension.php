<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSuspension
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_suspended) {
            return response()->json([
                'error' => 'Account suspended',
                'message' => $request->user()->suspension_reason ?? 'لقد تم تعليق حسابك بسبب مخالفة القوانين.',
            ], 403);
        }

        return $next($request);
    }
}
