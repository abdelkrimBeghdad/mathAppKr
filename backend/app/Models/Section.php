<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $guarded = [];

    public function field()
    {
        return $this->belongsTo(Field::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function accessRecords()
    {
        return $this->morphMany(AccessRecord::class , 'accessible');
    }
}
