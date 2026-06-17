<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabProgress extends Model
{
    use HasFactory;

    protected $table = 'lab_progress';

    protected $fillable = [
        'user_id',
        'lab_id',
        'phase',
        'best_score',
        'attempts',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'best_score' => 'integer',
        'attempts' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
