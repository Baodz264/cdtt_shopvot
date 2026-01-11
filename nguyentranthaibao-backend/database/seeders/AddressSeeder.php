<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('address')->insert([
            // Địa chỉ mặc định - User 1
            [
                'user_id' => 1,
                'fullname' => 'Nguyễn Văn A',
                'phone' => '0912345678',
                'address_line' => '123 Nguyễn Trãi',
                'city' => 'TP. Hồ Chí Minh',
                'district' => 'Quận 5',
                'ward' => 'Phường 7',
                'type' => 'shipping',
                'is_default' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Địa chỉ phụ - User 1
            [
                'user_id' => 1,
                'fullname' => 'Nguyễn Văn A',
                'phone' => '0912345678',
                'address_line' => '45 Lê Lợi',
                'city' => 'TP. Hồ Chí Minh',
                'district' => 'Quận 1',
                'ward' => 'Phường Bến Nghé',
                'type' => 'shipping',
                'is_default' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Địa chỉ User 2
            [
                'user_id' => 2,
                'fullname' => 'Trần Thị B',
                'phone' => '0987654321',
                'address_line' => '89 Trần Phú',
                'city' => 'Hà Nội',
                'district' => 'Quận Ba Đình',
                'ward' => 'Phường Kim Mã',
                'type' => 'billing',
                'is_default' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
