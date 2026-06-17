<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInventory extends Model
{
    protected $table = 'user_inventory';

    protected $fillable = [
        'user_id',
        'store_item_id',
        'is_equipped',
    ];

    protected $casts = [
        'is_equipped' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(StoreItem::class , 'store_item_id');
    }
}
