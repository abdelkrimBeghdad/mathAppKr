<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SiteFeature;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;

class StrictAccess
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $featureName = null): Response
    {
        $user = $request->user();

        // 1. Core Bypass: Admin or Teacher
        if ($user && ($user->is_admin || $user->is_teacher)) {
            return $next($request);
        }

        // 2. Global Feature Gate Check (e.g., 'challenges', 'store', 'arena')
        if ($featureName) {
            $feature = SiteFeature::where('name', $featureName)->first();
            if ($feature && $feature->access_type === 'premium') {
                if (!$user || !$this->checkAccessRecord($user, $feature)) {
                    return response()->json([
                        'error' => 'FEATURE_LOCKED',
                        'message' => 'هذه الميزة مدفوعة. يرجى الاشتراك للوصول إليها.',
                        'feature' => $featureName,
                        'price' => $feature->price,
                        'locked' => true
                    ], 403);
                }
            }
        }

        // 3. Resource-Level Check (Lessons, Sections, Fields)
        $route = $request->route();
        $params = $route->parameters();

        foreach (['lesson' => Lesson::class , 'section' => Section::class , 'field' => Field::class] as $key => $className) {
            if (isset($params[$key])) {
                $resource = $params[$key];

                // Route model binding handle
                if (is_numeric($resource)) {
                    $resource = $className::find($resource);
                }

                if ($resource && $resource->access_type === 'premium') {
                    if (!$user || !$this->hasHierarchicalAccess($user, $resource)) {
                        return response()->json([
                            'error' => 'CONTENT_LOCKED',
                            'message' => 'هذا المحتوى يتطلب وصولاً متميزاً.',
                            'resource_type' => $key,
                            'price' => $resource->price,
                            'locked' => true
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }

    /**
     * Check if a user has access to a resource or any of its parents.
     */
    protected function hasHierarchicalAccess($user, $resource): bool
    {
        // Direct Access
        if ($this->checkAccessRecord($user, $resource)) {
            return true;
        }

        // Lesson -> Section
        if ($resource instanceof Lesson && $resource->section) {
            return $this->hasHierarchicalAccess($user, $resource->section);
        }

        // Section -> Field
        if ($resource instanceof Section && $resource->field) {
            return $this->hasHierarchicalAccess($user, $resource->field);
        }

        return false;
    }

    /**
     * Check for an active access_record.
     */
    protected function checkAccessRecord($user, $resource): bool
    {
        return $user->accessRecords()
            ->where('accessible_type', get_class($resource))
            ->where('accessible_id', $resource->id)
            ->where('status', 'active')
            ->exists();
    }
}
