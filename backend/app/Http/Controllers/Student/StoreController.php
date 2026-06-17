<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\StoreItem;
use App\Models\UserInventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $items = StoreItem::all();
        $ownedItems = UserInventory::where('user_id', $user->id)
            ->pluck('store_item_id')
            ->toArray();

        return response()->json([
            'items' => $items,
            'owned_item_ids' => $ownedItems,
            'equipped_item_ids' => UserInventory::where('user_id', $user->id)
            ->where('is_equipped', true)
            ->pluck('store_item_id')
            ->toArray(),
            'coins' => $user->coins,
        ]);
    }

    public function purchase(Request $request, StoreItem $item)
    {
        $user = $request->user();

        // Check if already owned
        if (UserInventory::where('user_id', $user->id)->where('store_item_id', $item->id)->exists()) {
            return response()->json(['message' => 'أنت تملك هذا العنصر بالفعل'], 422);
        }

        // Check if enough coins
        if ($user->coins < $item->price) {
            return response()->json(['message' => 'ليس لديك ما يكفي من القطع الذهبية'], 422);
        }

        DB::transaction(function () use ($user, $item) {
            $user->decrement('coins', $item->price);
            UserInventory::create([
                'user_id' => $user->id,
                'store_item_id' => $item->id,
                'is_equipped' => false,
            ]);
        });

        return response()->json([
            'message' => 'تم الشراء بنجاح!',
            'coins' => $user->fresh()->coins,
        ]);
    }

    public function equip(Request $request, StoreItem $item)
    {
        $user = $request->user();

        $inventory = UserInventory::where('user_id', $user->id)
            ->where('store_item_id', $item->id)
            ->first();

        if (!$inventory) {
            return response()->json(['message' => 'يجب شراء العنصر أولاً'], 422);
        }

        // Unequip others of the same type
        UserInventory::where('user_id', $user->id)
            ->whereHas('item', function ($query) use ($item) {
            $query->where('type', $item->type);
        })
            ->update(['is_equipped' => false]);

        $inventory->update(['is_equipped' => true]);

        return response()->json(['message' => 'تم التجهيز بنجاح']);
    }
}
