<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ForumQuestion;
use App\Models\ForumAnswer;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;

class ForumModerationTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $student;
    private $question;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->student = User::factory()->create(['is_admin' => false]);
        $this->question = ForumQuestion::create([
            'user_id' => $this->student->id,
            'title' => 'Test Question',
            'content' => 'Test Content'
        ]);
    }

    public function test_admin_can_pin_question()
    {
        $response = $this->actingAs($this->admin)->postJson("/api/admin/forum/questions/{$this->question->id}/pin");
        $response->assertStatus(200);
        $this->question->refresh();
        $this->assertTrue($this->question->is_pinned);
    }

    public function test_admin_can_lock_question()
    {
        $response = $this->actingAs($this->admin)->postJson("/api/admin/forum/questions/{$this->question->id}/lock");
        $response->assertStatus(200);
        $this->question->refresh();
        $this->assertTrue($this->question->is_locked);
    }

    public function test_student_cannot_answer_locked_question()
    {
        $this->question->update(['is_locked' => true]);

        $response = $this->actingAs($this->student)->postJson("/api/forum/{$this->question->id}/answers", [
            'content' => 'Trying to answer'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_question()
    {
        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/forum/questions/{$this->question->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('forum_questions', ['id' => $this->question->id]);
    }

    public function test_admin_can_configure_lab_on_lesson()
    {
        $field = Field::create(['name' => 'Math', 'order' => 1]);
        $section = Section::create(['field_id' => $field->id, 'name' => 'Algebra', 'order' => 1]);
        $lesson = Lesson::create(['section_id' => $section->id, 'name' => 'Equations', 'order' => 1]);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/lessons/{$lesson->id}", [
            'name' => 'Equations V2',
            'lab_type' => 'equation',
            'lab_config' => ['mode' => 'guided']
        ]);

        $response->assertStatus(200);
        $lesson->refresh();
        $this->assertEquals('equation', $lesson->lab_type);
        $this->assertEquals(['mode' => 'guided'], $lesson->lab_config);
    }
}
