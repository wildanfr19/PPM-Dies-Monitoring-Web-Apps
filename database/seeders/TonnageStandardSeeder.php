<?php

namespace Database\Seeders;

use App\Models\TonnageStandard;
use Illuminate\Database\Seeder;

class TonnageStandardSeeder extends Seeder
{
    public function run(): void
    {
        $standards = [
            [
                'tonnage' => '1200T',
                'grade' => 'A',
                'type' => 'Progressive',
                'standard_stroke' => 5000,
                'lot_size' => 2500,
                'description' => '1200 Ton Press - Grade A',
            ],
            [
                'tonnage' => '800T',
                'grade' => 'B',
                'type' => 'Tandem',
                'standard_stroke' => 6000,
                'lot_size' => 2500,
                'description' => '800 Ton Press - Grade B',
            ],
            [
                'tonnage' => '250T',
                'grade' => 'C',
                'type' => 'Progressive',
                'standard_stroke' => 10000,
                'lot_size' => 2500,
                'description' => '250 Ton Press - Grade C (Progressive)',
            ],
            [
                'tonnage' => '250T',
                'grade' => 'C',
                'type' => 'Tandem',
                'standard_stroke' => 7000,
                'lot_size' => 2500,
                'description' => '250 Ton Press - Grade C (Tandem)',
            ],
        ];

        foreach ($standards as $standard) {
            TonnageStandard::create($standard);
        }
    }
}
