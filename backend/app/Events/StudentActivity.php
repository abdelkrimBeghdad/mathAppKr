<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudentActivity implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $lessonId;
    public $type;
    public $payload;

    /**
     * Create a new event instance.
     */
    public function __construct($user, $lessonId, $type, $payload = [])
    {
        $this->user = $user;
        $this->lessonId = $lessonId;
        $this->type = $type; // e.g., 'correct_answer', 'mistake', 'requested_hint', 'joined'
        $this->payload = $payload; // extra details like the actual answer tried
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('lesson.' . $this->lessonId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'student.activity';
    }
}
