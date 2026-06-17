<?php

namespace Database\Seeders;

use App\Models\StoreItem;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Avatars
            [
                'name' => 'البطل الشجاع',
                'type' => 'avatar',
                'description' => 'أفاتار خاص للأبطال المتفوقين في الرياضيات',
                'price' => 500,
                'image_url' => '🦁',
            ],
            [
                'name' => 'العقل المفكر',
                'type' => 'avatar',
                'description' => 'لأولئك الذين يفكرون خارج الصندوق',
                'price' => 300,
                'image_url' => '🧠',
            ],
            [
                'name' => 'النينجا الرياضي',
                'type' => 'avatar',
                'description' => 'سريع ودقيق في حل المسائل المعقدة',
                'price' => 1000,
                'image_url' => '🥷',
            ],
            // Themes
            [
                'name' => 'المحيط الهادئ',
                'type' => 'theme',
                'description' => 'ثيم أزرق هادئ يريح الأعصاب أثناء الدراسة',
                'price' => 1500,
                'metadata' => ['primary' => '#0ea5e9', 'secondary' => '#0c4a6e'],
            ],
            [
                'name' => 'الفضاء العميق',
                'type' => 'theme',
                'description' => 'ثيم داكن مع لمسات أرجوانية ساحرة',
                'price' => 2000,
                'metadata' => ['primary' => '#8b5cf6', 'secondary' => '#2e1065'],
            ],
            // Banners
            [
                'name' => 'شريط النصر',
                'type' => 'banner',
                'description' => 'شريط ذهبي يظهر في ملفك الشخصي',
                'price' => 250,
                'image_url' => '🏆',
            ],
        ];

        foreach ($items as $item) {
            StoreItem::create($item);
        }
    }
}
