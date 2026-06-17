<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class EliteSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_sensitive_user_fields_cannot_be_mass_assigned()
    {
        $user = User::factory()->create([
            'points' => 10,
            'is_suspended' => false
        ]);

        // Attempt to hack points and suspension via a profile-like update (if there was a route)
        // Even if a developer accidentally passes $request->all() to update(), it should fail
        $user->update([
            'points' => 999999,
            'is_suspended' => true,
            'level' => 100,
            'coins' => 50000
        ]);

        $user->refresh();

        $this->assertEquals(10, $user->points);
        $this->assertFalse($user->is_suspended);
        $this->assertNotEquals(100, $user->level);
        $this->assertNotEquals(50000, $user->coins);
    }

    public function test_hsts_header_is_present()
    {
        $response = $this->get('/');
        $response->assertHeader('Strict-Transport-Security');
    }

    public function test_registration_rejects_weak_passwords()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Weak User',
            'email' => 'weak@example.com',
            'password' => '123b5678', // No mixed case, no symbols
            'password_confirmation' => '123b5678'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_registration_accepts_strong_passwords()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Strong User',
            'email' => 'strong@example.com',
            'password' => 'P@ssw0rd2026!',
            'password_confirmation' => 'P@ssw0rd2026!'
        ]);

        $response->assertStatus(200);
    }
}
