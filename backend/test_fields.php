<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Field;

try {
    echo "Testing Field::with('sections.lessons')->get()...\n";
    $fields = Field::with('sections.lessons')->orderBy('order')->get();
    echo "Success! Found " . $fields->count() . " fields\n";
    foreach ($fields as $field) {
        echo "- {$field->name}: " . $field->sections->count() . " sections\n";
    }
}
catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
