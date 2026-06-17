<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Field;
use App\Models\Section;
use App\Models\Lesson;

$fields = Field::with('sections.lessons')->get();
foreach ($fields as $f) {
    echo "Field: " . $f->name . " (ID: " . $f->id . ")\n";
    foreach ($f->sections as $s) {
        echo "  Section: " . $s->name . " (" . $s->lessons->count() . " lessons)\n";
        foreach ($s->lessons as $l) {
            echo "    - " . $l->name . " (Order: " . $l->order . ", ID: " . $l->id . ")\n";
        }
    }
}
