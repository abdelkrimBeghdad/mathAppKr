<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SecurityIncident;

class LabRewardSecurityTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Create initial lab progress record so that generic progress check passes
        \App\Models\LabProgress::create([
            'user_id' => $this->user->id,
            'lab_id' => 'sys-add-mastery',
            'phase' => 'practice'
        ]);
    }

    /**
     * Test successful claim with correct mathematical verification.
     */
    public function test_allows_reward_with_correct_math_verification()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add-mastery',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure(['status', 'message', 'reward']);

        // Check user balance incremented
        $this->user->refresh();
        $this->assertEquals(100, $this->user->coins);
        $this->assertEquals(200, $this->user->xp);
    }

    /**
     * Test block and log when verification payload is missing entirely.
     */
    public function test_blocks_and_logs_missing_verification()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add-mastery'
            // Missing verification
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        // Check if security incident is recorded
        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('missing_verification', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when incorrect math answers are supplied.
     */
    public function test_blocks_and_logs_incorrect_math_solution()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add-mastery',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 9, // Wrong answer (should be 1)
                'y' => 9  // Wrong answer (should be 2)
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('invalid_math_solution', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when trivial/forged equations (like 0x + 0y = 0) are used.
     */
    public function test_blocks_and_logs_trivial_equations()
    {
        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add-mastery',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 0, 'b' => 0, 'c' => 0], // Trivial
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('trivial_equations', $incident->details['cheat_type']);
    }

    /**
     * Test block and log when student tries to claim a reward without any progress in the lab.
     */
    public function test_blocks_and_logs_when_no_progress_exists()
    {
        // Delete the progress created in setUp
        \App\Models\LabProgress::where('user_id', $this->user->id)->delete();

        $response = $this->actingAs($this->user)->postJson('/api/rewards/lab/claim', [
            'lab_id' => 'sys-add-mastery',
            'verification' => [
                'type' => 'system',
                'eq1' => ['a' => 2, 'b' => 1, 'c' => 4],
                'eq2' => ['a' => 1, 'b' => -2, 'c' => -3],
                'x' => 1,
                'y' => 2
            ]
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->user->id,
            'type' => 'lab_cheating',
            'severity' => 'high'
        ]);

        $incident = SecurityIncident::where('user_id', $this->user->id)->first();
        $this->assertEquals('missing_lab_progress', $incident->details['cheat_type']);
    }
}
