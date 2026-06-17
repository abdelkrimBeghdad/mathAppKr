<?php

namespace Database\Seeders;

use App\Models\SiteFeature;
use Illuminate\Database\Seeder;

class SiteFeatureSeeder extends Seeder
{
    public function run(): void
    {
        $features = [
            [
                'name' => 'challenges',
                'display_name_ar' => 'التحديات اليومية',
                'access_type' => 'classic',
                'price' => 0,
            ],
            [
                'name' => 'store',
                'display_name_ar' => 'المتجر',
                'access_type' => 'classic',
                'price' => 0,
            ],
            [
                'name' => 'arena',
                'display_name_ar' => 'ساحة المنافسة',
                'access_type' => 'premium',
                'price' => 200,
            ],
            [
                'name' => 'labs',
                'display_name_ar' => 'المختبرات التفاعلية',
                'access_type' => 'classic',
                'price' => 0,
            ],
        ];

        foreach ($features as $feature) {
            SiteFeature::updateOrCreate(['name' => $feature['name']], $feature);
        }
    }
}
