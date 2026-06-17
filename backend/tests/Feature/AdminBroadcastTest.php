<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Notification;

class AdminBroadcastTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $students;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->students = User::factory()->count(3)->create(['is_admin' => false]);
    }

    public function test_admin_can_send_global_broadcast()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/broadcast/send', [
            'title' => 'Big Announcement',
            'message' => 'Something cool is happening!',
            'type' => 'info',
            'icon' => 'Bell'
        ]);

        $response->assertStatus(200);

        // Check if each student received the notification
        foreach ($this->students as $student) {
            $this->assertDatabaseHas('notifications', [
                'user_id' => $student->id,
                'title' => 'Big Announcement'
            ]);
        }
    }

    public function test_non_admin_cannot_send_broadcast()
    {
        $response = $this->actingAs($this->students[0])->postJson('/api/admin/broadcast/send', [
            'title' => 'Hack',
            'message' => 'I am a hacker',
            'type' => 'warning'
        ]);

        $response->assertStatus(403);
    }
}
