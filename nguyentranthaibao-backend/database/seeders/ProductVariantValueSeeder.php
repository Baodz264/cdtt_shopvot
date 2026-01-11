<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductVariantValueSeeder extends Seeder
{
    public function run(): void
    {
        $variants = DB::table('product_variant')->get();

        $values = [];

        foreach ($variants as $variant) {

            // ===== TRỌNG LƯỢNG =====
            if ($variant->name === 'Trọng lượng') {

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => '3U (85-89g)',
                    'extra_price' => 0,
                    'stock' => 10,
                    'thumbnail' => null,
                ];

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => '4U (80-84g)',
                    'extra_price' => -100000,
                    'stock' => 10,
                    'thumbnail' => null,
                ];

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => '5U (75-79g)',
                    'extra_price' => -200000,
                    'stock' => 5,
                    'thumbnail' => null,
                ];
            }

            // ===== ĐỘ CỨNG =====
            if ($variant->name === 'Độ cứng thân vợt') {

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => 'Mềm',
                    'extra_price' => 0,
                    'stock' => 15,
                    'thumbnail' => null,
                ];

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => 'Trung bình',
                    'extra_price' => 0,
                    'stock' => 15,
                    'thumbnail' => null,
                ];

                $values[] = [
                    'variant_id' => $variant->id,
                    'value' => 'Cứng',
                    'extra_price' => 100000,
                    'stock' => 10,
                    'thumbnail' => null,
                ];
            }
        }

        DB::table('product_variant_value')->insert($values);
    }
}
