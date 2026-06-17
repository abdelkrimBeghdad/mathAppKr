<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Field;
use App\Models\StoreItem;

class DataIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_global_input_sanitization_trims_whitespace()
    {
        // Try to create a field with excessive whitespace
        $response = $this->actingAs($this->admin)->postJson('/api/admin/fields', [
            'name' => '  Messy Field Name  ',
            'description' => '   Some description   ',
            'order' => 1
        ]);

        $response->assertStatus(201);

        $field = Field::first();
        $this->assertEquals('Messy Field Name', $field->name);
        $this->assertEquals('Some description', $field->description);
    }

    public function test_global_input_sanitization_strips_html()
    {
        // Try to create a field with HTML tags
        $response = $this->actingAs($this->admin)->postJson('/api/admin/fields', [
            'name' => '<b>Bold Field</b>',
            'description' => '<script>alert(1)</script>Clean data',
            'order' => 2
        ]);

        $response->assertStatus(201);

        $field = Field::orderBy('id', 'desc')->first();
        $this->assertEquals('Bold Field', $field->name);
        $this->assertEquals('alert(1)Clean data', $field->description);
    }

    public function test_stricter_length_validation_enforced()
    {
        // Name field has max:255
        $longName = str_repeat('a', 256);

        $response = $this->actingAs($this->admin)->postJson('/api/admin/fields', [
            'name' => $longName,
            'order' => 3
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_store_item_price_limit_enforced()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/store/items', [
            'name' => 'Expensive Item',
            'type' => 'avatar',
            'price' => 1000001, // Max is 1,000,000
            'image_url' => 'https://example.com/image.png'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['price']);
    }
}
