<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreItem extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'price',
        'image_url',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_inventory')->withPivot('is_equipped')->withTimestamps();
    }
}
