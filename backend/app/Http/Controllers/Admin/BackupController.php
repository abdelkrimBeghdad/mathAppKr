<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

class BackupController extends Controller
{
    public function index()
    {
        $backupDir = storage_path('app/backups');

        if (!File::exists($backupDir)) {
            return response()->json(['backups' => []]);
        }

        $files = File::files($backupDir);

        $backups = array_map(function ($file) {
            return [
            'name' => $file->getFilename(),
            'size' => round($file->getSize() / 1024 / 1024, 2) . ' MB',
            'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
            ];
        }, $files);

        // Sort by newest first
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return response()->json(['backups' => $backups]);
    }

    public function create()
    {
        $exitCode = Artisan::call('backup:database');

        if ($exitCode === 0) {
            return response()->json([
                'message' => 'Backup created successfully!',
                'output' => Artisan::output()
            ]);
        }

        return response()->json([
            'message' => 'Failed to create backup.',
            'error' => Artisan::output()
        ], 500);
    }

    public function download($fileName)
    {
        $path = storage_path("app/backups/{$fileName}");

        if (!File::exists($path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return Response::download($path);
    }

    public function destroy($fileName)
    {
        $path = storage_path("app/backups/{$fileName}");

        if (File::exists($path)) {
            File::delete($path);
            return response()->json(['message' => 'Backup deleted successfully.']);
        }

        return response()->json(['message' => 'File not found.'], 404);
    }
}
