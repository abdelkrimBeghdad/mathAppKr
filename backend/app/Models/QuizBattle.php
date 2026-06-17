<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizBattle extends Model
{
    protected $fillable = [
        'challenger_id', 'opponent_id', 'lesson_id',
        'challenger_score', 'opponent_score', 'status'
    ];

    public function challenger()
    {
        return $this->belongsTo(User::class , 'challenger_id');
    }

    public function opponent()
    {
        return $this->belongsTo(User::class , 'opponent_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
