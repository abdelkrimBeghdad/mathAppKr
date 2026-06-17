<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\SecurityIncident;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;

class SecurityMonitorTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $student;
    private $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->student = User::factory()->create(['is_admin' => false]);

        $field = Field::create(['name' => 'Math', 'description' => 'Math', 'order' => 1]);
        $section = Section::create(['field_id' => $field->id, 'name' => 'Algebra', 'description' => 'Algebra', 'order' => 1]);
        $this->lesson = Lesson::create([
            'section_id' => $section->id,
            'name' => 'Test Lesson',
            'order' => 1
        ]);
    }

    public function test_anticheat_middleware_logs_incident_to_db()
    {
        // 10 answers taking 1 second (impossible)
        $this->actingAs($this->student)->postJson('/api/student/lessons/' . $this->lesson->id . '/quiz', [
            'answers' => [
                1 => 'A', 2 => 'B', 3 => 'C', 4 => 'D', 5 => 'A',
                6 => 'B', 7 => 'C', 8 => 'D', 9 => 'A', 10 => 'B'
            ],
            'time_taken' => 1
        ]);

        $this->assertDatabaseHas('security_incidents', [
            'user_id' => $this->student->id,
            'type' => 'impossible_time',
        ]);
    }

    public function test_admin_can_suspend_student()
    {
        $response = $this->actingAs($this->admin)->postJson("/api/admin/security/users/{$this->student->id}/suspend", [
            'reason' => 'Cheating detected'
        ]);

        $response->assertStatus(200);
        $this->student->refresh();
        $this->assertTrue($this->student->is_suspended);
        $this->assertEquals('Cheating detected', $this->student->suspension_reason);
    }

    public function test_suspended_student_is_blocked_from_student_routes()
    {
        $this->student->update(['is_suspended' => true]);

        $response = $this->actingAs($this->student)->getJson('/api/student/structure');

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Account suspended');
    }

    public function test_admin_can_view_incidents()
    {
        SecurityIncident::create([
            'user_id' => $this->student->id,
            'type' => 'test_incident',
            'severity' => 'medium',
            'ip_address' => '127.0.0.1'
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/security/incidents');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
