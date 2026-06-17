<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Lesson;

$lessons = Lesson::withCount('questions')->get()->filter(fn($l) => $l->questions_count > 0);

if ($lessons->isEmpty()) {
    echo "No lessons found with questions.\n";
} else {
    foreach ($lessons as $lesson) {
        echo "ID: {$lesson->id} | Name: {$lesson->name} | Questions: {$lesson->questions_count}\n";
    }
}
