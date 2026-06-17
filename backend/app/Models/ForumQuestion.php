<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumQuestion extends Model
{
    protected $fillable = ['user_id', 'title', 'content', 'is_solved', 'is_pinned', 'is_locked', 'views_count'];

    protected $casts = [
        'is_solved' => 'boolean',
        'is_pinned' => 'boolean',
        'is_locked' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(ForumAnswer::class);
    }

    public function votes()
    {
        return $this->morphMany(Vote::class , 'votable');
    }

    public function getScoreAttribute()
    {
        return $this->votes()->sum('value');
    }
}
