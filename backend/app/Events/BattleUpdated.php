<?php

namespace App\Events;

use App\Models\QuizBattle;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BattleUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $battle;

    /**
     * Create a new event instance.
     */
    public function __construct(QuizBattle $battle)
    {
        $this->battle = $battle;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('battles.' . $this->battle->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['battle' => $this->battle->load(['challenger', 'opponent', 'lesson'])->toArray()];
    }
}
