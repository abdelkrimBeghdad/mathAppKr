<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Field;

$fields = Field::with('sections.lessons')->get();
file_put_contents('db_check.json', json_encode($fields, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Done\n";
