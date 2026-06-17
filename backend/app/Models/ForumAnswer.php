<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumAnswer extends Model
{
    protected $fillable = ['user_id', 'forum_question_id', 'content', 'is_accepted'];

    protected $casts = [
        'is_accepted' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function question()
    {
        return $this->belongsTo(ForumQuestion::class , 'forum_question_id');
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
