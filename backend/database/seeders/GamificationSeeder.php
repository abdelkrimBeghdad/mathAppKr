<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Badge;

class GamificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            [
                'name' => 'عبقري الرياضيات المبتديء',
                'slug' => 'math-genius-novice',
                'description' => 'أول خطوة في طريق العظمة! أكمل أول درس لك.',
                'icon' => 'Award',
                'requirement_type' => 'completed_lessons',
                'requirement_value' => 1,
            ],
            [
                'name' => 'خبير الهندسة',
                'slug' => 'geometry-expert',
                'description' => 'أتقنت التعامل مع المثلثات والزوايا. أكمل 5 دروس في مجال الهندسة.',
                'icon' => 'Triangle',
                'requirement_type' => 'field_completed_lessons',
                'requirement_value' => 5,
            ],
            [
                'name' => 'بطل الحساب',
                'slug' => 'arithmetic-hero',
                'description' => 'سرعتك في الحساب مذهلة! حصلت على مجموع نقاط 1000.',
                'icon' => 'Zap',
                'requirement_type' => 'total_points',
                'requirement_value' => 1000,
            ],
            [
                'name' => 'المكتشف الجبري',
                'slug' => 'algebra-explorer',
                'description' => 'أتممت 5 مختبرات تفاعلية في الجبر بنجاح.',
                'icon' => 'Atom',
                'requirement_type' => 'lab_completions',
                'requirement_value' => 5,
            ],
            [
                'name' => 'سيد القواسم',
                'slug' => 'divisor-master',
                'description' => 'أتقنت طرق حساب القاسم المشترك الأكبر (PGCD).',
                'icon' => 'Hash',
                'requirement_type' => 'arithmetic_mastery',
                'requirement_value' => 3,
            ]
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['slug' => $badge['slug']], $badge);
        }
    }
}
