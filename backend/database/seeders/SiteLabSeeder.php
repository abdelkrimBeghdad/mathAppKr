<?php

namespace Database\Seeders;

use App\Models\SiteLab;
use Illuminate\Database\Seeder;

class SiteLabSeeder extends Seeder
{
    public function run(): void
    {
        $labs = [
            // === النشر والتبسيط ===
            ['lab_key' => 'exp-simple',    'title_ar' => 'النشر البسيط',             'category' => 'expansion',     'difficulty' => 'مبتدئ'],
            ['lab_key' => 'exp-double',    'title_ar' => 'النشر المزدوج',            'category' => 'expansion',     'difficulty' => 'متوسط'],
            ['lab_key' => 'id1',           'title_ar' => 'المتطابقة الأولى',         'category' => 'expansion',     'difficulty' => 'متوسط'],
            ['lab_key' => 'id2',           'title_ar' => 'المتطابقة الثانية',        'category' => 'expansion',     'difficulty' => 'متوسط'],
            ['lab_key' => 'id3',           'title_ar' => 'المتطابقة الثالثة',        'category' => 'expansion',     'difficulty' => 'متقدم'],
            // === التحليل الجبري ===
            ['lab_key' => 'fact-common',   'title_ar' => 'التحليل بالعامل المشترك', 'category' => 'factorization', 'difficulty' => 'متوسط'],
            ['lab_key' => 'fact-id1',      'title_ar' => 'التحليل بالمتطابقة 1',    'category' => 'factorization', 'difficulty' => 'متقدم'],
            ['lab_key' => 'fact-id2',      'title_ar' => 'التحليل بالمتطابقة 2',    'category' => 'factorization', 'difficulty' => 'متقدم'],
            ['lab_key' => 'fact-id3',      'title_ar' => 'التحليل بالمتطابقة 3',    'category' => 'factorization', 'difficulty' => 'خبير'],
            // === القواسم والأعداد ===
            ['lab_key' => 'pgcd-divisors',    'title_ar' => 'القواسم المشتركة',     'category' => 'pgcd',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'pgcd-subtraction', 'title_ar' => 'الفروق المتتالية',     'category' => 'pgcd',          'difficulty' => 'متوسط'],
            ['lab_key' => 'pgcd-euclidean',   'title_ar' => 'خوارزمية إقليدس',      'category' => 'pgcd',          'difficulty' => 'متوسط'],
            ['lab_key' => 'coprime',          'title_ar' => 'عددان أوليان فيما بينهما', 'category' => 'pgcd',      'difficulty' => 'مبتدئ'],
            ['lab_key' => 'div-discover',     'title_ar' => 'اكتشاف القواسم',       'category' => 'pgcd',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'div-props',        'title_ar' => 'قابلية القسمة',         'category' => 'pgcd',          'difficulty' => 'مبتدئ'],
            // === الجذور التربيعية ===
            ['lab_key' => 'roots-simplification', 'title_ar' => 'تبسيط الجذور',     'category' => 'roots',         'difficulty' => 'متوسط'],
            ['lab_key' => 'roots-multiplication', 'title_ar' => 'ضرب الجذور',       'category' => 'roots',         'difficulty' => 'متوسط'],
            ['lab_key' => 'roots-division',       'title_ar' => 'قسمة الجذور',      'category' => 'roots',         'difficulty' => 'متوسط'],
            ['lab_key' => 'roots-addition',       'title_ar' => 'جمع الجذور',       'category' => 'roots',         'difficulty' => 'متقدم'],
            ['lab_key' => 'roots-subtraction',    'title_ar' => 'طرح الجذور',       'category' => 'roots',         'difficulty' => 'متقدم'],
            ['lab_key' => 'roots-expression',     'title_ar' => 'تبسيط العبارات',   'category' => 'roots',         'difficulty' => 'خبير'],
            // === الكسور والقوى ===
            ['lab_key' => 'frac-simplify',   'title_ar' => 'اختزال الكسور',         'category' => 'fractions',     'difficulty' => 'متوسط'],
            ['lab_key' => 'powers-rules',    'title_ar' => 'قواعد القوى',            'category' => 'powers',        'difficulty' => 'مبتدئ'],
            ['lab_key' => 'scientific-not',  'title_ar' => 'الكتابة العلمية',       'category' => 'powers',        'difficulty' => 'متوسط'],
            // === المعادلات والمتراجحات ===
            ['lab_key' => 'eq-solve',        'title_ar' => 'حل المعادلات',          'category' => 'equations',     'difficulty' => 'مبتدئ'],
            ['lab_key' => 'eq-product',      'title_ar' => 'الجداء المعدوم',        'category' => 'equations',     'difficulty' => 'متوسط'],
            ['lab_key' => 'ineq-solve',      'title_ar' => 'حل المتراجحات',         'category' => 'inequalities',  'difficulty' => 'متوسط'],
            ['lab_key' => 'ineq-graph',      'title_ar' => 'التمثيل البياني',       'category' => 'inequalities',  'difficulty' => 'متقدم'],
            // === الدوال الخطية والتآلفية ===
            ['lab_key' => 'lin-image',       'title_ar' => 'صور الدالة الخطية',     'category' => 'linear',        'difficulty' => 'مبتدئ'],
            ['lab_key' => 'lin-graph',       'title_ar' => 'تمثيل الدالة الخطية',  'category' => 'linear',        'difficulty' => 'متوسط'],
            ['lab_key' => 'lin-formula',     'title_ar' => 'استخراج المعامل الخطّي', 'category' => 'linear',      'difficulty' => 'متقدم'],
            ['lab_key' => 'aff-image',       'title_ar' => 'صور الدالة التآلفية',   'category' => 'affine',        'difficulty' => 'مبتدئ'],
            ['lab_key' => 'aff-graph',       'title_ar' => 'تمثيل الدالة التآلفية', 'category' => 'affine',       'difficulty' => 'متقدم'],
            ['lab_key' => 'aff-formula',     'title_ar' => 'استخراج العبارة الجبرية', 'category' => 'affine',     'difficulty' => 'خبير'],
            // === جملة المعادلتين ===
            ['lab_key' => 'sys-subst',       'title_ar' => 'طريقة التعويض',         'category' => 'systems',       'difficulty' => 'مبتدئ'],
            ['lab_key' => 'sys-add',         'title_ar' => 'طريقة الجمع',           'category' => 'systems',       'difficulty' => 'متوسط'],
            ['lab_key' => 'sys-graph',       'title_ar' => 'التفسير البياني',        'category' => 'systems',       'difficulty' => 'متقدم'],
            ['lab_key' => 'sys-strategy',    'title_ar' => 'إستراتيجية الحل',       'category' => 'systems',       'difficulty' => 'خبير'],
            // === فيثاغورس ===
            ['lab_key' => 'pyth-verify',     'title_ar' => 'التحقق من مثلث قائم',  'category' => 'pythagoras',    'difficulty' => 'مبتدئ'],
            ['lab_key' => 'pyth-hyp',        'title_ar' => 'حساب الوتر',            'category' => 'pythagoras',    'difficulty' => 'متوسط'],
            ['lab_key' => 'pyth-leg',        'title_ar' => 'حساب ضلع قائم',        'category' => 'pythagoras',    'difficulty' => 'متقدم'],
            ['lab_key' => 'pyth-prob',       'title_ar' => 'مسائل فيثاغورس',       'category' => 'pythagoras',    'difficulty' => 'خبير'],
            ['lab_key' => 'pyth-visual',     'title_ar' => 'البرهان البصري',        'category' => 'pythagoras',    'difficulty' => 'خبير'],
            // === طاليس ===
            ['lab_key' => 'thales-verify',   'title_ar' => 'التحقق من التوازي',     'category' => 'thales',        'difficulty' => 'مبتدئ'],
            ['lab_key' => 'thales-length',   'title_ar' => 'حساب طول مجهول',       'category' => 'thales',        'difficulty' => 'متوسط'],
            ['lab_key' => 'thales-prob',     'title_ar' => 'مسائل طاليس',          'category' => 'thales',        'difficulty' => 'متقدم'],
            ['lab_key' => 'thales-shadow',   'title_ar' => 'ظل الأهرامات',          'category' => 'thales',        'difficulty' => 'خبير'],
            // === الأشعة ===
            ['lab_key' => 'vec-concept',     'title_ar' => 'مفهوم الشعاع',          'category' => 'vectors',       'difficulty' => 'مبتدئ'],
            ['lab_key' => 'vec-read',        'title_ar' => 'القراءة البيانية',      'category' => 'vectors',       'difficulty' => 'مبتدئ'],
            ['lab_key' => 'vec-calc',        'title_ar' => 'الحساب الجبري',        'category' => 'vectors',       'difficulty' => 'متوسط'],
            ['lab_key' => 'vec-midpoint',    'title_ar' => 'نقطة المنتصف',          'category' => 'vectors',       'difficulty' => 'متوسط'],
            ['lab_key' => 'vec-distance',    'title_ar' => 'المسافة والطويلة',      'category' => 'vectors',       'difficulty' => 'متقدم'],
            ['lab_key' => 'vec-chasles',     'title_ar' => 'علاقة شال',             'category' => 'vectors',       'difficulty' => 'متوسط'],
            ['lab_key' => 'vec-para',        'title_ar' => 'متوازي الأضلاع',        'category' => 'vectors',       'difficulty' => 'متقدم'],
            ['lab_key' => 'vec-rand',        'title_ar' => 'الأشعة الكيفية',        'category' => 'vectors',       'difficulty' => 'متقدم'],
            ['lab_key' => 'vec-same-end',    'title_ar' => 'نفس النهاية',           'category' => 'vectors',       'difficulty' => 'خبير'],
            // === الحساب المثلثي ===
            ['lab_key' => 'trig-naming',     'title_ar' => 'تسمية الأضلاع',        'category' => 'trig',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'trig-cos',        'title_ar' => 'جيب التمام (Cos)',      'category' => 'trig',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'trig-sin',        'title_ar' => 'الجيب (Sin)',           'category' => 'trig',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'trig-tan',        'title_ar' => 'الظل (Tan)',            'category' => 'trig',          'difficulty' => 'مبتدئ'],
            ['lab_key' => 'trig-length',     'title_ar' => 'حساب الأطوال',         'category' => 'trig',          'difficulty' => 'متوسط'],
            ['lab_key' => 'trig-angle',      'title_ar' => 'استنتاج الزوايا',      'category' => 'trig',          'difficulty' => 'متوسط'],
            ['lab_key' => 'trig-identities', 'title_ar' => 'العلاقات الأساسية',    'category' => 'trig',          'difficulty' => 'متقدم'],
            ['lab_key' => 'trig-special',    'title_ar' => 'الزوايا الشهيرة',      'category' => 'trig',          'difficulty' => 'متقدم'],
            // === الهندسة الفضائية ===
            ['lab_key' => 'geo-solids',      'title_ar' => 'عالم المجسمات',         'category' => 'geometry-3d',   'difficulty' => 'مبتدئ'],
            ['lab_key' => 'geo-net',         'title_ar' => 'المساحة والنشر',        'category' => 'geometry-3d',   'difficulty' => 'متوسط'],
            ['lab_key' => 'geo-volume',      'title_ar' => 'مختبر السعة',           'category' => 'geometry-3d',   'difficulty' => 'متوسط'],
            ['lab_key' => 'geo-section',     'title_ar' => 'مختبر القواطع',         'category' => 'geometry-3d',   'difficulty' => 'متقدم'],
            ['lab_key' => 'geo-pyramid',     'title_ar' => 'مختبر القمم',           'category' => 'geometry-3d',   'difficulty' => 'متقدم'],
            // === الإحصاء والاحتمالات ===
            ['lab_key' => 'stat-freq',       'title_ar' => 'مختبر التكرارات',       'category' => 'stats',         'difficulty' => 'مبتدئ'],
            ['lab_key' => 'stat-mean',       'title_ar' => 'مختبر المعدلات',        'category' => 'stats',         'difficulty' => 'متوسط'],
            ['lab_key' => 'stat-cumulative', 'title_ar' => 'مختبر التراكم',         'category' => 'stats',         'difficulty' => 'متوسط'],
            ['lab_key' => 'stat-chart',      'title_ar' => 'مختبر الألوان',         'category' => 'stats',         'difficulty' => 'متقدم'],
            ['lab_key' => 'rotation-mastery','title_ar' => 'مختبر الرادار',          'category' => 'rotation',      'difficulty' => 'متوسط'],
            ['lab_key' => 'prob-mastery',    'title_ar' => 'مختبر الصدفة',          'category' => 'probability',   'difficulty' => 'متوسط'],
        ];

        foreach ($labs as $lab) {
            SiteLab::updateOrCreate(
                ['lab_key' => $lab['lab_key']],
                array_merge($lab, ['access_type' => 'classic', 'price' => 0])
            );
        }
    }
}
