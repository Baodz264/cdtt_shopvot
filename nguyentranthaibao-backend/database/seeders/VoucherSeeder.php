<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('voucher')->insert([
            // ====== % GIẢM ======
            [
                'code' => 'VOT5',
                'name' => 'Giảm 5% đơn hàng',
                'type' => 'percent',
                'discount_value' => 5,
                'max_discount' => 100000,
                'min_order' => 500000,
                'quantity' => 200,
                'used' => 0,
                'start_date' => now()->subDays(3),
                'end_date' => now()->addDays(20),
                'status' => 1,
                'created_at' => now(),
            ],
            [
                'code' => 'VOT10',
                'name' => 'Giảm 10% đơn hàng',
                'type' => 'percent',
                'discount_value' => 10,
                'max_discount' => 300000,
                'min_order' => 1000000,
                'quantity' => 100,
                'used' => 0,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(30),
                'status' => 1,
                'created_at' => now(),
            ],
            [
                'code' => 'VOT20',
                'name' => 'Giảm 20% tối đa 500k',
                'type' => 'percent',
                'discount_value' => 20,
                'max_discount' => 500000,
                'min_order' => 3000000,
                'quantity' => 50,
                'used' => 0,
                'start_date' => now(),
                'end_date' => now()->addDays(10),
                'status' => 1,
                'created_at' => now(),
            ],

            // ====== GIẢM TIỀN MẶT ======
            [
                'code' => 'GIAM50K',
                'name' => 'Giảm 50.000đ',
                'type' => 'fixed',
                'discount_value' => 50000,
                'max_discount' => null,
                'min_order' => 300000,
                'quantity' => 300,
                'used' => 0,
                'start_date' => now()->subDays(1),
                'end_date' => now()->addDays(15),
                'status' => 1,
                'created_at' => now(),
            ],
            [
                'code' => 'GIAM100K',
                'name' => 'Giảm 100.000đ',
                'type' => 'fixed',
                'discount_value' => 100000,
                'max_discount' => null,
                'min_order' => 800000,
                'quantity' => 150,
                'used' => 0,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(20),
                'status' => 1,
                'created_at' => now(),
            ],
            [
                'code' => 'GIAM200K',
                'name' => 'Giảm 200.000đ',
                'type' => 'fixed',
                'discount_value' => 200000,
                'max_discount' => null,
                'min_order' => 2000000,
                'quantity' => 50,
                'used' => 0,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(15),
                'status' => 1,
                'created_at' => now(),
            ],

            // ====== VOUCHER TEST TRẠNG THÁI ======
            [
                'code' => 'HETHAN',
                'name' => 'Voucher đã hết hạn',
                'type' => 'fixed',
                'discount_value' => 100000,
                'max_discount' => null,
                'min_order' => 500000,
                'quantity' => 0,
                'used' => 50,
                'start_date' => now()->subDays(30),
                'end_date' => now()->subDays(1),
                'status' => 0,
                'created_at' => now(),
            ],
        ]);
    }
}
