<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'icon',
        'action_url',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function send($userId, $type, $title, $message, $icon = null, $actionUrl = null)
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $icon,
            'action_url' => $actionUrl,
        ]);
    }

    public static function sendToAll($type, $title, $message, $icon = null, $actionUrl = null)
    {
        $users = User::where('is_admin', false)->get();
        foreach ($users as $user) {
            self::send($user->id, $type, $title, $message, $icon, $actionUrl);
        }
    }
}
