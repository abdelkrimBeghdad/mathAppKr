<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\StoreItem;

class LinkSecurityTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_store_item_image_url_must_be_active_url()
    {
        // Try with a non-existent domain
        $response = $this->actingAs($this->admin)->postJson('/api/admin/store/items', [
            'name' => 'Broken Link Item',
            'type' => 'avatar',
            'price' => 100,
            'image_url' => 'https://this-domain-definitely-does-not-exist-12345.com/image.png',
            'description' => 'Testing active_url validation'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['image_url']);

        // Try with a valid URL (google.com should be active)
        $response = $this->actingAs($this->admin)->postJson('/api/admin/store/items', [
            'name' => 'Valid Link Item',
            'type' => 'avatar',
            'price' => 100,
            'image_url' => 'https://www.google.com/favicon.ico',
            'description' => 'Testing active_url validation'
        ]);

        $response->assertStatus(201);
    }

    public function test_broadcast_action_url_must_be_valid_url()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/broadcast/send', [
            'title' => 'Important Update',
            'message' => 'Check this out!',
            'type' => 'info',
            'action_url' => 'not-a-valid-url'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['action_url']);
    }

    public function test_security_headers_contain_hardened_csp()
    {
        $response = $this->get('/');

        $response->assertHeader('Content-Security-Policy');
        $csp = $response->headers->get('Content-Security-Policy');

        $this->assertStringContainsString("frame-ancestors 'none'", $csp);
        $this->assertStringContainsString("img-src 'self' data: https://* http://*", $csp);
    }
}
