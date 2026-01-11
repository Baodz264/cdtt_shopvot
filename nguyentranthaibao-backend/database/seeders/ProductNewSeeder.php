<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductNewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy các product_id từ bảng product (ví dụ sản phẩm mới nhất)
        $productIds = DB::table('product')->pluck('id');

        foreach ($productIds as $productId) {
            // Kiểm tra nếu product_id chưa tồn tại trong product_new
            $exists = DB::table('product_new')->where('product_id', $productId)->exists();
            if (!$exists) {
                DB::table('product_new')->insert([
                    'product_id' => $productId,
                    'created_at' => now(),
                ]);
            }
        }
    }
}
