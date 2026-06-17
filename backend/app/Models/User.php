<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'parent_phone',
        'school',
        'wilaya',
        'birth_date',
        'grade_level',
        'suspension_reason',
        'coins',
        'points',
        'level',
        'xp',
        'last_daily_reward_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_daily_reward_at' => 'datetime',
            'is_suspended' => 'boolean',
            'is_admin' => 'boolean',
            'is_teacher' => 'boolean',
        ];
    }

    public function progress()
    {
        return $this->hasMany(UserProgress::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class , 'user_badges')->withTimestamps();
    }

    public function inventory()
    {
        return $this->hasMany(UserInventory::class);
    }

    public function equippedItems()
    {
        return $this->hasMany(UserInventory::class)->where('is_equipped', true);
    }

    public function forumQuestions()
    {
        return $this->hasMany(ForumQuestion::class);
    }

    public function securityIncidents()
    {
        return $this->hasMany(SecurityIncident::class);
    }

    public function accessRecords()
    {
        return $this->hasMany(AccessRecord::class);
    }
}
