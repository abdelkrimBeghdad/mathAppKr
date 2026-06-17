<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\StoreItem;

class AdminStoreTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
    }

    public function test_admin_can_create_store_item()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/store/items', [
            'name' => 'Legendary Viking Helmet',
            'type' => 'avatar',
            'price' => 1000,
            'image_url' => 'https://example.com/item.png',
            'description' => 'A helmet for true warriors.'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('store_items', ['name' => 'Legendary Viking Helmet']);
    }

    public function test_admin_can_update_store_item()
    {
        $item = StoreItem::create([
            'name' => 'Old Badge',
            'type' => 'banner',
            'price' => 50,
            'image_url' => 'https://example.com/old.png'
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/admin/store/items/{$item->id}", [
            'name' => 'Shiny New Badge',
            'price' => 75
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Shiny New Badge', $item->fresh()->name);
        $this->assertEquals(75, $item->fresh()->price);
    }

    public function test_admin_can_delete_store_item()
    {
        $item = StoreItem::create([
            'name' => 'Temporary Item',
            'type' => 'other',
            'price' => 10,
            'image_url' => 'https://example.com/temp.png'
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/store/items/{$item->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('store_items', ['id' => $item->id]);
    }

    public function test_non_admin_cannot_manage_store()
    {
        $student = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($student)->postJson('/api/admin/store/items', [
            'name' => 'Hacker Item',
            'type' => 'avatar',
            'price' => 0,
            'image_url' => 'https://example.com/hack.png'
        ]);

        $response->assertStatus(403);
    }
}
