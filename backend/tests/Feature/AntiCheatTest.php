<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Field;

class AntiCheatTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $field = Field::create(['name' => 'Math', 'description' => 'Math', 'order' => 1]);
        $section = Section::create(['field_id' => $field->id, 'name' => 'Algebra', 'description' => 'Algebra', 'order' => 1]);
        $this->lesson = Lesson::create([
            'section_id' => $section->id,
            'name' => 'Test Lesson',
            'order' => 1
        ]);
    }

    public function test_blocks_impossible_time_with_answers_array()
    {
        // 10 answers should take at least 15 seconds (1.5s per answer).
        // Submitting with 2 seconds triggers anti-cheat (403)
        $response = $this->actingAs($this->user)->postJson('/api/student/lessons/' . $this->lesson->id . '/quiz', [
            'answers' => [
                1 => 'A', 2 => 'B', 3 => 'C', 4 => 'D', 5 => 'A',
                6 => 'B', 7 => 'C', 8 => 'D', 9 => 'A', 10 => 'B'
            ],
            'time_taken' => 2
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');
    }

    public function test_allows_realistic_time()
    {
        // 10 answers taking 60 seconds is realistic
        $response = $this->actingAs($this->user)->postJson('/api/student/lessons/' . $this->lesson->id . '/quiz', [
            'answers' => [
                1 => 'A', 2 => 'B', 3 => 'C', 4 => 'D', 5 => 'A',
                6 => 'B', 7 => 'C', 8 => 'D', 9 => 'A', 10 => 'B'
            ],
            'time_taken' => 60
        ]);

        // Should not hit anti-cheat. Might 200 or 404/422 based on quiz payload validity, but NOT 403
        $this->assertNotEquals(403, $response->status());
    }

    public function test_blocks_impossible_score_time_ratio()
    {
        // Arcade submit format
        $response = $this->actingAs($this->user)->postJson('/api/arcade/submit', [
            'score' => 500, // 500 score ~ 50 questions
            'time_taken' => 5 // 5 seconds is impossible
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');
    }

    public function test_blocks_maximum_score_bound()
    {
        // An absurdly high score
        $response = $this->actingAs($this->user)->postJson('/api/arcade/submit', [
            'score' => 50000,
            'time_taken' => 3000
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('error', 'Cheat detected');
    }
}
