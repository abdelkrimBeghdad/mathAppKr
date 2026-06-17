<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tournament;
use Carbon\Carbon;

class TournamentSeeder extends Seeder
{
    public function run()
    {
        Tournament::create([
            'title' => 'بطولة الخوارزمي الكبرى 📐',
            'description' => 'بطولة أسبوعية شاملة لكافة دروس الفصل الأول. تحدَّ نفسك واربح جوائز قيمة!',
            'start_time' => now(),
            'end_time' => now()->addDays(7),
            'prize_coins' => 500,
            'prize_xp' => 1000,
            'min_level' => 1,
            'status' => 'active',
        ]);

        Tournament::create([
            'title' => 'تحدي بيتاغورث 📐',
            'description' => 'مسابقة خاصة بالهندسة والمثلثات القائمة. هل تستطيع حلها في وقت قياسي؟',
            'start_time' => now(),
            'end_time' => now()->addDays(3),
            'prize_coins' => 300,
            'prize_xp' => 600,
            'min_level' => 2,
            'status' => 'active',
        ]);

        Tournament::create([
            'title' => 'سباق الجبر والأنظمة ⚡',
            'description' => 'مسابقة مقبلة تركز على حل جملة معادلتين من الدرجة الأولى.',
            'start_time' => now()->addDays(2),
            'end_time' => now()->addDays(5),
            'prize_coins' => 400,
            'prize_xp' => 800,
            'min_level' => 1,
            'status' => 'upcoming',
        ]);
    }
}
