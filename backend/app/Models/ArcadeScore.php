<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArcadeScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'score',
        'max_streak',
        'played_at',
    ];

    protected $casts = [
        'played_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
