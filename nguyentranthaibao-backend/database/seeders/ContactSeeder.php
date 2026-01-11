<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('contact')->insert([
            [
                'fullname' => 'Nguyễn Văn A',
                'email' => 'nguyenvana@gmail.com',
                'phone' => '0912345678',
                'message' => 'Shop cho mình hỏi vợt Yonex Astrox 100ZZ còn hàng không?',
                'reply' => null,
                'status' => 0,
                'created_at' => now(),
            ],
            [
                'fullname' => 'Trần Thị B',
                'email' => 'tranthib@gmail.com',
                'phone' => '0987654321',
                'message' => 'Shop tư vấn giúp mình vợt cầu lông cho người mới chơi.',
                'reply' => 'Shop đã liên hệ tư vấn qua điện thoại. Cảm ơn bạn!',
                'status' => 1,
                'created_at' => now(),
            ],
        ]);
    }
}
