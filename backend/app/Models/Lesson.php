<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'example_steps' => 'array',
        'is_locked' => 'boolean',
        'lab_config' => 'array'
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function quizResults()
    {
        return $this->hasMany(QuizResult::class);
    }

    public function accessRecords()
    {
        return $this->morphMany(AccessRecord::class , 'accessible');
    }
}
