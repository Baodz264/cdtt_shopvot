<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('menu')->insert([
            // Menu chính
            [
                'name' => 'Trang chủ',
                'link' => '/',
                'type' => 'custom',
                'parent_id' => null,
                'position' => 'mainmenu',
                'status' => 1,
            ],
            [
                'name' => 'Sản phẩm',
                'link' => '/san-pham',
                'type' => 'category',
                'parent_id' => null,
                'position' => 'mainmenu',
                'status' => 1,
            ],
            [
                'name' => 'Thương hiệu',
                'link' => '/thuong-hieu',
                'type' => 'custom',
                'parent_id' => null,
                'position' => 'mainmenu',
                'status' => 1,
            ],
            [
                'name' => 'Tin tức',
                'link' => '/tin-tuc',
                'type' => 'topic',
                'parent_id' => null,
                'position' => 'mainmenu',
                'status' => 1,
            ],
            [
                'name' => 'Liên hệ',
                'link' => '/lien-he',
                'type' => 'custom',
                'parent_id' => null,
                'position' => 'mainmenu',
                'status' => 1,
            ],

            // Sub menu
            [
                'name' => 'Vợt cầu lông công',
                'link' => '/category/vot-cau-long-cong',
                'type' => 'category',
                'parent_id' => 2,
                'position' => 'mainmenu',
                'status' => 1,
            ],
            [
                'name' => 'Vợt cầu lông thủ',
                'link' => '/category/vot-cau-long-thu',
                'type' => 'category',
                'parent_id' => 2,
                'position' => 'mainmenu',
                'status' => 1,
            ],
        ]);
    }
}
