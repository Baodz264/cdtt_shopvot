<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductSaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Giả sử bạn muốn giảm giá cho các sản phẩm có sale_price khác null
        $productsOnSale = DB::table('product')
            ->whereNotNull('sale_price')
            ->get(['id', 'sale_price']);

        foreach ($productsOnSale as $product) {
            // Kiểm tra nếu product_id chưa có trong product_sale
            $exists = DB::table('product_sale')->where('product_id', $product->id)->exists();
            if (!$exists) {
                DB::table('product_sale')->insert([
                    'product_id' => $product->id,
                    'sale_price' => $product->sale_price,
                    'start_date' => Carbon::now()->toDateString(),
                    'end_date' => Carbon::now()->addDays(30)->toDateString(), // giảm giá 30 ngày
                    'created_at' => now(),
                ]);
            }
        }
    }
}
