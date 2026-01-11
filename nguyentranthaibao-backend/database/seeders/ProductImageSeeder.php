<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $images = [
            // Sản phẩm 1 - Yonex Astrox 99
            ['product_id' => 1, 'image' => 'yonex_astrox_99_1.png', 'is_default' => 1],
            ['product_id' => 1, 'image' => 'yonex_astrox_99_2.png', 'is_default' => 0],

            // Sản phẩm 2 - Victor Thruster K 9000
            ['product_id' => 2, 'image' => 'victor_thruster_k9000_1.png', 'is_default' => 1],
            ['product_id' => 2, 'image' => 'victor_thruster_k9000_2.png', 'is_default' => 0],

            // Sản phẩm 3 - Li-Ning Turbo Charging 75
            ['product_id' => 3, 'image' => 'lining_turbo_charging_75_1.png', 'is_default' => 1],

            // Sản phẩm 4 - Babolat Pure Drive
            ['product_id' => 4, 'image' => 'babolat_pure_drive_1.png', 'is_default' => 1],
            ['product_id' => 4, 'image' => 'babolat_pure_drive_2.png', 'is_default' => 0],

            // Sản phẩm 5 - Carlton Kinesis X90
            ['product_id' => 5, 'image' => 'carlton_kinesis_x90_1.png', 'is_default' => 1],
        ];

        foreach ($images as $img) {
            DB::table('product_image')->insert($img);
        }
    }
}
