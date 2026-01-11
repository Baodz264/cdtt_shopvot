<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('import')->insert([
            [
                'user_id' => 1, // Admin
                'note' => 'Nhập kho vợt Yonex & Lining tháng 12',
                'created_at' => now(),
            ],
            [
                'user_id' => 1,
                'note' => 'Nhập bổ sung hàng bán chạy',
                'created_at' => now(),
            ],
        ]);
    }
}
