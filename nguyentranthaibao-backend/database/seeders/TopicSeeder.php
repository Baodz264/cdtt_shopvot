<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TopicSeeder extends Seeder
{
    public function run(): void
    {
        $topics = [
            'Tin tức cầu lông',
            'Hướng dẫn chọn vợt',
            'Kinh nghiệm chơi cầu lông',
            'Đánh giá vợt cầu lông',
            'Khuyến mãi & ưu đãi',
        ];

        foreach ($topics as $topic) {
            DB::table('topic')->insert([
                'name' => $topic,
                'slug' => Str::slug($topic),
                'status' => 1,
            ]);
        }
    }
}
