<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportItemSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('import_item')->insert([
            // Phiếu nhập 1
            [
                'import_id' => 1,
                'product_id' => 1, // Yonex Astrox 100ZZ
                'quantity' => 10,
                'price' => 3500000,
            ],
            [
                'import_id' => 1,
                'product_id' => 2, // Lining Aeronaut 9000
                'quantity' => 8,
                'price' => 3000000,
            ],

            // Phiếu nhập 2
            [
                'import_id' => 2,
                'product_id' => 1,
                'quantity' => 5,
                'price' => 3400000,
            ],
        ]);
    }
}
