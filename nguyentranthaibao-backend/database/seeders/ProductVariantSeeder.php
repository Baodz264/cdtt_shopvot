<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $variants = [];

        for ($productId = 7; $productId <= 26; $productId++) {
            $variants[] = [
                'product_id' => $productId,
                'name' => 'Trọng lượng',
            ];

            $variants[] = [
                'product_id' => $productId,
                'name' => 'Độ cứng thân vợt',
            ];
        }

        DB::table('product_variant')->insert($variants);
    }
}
