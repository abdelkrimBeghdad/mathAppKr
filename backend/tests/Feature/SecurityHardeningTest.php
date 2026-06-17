<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\ForumQuestion;
use App\Models\AuditLog;

class SecurityHardeningTest extends TestCase
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

    public function test_admin_actions_are_audited()
    {
        // Perform an admin action
        $response = $this->actingAs($this->admin)->postJson('/api/admin/fields', [
            'name' => 'Security Field',
            'order' => 1
        ]);

        $response->assertStatus(201);

        // Check if audit log was created
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->admin->id,
            'action' => 'POST api/admin/fields'
        ]);
    }

    public function test_security_headers_are_present()
    {
        $response = $this->getJson('/api/up'); // Health check or any route

        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_forum_content_is_sanitized()
    {
        $response = $this->actingAs($this->student)->postJson('/api/forum', [
            'title' => 'Malicious Title <script>alert(1)</script>',
            'content' => 'Malicious Content <img src=x onerror=alert(1)>'
        ]);

        $response->assertStatus(201);

        $question = ForumQuestion::first();
        $this->assertEquals('Malicious Title alert(1)', $question->title);
        $this->assertEquals('Malicious Content ', $question->content);
    }

    public function test_login_rate_limiting()
    {
        // Try to login many times
        for ($i = 0; $i < 11; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'wrong@example.com',
                'password' => 'wrong'
            ]);
        }

        $response->assertStatus(429); // Too Many Requests
    }
}
