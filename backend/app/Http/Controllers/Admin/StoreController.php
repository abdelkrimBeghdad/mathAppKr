<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreItem;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index()
    {
        return StoreItem::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:avatar,banner,other',
            'price' => 'required|integer|min:0|max:1000000',
            'image_url' => 'required|active_url|max:2048',
            'description' => 'nullable|string|max:1000'
        ]);

        $item = StoreItem::create($validated);

        return response()->json([
            'message' => 'Store item created successfully',
            'item' => $item
        ], 201);
    }

    public function update(Request $request, StoreItem $item)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:avatar,banner,other',
            'price' => 'integer|min:0|max:1000000',
            'image_url' => 'active_url|max:2048',
            'description' => 'nullable|string|max:1000'
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Store item updated successfully',
            'item' => $item
        ]);
    }

    public function destroy(StoreItem $item)
    {
        $item->delete();
        return response()->json(['message' => 'Store item deleted successfully']);
    }

    public function statistics()
    {
        return response()->json([
            'total_items' => StoreItem::count(),
            'avatar_count' => StoreItem::where('type', 'avatar')->count(),
            'banner_count' => StoreItem::where('type', 'banner')->count(),
            'revenue_potential' => StoreItem::sum('price') // Just an example stat
        ]);
    }
}
