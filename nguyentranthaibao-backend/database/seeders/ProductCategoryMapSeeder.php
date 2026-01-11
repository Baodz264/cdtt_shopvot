<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategoryMapSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Giả sử các category đã có ID 1,2,3 tương ứng với:
        // 1 => Vợt cầu lông, 2 => Vợt tennis, 3 => Vợt bóng bàn
        // Và các product ID từ 1 trở đi theo ProductSeeder trước đó

        $mappings = [
            ['product_id' => 1, 'category_id' => 1], // Yonex Astrox 99 => Vợt cầu lông
            ['product_id' => 2, 'category_id' => 1], // Victor Thruster K 9000 => Vợt cầu lông
            ['product_id' => 3, 'category_id' => 1], // Li-Ning Turbo Charging 75 => Vợt cầu lông
            ['product_id' => 4, 'category_id' => 2], // Babolat Pure Drive => Vợt tennis
            ['product_id' => 5, 'category_id' => 1], // Carlton Kinesis X90 => Vợt cầu lông
        ];

        foreach ($mappings as $map) {
            DB::table('product_category_map')->insert($map);
        }
    }
}
