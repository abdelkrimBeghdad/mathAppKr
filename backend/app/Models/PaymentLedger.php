<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentLedger extends Model
{
    use HasFactory;

    protected $table = 'payment_ledgers';

    protected $fillable = [
        'user_id',
        'access_record_id',
        'amount_dzd',
        'coins_amount',
        'payment_method',
        'transaction_type',
        'description',
        'approved_by',
    ];

    protected $casts = [
        'amount_dzd' => 'float',
        'coins_amount' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function accessRecord()
    {
        return $this->belongsTo(AccessRecord::class, 'access_record_id');
    }
}
