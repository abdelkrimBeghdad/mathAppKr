<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lesson;
use App\Models\Question;

class QuizDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Find a lesson to attach questions to (e.g., Thales Theorem)
        $thales = Lesson::where('name', 'LIKE', '%طالس%')->first();

        if ($thales) {
            $questions = [
                [
                    'question_text' => 'في نظرية طالس، إذا كان المستقيمان متوازيين، فإن النسب تكون:',
                    'options' => ['متساوية', 'مختلفة', 'متعاكسة', 'لا توجد علاقة'],
                    'correct_answer' => 'متساوية',
                    'explanation' => 'تنص نظرية طالس على أن المستقيمات المتوازية تقطع قاطعين في أطوال متناسبة.',
                    'type' => 'mcq'
                ],
                [
                    'question_text' => 'تستخدم نظرية طالع العكسية لإثبات:',
                    'options' => ['التوازي', 'التعامد', 'المساواة', 'التقاطع'],
                    'correct_answer' => 'التوازي',
                    'explanation' => 'إذا كانت النسب متساوية، فإن المستقيمين متوازيان حسب النظرية العكسية.',
                    'type' => 'mcq'
                ]
            ];

            foreach ($questions as $q) {
                $thales->questions()->create($q);
            }
        }

        // Pythagoras
        $pythagoras = Lesson::where('name', 'LIKE', '%فيثاغورس%')->first();
        if ($pythagoras) {
            $questions = [
                [
                    'question_text' => 'في مثلث قائم الزاوية طول ضلعيه القائمين $3cm$ و $4cm$، ما هو طول الوتر؟',
                    'options' => ['$5cm$', '$7cm$', '$6cm$', '$25cm$'],
                    'correct_answer' => '$5cm$',
                    'explanation' => 'حسب فيثاغورس: $3^2 + 4^2 = 9 + 16 = 25$. وجذر $25$ هو $5$.',
                    'type' => 'mcq'
                ],
                [
                    'question_text' => 'الوتر هو دائما الضلع المقابل للزاوية القائمة وهو:',
                    'options' => ['الأطول', 'الأقصر', 'الأوسط', 'لا يمكن معرفة ذلك'],
                    'correct_answer' => 'الأطول',
                    'explanation' => 'الوتر يقابل الزاوية القائمة وهو دائماً أطول ضلع في المثلث القائم.',
                    'type' => 'mcq'
                ]
            ];

            foreach ($questions as $q) {
                $pythagoras->questions()->create($q);
            }
        }

        // Divisors
        $divisors = Lesson::where('name', 'LIKE', '%قواسم%')->first();
        if ($divisors) {
            $questions = [
                [
                    'question_text' => 'أوجد قواسم العدد $12$',
                    'options' => [],
                    'correct_answer' => '{1,2,3,4,6,12}',
                    'explanation' => 'نبحث عن الأعداد التي تقسم 12 بدون باق: $1 \times 12, 2 \times 6, 3 \times 4$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $18$',
                    'options' => [],
                    'correct_answer' => '{1,2,3,6,9,18}',
                    'explanation' => 'نبحث عن الأزواج التي جداؤها 18: $1 \times 18, 2 \times 9, 3 \times 6$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $20$',
                    'options' => [],
                    'correct_answer' => '{1,2,4,5,10,20}',
                    'explanation' => 'قواسم 20 هي: $1 \times 20, 2 \times 10, 4 \times 5$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $24$',
                    'options' => [],
                    'correct_answer' => '{1,2,3,4,6,8,12,24}',
                    'explanation' => 'قواسم 24 هي الأعداد التي تقسمه تماماً: $1, 2, 3, 4, 6, 8, 12, 24$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $30$',
                    'options' => [],
                    'correct_answer' => '{1,2,3,5,6,10,15,30}',
                    'explanation' => 'الأزواج التي جداؤها 30: $1 \times 30, 2 \times 15, 3 \times 10, 5 \times 6$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $16$',
                    'options' => [],
                    'correct_answer' => '{1,2,4,8,16}',
                    'explanation' => 'قواسم 16 هي الأعداد التي تقسمه بدون باق: $1, 2, 4, 8, 16$.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد قواسم العدد $25$',
                    'options' => [],
                    'correct_answer' => '{1,5,25}',
                    'explanation' => 'قواسم 25 هي: $1, 5, 25$. لاحظ أن $5 \times 5 = 25$.',
                    'type' => 'text'
                ]
            ];
            foreach ($questions as $q) {
                $divisors->questions()->updateOrCreate(
                    ['question_text' => $q['question_text']],
                    $q
                );
            }
        }

        // Square Roots
        $roots = Lesson::where('name', 'LIKE', '%الجذور%')->first();
        if ($roots) {
            $questions = [
                [
                    'question_text' => 'ما هو ناتج تبسيط العبارة $\sqrt{50}$؟',
                    'options' => ['$5\sqrt{2}$', '$2\sqrt{5}$', '$10\sqrt{5}$', '$5\sqrt{10}$'],
                    'correct_answer' => '$5\sqrt{2}$',
                    'explanation' => '$\sqrt{50} = \sqrt{25 \times 2} = \sqrt{25} \times \sqrt{2} = 5\sqrt{2}$.',
                    'type' => 'mcq'
                ],
                [
                    'question_text' => 'أي من الأعداد التالية يعتبر مربعاً تاماً؟',
                    'options' => ['$16$', '$8$', '$24$', '$20$'],
                    'correct_answer' => '$16$',
                    'explanation' => 'العدد $16$ هو مربع تام لأن $4^2 = 16$.',
                    'type' => 'mcq'
                ]
            ];

            foreach ($questions as $q) {
                $roots->questions()->updateOrCreate(
                    ['question_text' => $q['question_text']],
                    $q
                );
            }
        }

        // PGCD
        $pgcd = Lesson::where('name', 'LIKE', '%PGCD%')->first();
        if ($pgcd) {
            $questions = [
                [
                    'question_text' => 'أوجد $PGCD(24, 36)$',
                    'options' => [],
                    'correct_answer' => '12',
                    'explanation' => 'نبحث عن أكبر قاسم مشترك. قواسم 24 هي {1,2,3,4,6,8,12,24} وقواسم 36 هي {1,2,3,4,6,9,12,18,36}. الأكبر هو 12.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(15, 25)$',
                    'options' => [],
                    'correct_answer' => '5',
                    'explanation' => 'قواسم 15: {1, 3, 5, 15}. قواسم 25: {1, 5, 25}. القاسم المشترك الأكبر هو 5.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(18, 27)$',
                    'options' => [],
                    'correct_answer' => '9',
                    'explanation' => 'قواسم 18: {1, 2, 3, 6, 9, 18}. قواسم 27: {1, 3, 9, 27}. القاسم المشترك الأكبر هو 9.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(14, 21)$',
                    'options' => [],
                    'correct_answer' => '7',
                    'explanation' => 'قواسم 14: {1, 2, 7, 14}. قواسم 21: {1, 3, 7, 21}. القاسم المشترك الأكبر هو 7.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(40, 60)$',
                    'options' => [],
                    'correct_answer' => '20',
                    'explanation' => 'قواسم 40: {1,2,4,5,8,10,20,40}. قواسم 60: {1,2,3,4,5,6,10,12,15,20,30,60}. القاسم المشترك الأكبر هو 20.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(48, 72)$',
                    'options' => [],
                    'correct_answer' => '24',
                    'explanation' => 'نبحث عن أكبر قاسم مشترك لـ 48 و 72. نلاحظ أن $48 = 24 \times 2$ و $72 = 24 \times 3$. إذن PGCD هو 24.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(100, 150)$',
                    'options' => [],
                    'correct_answer' => '50',
                    'explanation' => 'القاسم المشترك الأكبر لـ 100 و 150 هو 50.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(56, 42)$',
                    'options' => [],
                    'correct_answer' => '14',
                    'explanation' => 'قواسم 56 تشمل 14 ($56 = 14 \times 4$) وقواسم 42 تشمل 14 ($42 = 14 \times 3$). إذن PGCD هو 14.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(81, 54)$',
                    'options' => [],
                    'correct_answer' => '27',
                    'explanation' => '$81 = 27 \times 3$ و $54 = 27 \times 2$. القاسم المشترك الأكبر هو 27.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(64, 48)$',
                    'options' => [],
                    'correct_answer' => '16',
                    'explanation' => '$64 = 16 \times 4$ و $48 = 16 \times 3$. القاسم المشترك الأكبر هو 16.',
                    'type' => 'text'
                ],
                [
                    'question_text' => 'أوجد $PGCD(35, 49)$',
                    'options' => [],
                    'correct_answer' => '7',
                    'explanation' => 'كلا العددين من مضاعفات 7. القاسم المشترك الأكبر هو 7.',
                    'type' => 'text'
                ]
            ];

            foreach ($questions as $q) {
                $pgcd->questions()->updateOrCreate(
                    ['question_text' => $q['question_text']],
                    $q
                );
            }
        }

        // Functions
        $functions = Lesson::where('name', 'LIKE', '%خطية%')->first();
        if ($functions) {
            $questions = [
                [
                    'question_text' => 'صورة العدد $3$ بالدالة الخطية $f(x) = 2x$ هي:',
                    'options' => ['$6$', '$5$', '$1$', '$1.5$'],
                    'correct_answer' => '$6$',
                    'explanation' => '$f(3) = 2 \times 3 = 6$.',
                    'type' => 'mcq'
                ]
            ];

            foreach ($questions as $q) {
                $functions->questions()->updateOrCreate(
                    ['question_text' => $q['question_text']],
                    $q
                );
            }
        }

        // Vectors and Chasles
        $vectors = Lesson::where('name', 'LIKE', '%شعاعين%')->first();
        if ($vectors) {
            $questions = [
                [
                    'question_text' => 'إذا كان $\vec{AB} = \vec{CD}$، فإن الرباعي $ABDC$ هو:',
                    'options' => ['متوازي أضلاع', 'مستطيل', 'مربع', 'معين'],
                    'correct_answer' => 'متوازي أضلاع',
                    'explanation' => 'تساوي شعاعين يعني أن لهما نفس المنحى والاتجاه والطول، وهذا يشكل متوازي أضلاع.',
                    'type' => 'mcq'
                ],
                [
                    'question_text' => 'حسب علاقة شال، ناتج الجمع $\vec{AB} + \vec{BC}$ هو:',
                    'options' => ['$\vec{AC}$', '$\vec{BA}$', '$\vec{CB}$', '$\vec{AA}$'],
                    'correct_answer' => '$\vec{AC}$',
                    'explanation' => 'تنص علاقة شال على أن نهاية الشعاع الأول هي بداية الشعاع الثاني، والنتيجة هي الشعاع الواصل بين البداية والنهاية.',
                    'type' => 'mcq'
                ]
            ];

            foreach ($questions as $q) {
                $vectors->questions()->updateOrCreate(
                    ['question_text' => $q['question_text']],
                    $q
                );
            }
        }
    }
}
