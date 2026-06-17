<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminAuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful (or at least attempted) write operations by authenticated admins
        if ($request->user() && $request->user()->is_admin && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {

            // Avoid logging actual login/logout actions if they happen in admin routes
            if (str_contains($request->path(), 'login') || str_contains($request->path(), 'logout')) {
                return $response;
            }

            \App\Models\AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => $request->method() . ' ' . $request->path(),
                'resource_type' => $this->getResourceType($request),
                'resource_id' => $this->getResourceId($request),
                'changes' => $request->except(['password', 'password_confirmation', '_token']),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return $response;
    }

    protected function getResourceType(Request $request)
    {
        $segments = $request->segments();
        return isset($segments[1]) ? ucfirst($segments[1]) : null;
    }

    protected function getResourceId(Request $request)
    {
        $segments = $request->segments();
        return end($segments);
    }
}
