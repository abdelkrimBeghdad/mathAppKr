<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalGoal extends Model
{
    protected $fillable = ['user_id', 'title', 'type', 'target', 'progress', 'is_completed'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
