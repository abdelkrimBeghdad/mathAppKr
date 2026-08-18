<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteLab;
use App\Models\LabProgress;
use Illuminate\Http\Request;

class AdminLabController extends Controller
{
    /**
     * List all labs with their current access_type, price, and usage stats.
     */
    public function index()
    {
        $user = auth('sanctum')->user();

        $labs = SiteLab::all()->map(function ($lab) use ($user) {
            // Attach usage stats: how many students attempted / completed this lab
            $attempts  = LabProgress::where('lab_id', $lab->lab_key)->count();
            $completed = LabProgress::where('lab_id', $lab->lab_key)
                ->where('phase', 'completed')->count();

            $isUnlocked = $lab->access_type === 'classic' || ($user && ($user->is_admin || $user->accessRecords()->where('accessible_type', SiteLab::class)->where('accessible_id', $lab->id)->where('status', 'active')->exists()));

            return [
                'id'          => $lab->id,
                'lab_key'     => $lab->lab_key,
                'title_ar'    => $lab->title_ar,
                'category'    => $lab->category,
                'difficulty'  => $lab->difficulty,
                'access_type' => $lab->access_type,
                'price'       => $lab->price,
                'is_unlocked' => $isUnlocked,
                'attempts'    => $attempts,
                'completed'   => $completed,
            ];
        });

        return response()->json($labs);
    }

    /**
     * Update access_type and price for one lab.
     */
    public function update(Request $request, SiteLab $lab)
    {
        $validated = $request->validate([
            'access_type' => 'required|in:classic,premium',
            'price'       => 'required|integer|min:0|max:99999',
        ]);

        // Auto-reset price to 0 when switching back to free
        if ($validated['access_type'] === 'classic') {
            $validated['price'] = 0;
        }

        $lab->update($validated);

        return response()->json([
            'message' => 'تم تحديث إعدادات المختبر بنجاح.',
            'lab'     => $lab->fresh(),
        ]);
    }

    /**
     * Bulk update multiple labs at once.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'updates'               => 'required|array',
            'updates.*.id'          => 'required|exists:site_labs,id',
            'updates.*.access_type' => 'required|in:classic,premium',
            'updates.*.price'       => 'required|integer|min:0',
        ]);

        foreach ($request->updates as $item) {
            SiteLab::where('id', $item['id'])->update([
                'access_type' => $item['access_type'],
                'price'       => $item['access_type'] === 'classic' ? 0 : $item['price'],
            ]);
        }

        return response()->json(['message' => 'تم تحديث ' . count($request->updates) . ' مختبر بنجاح.']);
    }
}
