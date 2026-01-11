<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('review')->insert([
            // Review cho Yonex Astrox 100ZZ
            [
                'user_id' => 2, // Nguyễn Văn A
                'product_id' => 1,
                'rating' => 5,
                'content' => 'Vợt đánh rất đầm tay, smash cực tốt, đúng hàng chính hãng.',
                'status' => 'approved',
                'created_at' => now(),
            ],
            [
                'user_id' => 3, // Trần Thị B
                'product_id' => 1,
                'rating' => 4,
                'content' => 'Vợt tốt nhưng hơi nặng với người mới chơi.',
                'status' => 'approved',
                'created_at' => now(),
            ],

            // Review cho Lining Aeronaut 9000
            [
                'user_id' => 2,
                'product_id' => 2,
                'rating' => 5,
                'content' => 'Kiểm soát cầu rất tốt, đánh đôi phản tay nhanh.',
                'status' => 'pending',
                'created_at' => now(),
            ],
            [
                'user_id' => 3,
                'product_id' => 2,
                'rating' => 3,
                'content' => 'Vợt ổn trong tầm giá nhưng chưa thật sự nổi bật.',
                'status' => 'rejected',
                'created_at' => now(),
            ],
        ]);
    }
}
