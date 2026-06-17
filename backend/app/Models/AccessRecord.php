<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessRecord extends Model
{
    protected $guarded = [];

    public function accessible()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function grantedBy()
    {
        return $this->belongsTo(User::class , 'granted_by');
    }
}
