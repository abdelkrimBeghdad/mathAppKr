<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int)$user->id === (int)$id;
});

Broadcast::channel('battles.{id}', function ($user, $id) {
    $battle = \App\Models\QuizBattle::find($id);
    if (!$battle)
        return false;
    return (int)$user->id === (int)$battle->challenger_id || (int)$user->id === (int)$battle->opponent_id;
});

Broadcast::channel('lesson.{lessonId}', function ($user, $lessonId) {
    // Allow both admins and students to join the lesson room
    // Return an array to make it a Presence Channel
    return [
    'id' => $user->id,
    'name' => $user->name,
    'is_admin' => $user->is_admin,
    ];
});
