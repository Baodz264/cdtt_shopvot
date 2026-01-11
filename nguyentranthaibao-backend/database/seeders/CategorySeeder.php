<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Vợt cầu lông công', 'image' => 'attack.png'],
            ['name' => 'Vợt cầu lông thủ', 'image' => 'defense.png'],
            ['name' => 'Vợt cầu lông cân bằng', 'image' => 'balance.png'],
            ['name' => 'Vợt cho người mới chơi', 'image' => 'beginner.png'],
            ['name' => 'Vợt cho đánh đơn', 'image' => 'single.png'],
            ['name' => 'Vợt cho đánh đôi', 'image' => 'double.png'],
            ['name' => 'Vợt chuyên nghiệp', 'image' => 'pro.png'],
        ];

        foreach ($categories as $category) {
            DB::table('category')->insert([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'image' => $category['image'],
                'status' => 1,
                'created_at' => now(),
            ]);
        }
    }
}
