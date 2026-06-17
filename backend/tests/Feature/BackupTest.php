<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class BackupTest extends TestCase
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

    public function test_backup_command_creates_file()
    {
        $exitCode = Artisan::call('backup:database');
        $this->assertEquals(0, $exitCode);

        $backupDir = storage_path('app/backups');
        $files = File::files($backupDir);

        $this->assertGreaterThan(0, count($files));
        $this->assertStringStartsWith('backup_', $files[0]->getFilename());
        $this->assertStringEndsWith('.zip', $files[0]->getFilename());
    }

    public function test_only_admin_can_access_backup_api()
    {
        // Student should be forbidden
        $response = $this->actingAs($this->student)->getJson('/api/admin/backups');
        $response->assertStatus(403);

        // Admin should be allowed
        $response = $this->actingAs($this->admin)->getJson('/api/admin/backups');
        $response->assertStatus(200);
    }

    public function test_admin_can_trigger_backup_manually()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/backups');
        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'output']);
    }
}
