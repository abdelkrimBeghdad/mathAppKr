<?php

namespace App\Http\Controllers;

use App\Models\SiteFeature;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
    /**
     * Toggle "Premium" status for a site feature/module.
     */
    public function updateFeatureStatus(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string',
            'access_type' => 'required|in:classic,premium',
            'price' => 'required|integer|min:0',
        ]);

        $feature = SiteFeature::updateOrCreate(
        ['name' => $request->name],
        [
            'display_name_ar' => $request->display_name_ar ?? $request->name,
            'access_type' => $request->access_type,
            'price' => $request->price
        ]
        );

        return response()->json($feature);
    }

    /**
     * Batch update content pricing status.
     */
    public function updateContentPricing(Request $request)
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:lesson,section,field',
            'ids' => 'required|array',
            'access_type' => 'required|in:classic,premium',
            'price' => 'required|integer|min:0',
        ]);

        $modelClass = match ($request->type) {
                'lesson' => Lesson::class ,
                'section' => Section::class ,
                'field' => Field::class ,
            };

        $modelClass::whereIn('id', $request->ids)->update([
            'access_type' => $request->access_type,
            'price' => $request->price
        ]);

        return response()->json(['message' => 'تم تحديث الأسعار بنجاح.']);
    }

    /**
     * Get all feature gate statuses for the frontend.
     */
    public function getFeatureStats(Request $request)
    {
        $features = SiteFeature::all();
        $user = $request->user();

        $stats = $features->map(function ($feature) use ($user) {
            $isUnlocked = $feature->access_type === 'classic' ||
                ($user && ($user->is_admin || $user->is_teacher)) ||
                ($user && $user->accessRecords()
                ->where('accessible_type', SiteFeature::class)
                ->where('accessible_id', $feature->id)
                ->where('status', 'active')
                ->exists());

            return [
            'name' => $feature->name,
            'display_name' => $feature->display_name_ar,
            'access_type' => $feature->access_type,
            'price' => $feature->price,
            'is_unlocked' => $isUnlocked
            ];
        });

        return response()->json($stats);
    }
}
