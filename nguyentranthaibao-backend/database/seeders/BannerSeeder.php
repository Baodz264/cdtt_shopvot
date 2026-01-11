<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('banner')->insert([
            [
                'name' => 'Banner vợt Yonex chính hãng',
                'link' => '/brand/yonex',
                'image' => 'banner-yonex.jpg',
                'position' => 'home_slider',
                'status' => 1,
            ],
            [
                'name' => 'Khuyến mãi vợt cầu lông',
                'link' => '/sale',
                'image' => 'banner-sale.jpg',
                'position' => 'home_slider',
                'status' => 1,
            ],
            [
                'name' => 'Phụ kiện cầu lông',
                'link' => '/category/phu-kien',
                'image' => 'banner-phu-kien.jpg',
                'position' => 'home_middle',
                'status' => 1,
            ],
        ]);
    }
}
