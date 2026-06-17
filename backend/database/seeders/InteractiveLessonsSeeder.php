<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lesson;
use App\Models\Section;

class InteractiveLessonsSeeder extends Seeder
{
    public function run()
    {
        $section = Section::where('name', 'الأعداد الطبيعية والأعداد الناطقة')->first();

        if (!$section) {
            $this->command->error('Section not found!');
            return;
        }

        // 1. Update the first lesson to discovery mode
        Lesson::where('name', 'قواسم عدد طبيعي')->update([
            'lab_type' => 'divisor_discovery'
        ]);

        // 2. Add or Update the Properties lesson
        Lesson::updateOrCreate(
        ['name' => 'خواص قواسم عدد طبيعي'],
        [
            'section_id' => $section->id,
            'summary' => 'نتعلم في هذا الدرس أهم خواص القواسم المتعلقة بالعمليات الحسابية (الجمع والطرح) وباقي القسمة الإقليدية.',
            'example_problem' => 'اكتشف خواص القواسم عبر التجارب التفاعلية:',
            'example_steps' => [
                [
                    'text' => 'حوصلة:',
                    'type' => 'notes'
                ],
                '$a$ و $b$ و $n$ أعداد طبيعية غير معدومة و $a > b$.',
                [
                    'text' => 'خاصية 1:',
                    'type' => 'notes'
                ],
                'إذا كان $n$ يقسم كلاً من $a$ و $b$، فإن $n$ يقسم كلاً من $(a+b)$ و $(a-b)$.',
                'مثال: لدينا $5$ يقسم كلاً من $15$ و $35$ إذن: $5$ يقسم كلاً من $50 (15+35)$ و $20 (35-15)$.',
                [
                    'text' => 'خاصية 2:',
                    'type' => 'notes'
                ],
                'إذا كان $n$ يقسم كلاً من $a$ و $b$، و $r$ باقي قسمة $a$ على $b$، فإن $n$ يقسم $r$.',
                'مثال: لدينا $7$ يقسم كلاً من $56$ و $21$.\nباقي قسمة $56$ على $21$ هو $14$.\nإذن: $7$ يقسم $14$.'
            ],
            'application_problem' => 'هل $6$ يقسم مجموع $12$ و $18$؟ علل.',
            'application_solution' => 'نعم، لأن $6$ يقسم كلاً من $12$ ($12=6 \times 2$) و $18$ ($18=6 \times 3$).',
            'order' => 1,
            'is_locked' => false,
            'lab_type' => 'divisor_properties'
        ]
        );

        $this->command->info('Interactive lessons seeded successfully!');
    }
}
