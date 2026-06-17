<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a timestamped backup of the SQLite database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database backup...');

        $dbPath = database_path('database.sqlite');

        if (!File::exists($dbPath)) {
            $this->error('Database file not found!');
            return 1;
        }

        $timestamp = now()->format('Y-m-d_H-i-s');
        $fileName = "backup_{$timestamp}.zip";
        $backupDir = storage_path('app/backups');

        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $tmpZip = $backupDir . '/' . $fileName;

        $zip = new ZipArchive();
        if ($zip->open($tmpZip, ZipArchive::CREATE) === TRUE) {
            $zip->addFile($dbPath, 'database.sqlite');
            $zip->close();

            $this->info("Backup created successfully: {$fileName}");

            // Clean up old backups (keep only last 7 days)
            $this->cleanupOldBackups();

            return 0;
        }
        else {
            $this->error('Failed to create zip archive.');
            return 1;
        }
    }

    protected function cleanupOldBackups()
    {
        $files = File::files(storage_path('app/backups'));

        // Sorting by modification time
        usort($files, function ($a, $b) {
            return $b->getMTime() - $a->getMTime();
        });

        // Keep last 10 backups
        if (count($files) > 10) {
            $filesToDelete = array_slice($files, 10);
            foreach ($filesToDelete as $file) {
                File::delete($file->getRealPath());
                $this->comment("Deleted old backup: " . $file->getFilename());
            }
        }
    }
}
