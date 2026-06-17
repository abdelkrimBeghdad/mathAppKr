<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Field;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Support\Facades\DB;

echo "Starting Database Cleanup...\n";

// 1. Resolve Field Duplicates
// We want: 1. أنشطة عددية, 2. أنشطة هندسية, 3. تنظيم معطيات
$fieldsToDelete = Field::whereIn('name', ['إحصاء', 'Activités Numériques', 'Activités Géométriques'])->get();
foreach ($fieldsToDelete as $f) {
    echo "Deleting redundant field: {$f->name} (ID: {$f->id})\n";
    // Lessons and Sections will be deleted via cascade or manual if needed
    $f->delete();
}

// Ensure Field 16 (تنظيم معطيات) is mapped correctly or renamed if it has a different ID
$fieldStat = Field::where('name', 'تنظيم معطيات')->first();
if ($fieldStat) {
    $fieldStat->update(['order' => 3]);
}

// 2. Resolve Section Duplicates in Field 2 (أنشطة هندسية)
$fieldGeo = Field::where('name', 'أنشطة هندسية')->first();
if ($fieldGeo) {
    // We want the sections from my new seeder, so we delete old ones that might conflict
    $oldSections = Section::where('field_id', $fieldGeo->id)
        ->whereIn('name', ['خاصية طاليس', 'الأشعة والانسحاب', 'الدوران والمضلعات المنتظمة', 'الهندسة في الفضاء'])
        ->get();
    
    foreach ($oldSections as $s) {
        // Only delete if there's a replacement or if it's truly redundant
        // Actually, my seeder uses updateOrCreate, but if the ID is different it might create duplicates.
        // Let's just wipe sections for Field 2 and let the seeder re-create them cleanly.
        echo "Cleaning up section in Field 2: {$s->name}\n";
        $s->delete();
    }
}

// 3. Resolve Lesson Duplicates in Field 1
$fieldNum = Field::where('name', 'أنشطة عددية')->first();
if ($fieldNum) {
    // Wipe all lessons in Field 1 as well to ensure a clean re-seed with correct ordering
    // This is safer than trying to merge IDs which might have conflicting orders.
    foreach ($fieldNum->sections as $sec) {
        echo "Clearing lessons in section: {$sec->name}\n";
        $sec->lessons()->delete();
    }
}

echo "Cleanup Finished. Ready for re-seeding.\n";
