<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sectionRoots = \App\Models\Section::where('name', 'الأعداد الطبيعية والأعداد الناطقة')->first();
$sectionAlgebra = \App\Models\Section::where('name', 'الحساب الحرفي')->first();

if (!$sectionRoots) {
    echo "Section not found!\n";
    exit(1);
}

if (!$sectionAlgebra) {
    // إذا لم يكن القسم موجوداً، نستخدم القسم الحالي كبديل أو نقوم بإنشائه
    $sectionAlgebra = $sectionRoots;
}

// 1. Rational vs Irrational Roots
\App\Models\Lesson::updateOrCreate(
    ['name' => 'الأعداد الناطقة والجذور'],
    [
        'section_id' => $sectionRoots->id,
        'summary' => 'التمييز بين الجذور التي تعطي أعداداً ناطقة والجذور الصماء. يكون $\sqrt{a}$ ناطقاً إذا كان $a$ مربعاً لعدد ناطق.',
        'example_problem' => 'مختبر تمييز الأعداد الناطقة:',
        'example_steps' => [
            'تعلم قاعدة المربع التام للعدد الناطق.',
            'تدرب على تمييز نوع الجذر (ناطق أو أصم).',
            ['text' => 'مثال: $\sqrt{5}$ ليس ناطقاً لأن 5 ليس مربعاً لعدد ناطق.', 'type' => 'notes'],
        ],
        'application_problem' => 'هل $\sqrt{121}$ عدد ناطق؟',
        'application_solution' => 'نعم',
        'order' => 3,
        'is_locked' => false,
        'lab_type' => 'rational_roots'
    ]
);

// 2. مختبر النشر البسيط
\App\Models\Lesson::updateOrCreate(
    ['name' => 'النشر والتبسيط'],
    [
        'section_id' => $sectionAlgebra->id,
        'summary' => 'توزيع الضرب على الجمع والطرح لتبسيط العبارات الجبرية وإزالة الأقواس.',
        'example_problem' => 'انشر العبارة: $3(x + 5)$',
        'example_steps' => [
            'اضرب 3 في الحد الأول x.',
            'اضرب 3 في الحد الثاني 5.',
            ['text' => 'النتيجة النهائية: $3x + 15$', 'type' => 'success'],
        ],
        'application_problem' => 'انشر العبارة $2(x - 4)$',
        'application_solution' => '2x-8',
        'order' => 4,
        'is_locked' => false,
        'lab_type' => 'exp-simple'
    ]
);

// 3. مختبر النشر المزدوج
\App\Models\Lesson::updateOrCreate(
    ['name' => 'النشر المزدوج'],
    [
        'section_id' => $sectionAlgebra->id,
        'summary' => 'توزيع كل حد من القوس الأول على كل حد من القوس الثاني بالتساوي.',
        'example_problem' => 'انشر العبارة: $(x + 1)(x + 4)$',
        'example_steps' => [
            'وزع x على القوس الثاني.',
            'وزع 1 على القوس الثاني.',
            'اجمع الحدود المتشابهة: $x^2 + 5x + 4$',
        ],
        'application_problem' => 'بسط العبارة $(x+2)(x+3)$',
        'application_solution' => 'x^2+5x+6',
        'order' => 5,
        'is_locked' => false,
        'lab_type' => 'exp-double'
    ]
);

echo "Rational Roots lesson added successfully!\n";
echo "Expansion lessons added successfully!\n";
