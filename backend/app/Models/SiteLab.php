<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteLab extends Model
{
    protected $guarded = [];

    /**
     * Polymorphic relation to AccessRecord — same as Lesson/Section/Field.
     * Allows the existing unlock-with-coins / receipt system to work for labs.
     */
    public function accessRecords()
    {
        return $this->morphMany(AccessRecord::class, 'accessible');
    }
}
