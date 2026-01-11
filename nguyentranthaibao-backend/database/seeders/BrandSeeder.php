<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Yonex', 'image' => 'yonex.png'],
            ['name' => 'Lining', 'image' => 'lining.png'],
            ['name' => 'Victor', 'image' => 'victor.png'],
            ['name' => 'Mizuno', 'image' => 'mizuno.png'],
            ['name' => 'Apacs', 'image' => 'apacs.png'],
            ['name' => 'Fleet', 'image' => 'fleet.png'],
            ['name' => 'Kumpoo', 'image' => 'kumpoo.png'],
        ];

        foreach ($brands as $brand) {
            DB::table('brand')->insert([
                'name' => $brand['name'],
                'slug' => Str::slug($brand['name']),
                'image' => $brand['image'],
                'status' => 1,
                'created_at' => now(),
            ]);
        }
    }
}
