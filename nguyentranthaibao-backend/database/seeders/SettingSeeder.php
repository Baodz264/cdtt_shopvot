<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('setting')->insert([
            'name' => 'Shop Vợt Cầu Lông Pro',
            'email' => 'support@votcaulongpro.vn',
            'phone' => '0909 888 999',
            'hotline' => '1900 9999',
            'address' => '123 Nguyễn Trãi, Quận 5, TP.HCM',
            'logo' => 'logo-shop.png',
            'updated_at' => now(),
        ]);
    }
}
