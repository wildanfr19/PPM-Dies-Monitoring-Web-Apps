<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['code' => 'HMMI', 'name' => 'Honda Motor Manufacturing Indonesia'],
            ['code' => 'ATS', 'name' => 'Astra Toyota Motor'],
            ['code' => 'UPIN', 'name' => 'UPIN Manufacturing'],
            ['code' => 'G-TIM', 'name' => 'G-TIM Industries'],
            ['code' => 'SIM', 'name' => 'Suzuki Indomobil Motor'],
            ['code' => 'TMMIN', 'name' => 'Toyota Motor Manufacturing Indonesia'],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
