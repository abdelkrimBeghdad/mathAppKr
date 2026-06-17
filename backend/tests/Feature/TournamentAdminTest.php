<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Tournament;
use Carbon\Carbon;

class TournamentAdminTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->student = User::factory()->create(['is_admin' => false]);
    }

    public function test_admin_can_list_tournaments()
    {
        Tournament::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)->getJson('/api/admin/tournaments');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    public function test_student_cannot_list_admin_tournaments()
    {
        $response = $this->actingAs($this->student)->getJson('/api/admin/tournaments');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_tournament()
    {
        $payload = [
            'title' => 'Admin Tournament',
            'description' => 'Test Desc',
            'start_time' => now()->addDay()->toDateTimeString(),
            'end_time' => now()->addDays(2)->toDateTimeString(),
            'prize_coins' => 500,
            'prize_xp' => 1000,
            'min_level' => 5,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/admin/tournaments', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('tournament.title', 'Admin Tournament');

        $this->assertDatabaseHas('tournaments', ['title' => 'Admin Tournament']);
    }

    public function test_admin_can_update_tournament()
    {
        $tournament = Tournament::create([
            'title' => 'Old Title',
            'start_time' => now(),
            'end_time' => now()->addDay(),
            'prize_coins' => 100,
            'prize_xp' => 100,
            'min_level' => 1,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/tournaments/{$tournament->id}", [
            'title' => 'New Title',
            'start_time' => $tournament->start_time->toDateTimeString(),
            'end_time' => $tournament->end_time->toDateTimeString(),
            'prize_coins' => 200,
            'prize_xp' => 200,
            'min_level' => 2,
            'status' => 'active',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tournaments', ['title' => 'New Title']);
    }

    public function test_admin_can_delete_tournament()
    {
        $tournament = Tournament::create([
            'title' => 'To be deleted',
            'start_time' => now(),
            'end_time' => now()->addDay(),
            'prize_coins' => 100,
            'prize_xp' => 100,
            'min_level' => 1,
            'status' => 'upcoming',
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/tournaments/{$tournament->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('tournaments', ['id' => $tournament->id]);
    }
}
