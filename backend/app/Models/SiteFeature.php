<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteFeature extends Model
{
    protected $guarded = [];

    public function accessRecords()
    {
        return $this->morphMany(AccessRecord::class , 'accessible');
    }
}
