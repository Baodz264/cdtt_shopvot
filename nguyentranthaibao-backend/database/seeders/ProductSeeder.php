<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ===== 1–4 YONEX =====
            ['brand_id'=>1,'category_id'=>1,'name'=>'Yonex Astrox 100ZZ','price'=>4200000,'sale_price'=>3990000,'sku'=>'YONEX-100ZZ','stock'=>20,'thumbnail'=>'astrox-100zz.png','description'=>'Vợt thiên công cao cấp','detail'=>'Dành cho VĐV chuyên nghiệp'],
            ['brand_id'=>1,'category_id'=>2,'name'=>'Yonex Duora Z-Strike','price'=>3900000,'sale_price'=>null,'sku'=>'YONEX-DZ','stock'=>15,'thumbnail'=>'duora-z.png','description'=>'Vợt công thủ toàn diện','detail'=>'Hai mặt khung độc đáo'],
            ['brand_id'=>1,'category_id'=>3,'name'=>'Yonex Arcsaber 11 Pro','price'=>3600000,'sale_price'=>3390000,'sku'=>'YONEX-ARC11','stock'=>18,'thumbnail'=>'arc11.png','description'=>'Vợt cân bằng','detail'=>'Kiểm soát cầu tốt'],
            ['brand_id'=>1,'category_id'=>5,'name'=>'Yonex Nanoflare 800','price'=>3500000,'sale_price'=>null,'sku'=>'YONEX-NF800','stock'=>14,'thumbnail'=>'nf800.png','description'=>'Vợt đánh đơn','detail'=>'Tốc độ cao'],

            // ===== 5–8 LINING =====
            ['brand_id'=>2,'category_id'=>1,'name'=>'Lining Turbo Charging 75','price'=>3200000,'sale_price'=>2990000,'sku'=>'LINING-TC75','stock'=>22,'thumbnail'=>'tc75.png','description'=>'Vợt thiên công','detail'=>'Đập cầu uy lực'],
            ['brand_id'=>2,'category_id'=>3,'name'=>'Lining Aeronaut 9000','price'=>3800000,'sale_price'=>null,'sku'=>'LINING-A9000','stock'=>15,'thumbnail'=>'a9000.png','description'=>'Vợt cân bằng','detail'=>'Kiểm soát tốt'],
            ['brand_id'=>2,'category_id'=>6,'name'=>'Lining Windstorm 72','price'=>2800000,'sale_price'=>2590000,'sku'=>'LINING-WS72','stock'=>25,'thumbnail'=>'ws72.png','description'=>'Vợt đánh đôi','detail'=>'Nhẹ và nhanh'],
            ['brand_id'=>2,'category_id'=>7,'name'=>'Lining BladeX 800','price'=>4100000,'sale_price'=>null,'sku'=>'LINING-BX800','stock'=>10,'thumbnail'=>'bladex800.png','description'=>'Vợt chuyên nghiệp','detail'=>'Khung mỏng'],

            // ===== 9–12 VICTOR =====
            ['brand_id'=>3,'category_id'=>1,'name'=>'Victor Thruster Ryuga','price'=>3700000,'sale_price'=>3490000,'sku'=>'VICTOR-RYUGA','stock'=>16,'thumbnail'=>'ryuga.png','description'=>'Vợt thiên công','detail'=>'Smash mạnh'],
            ['brand_id'=>3,'category_id'=>2,'name'=>'Victor DriveX 9X','price'=>3500000,'sale_price'=>null,'sku'=>'VICTOR-DX9X','stock'=>18,'thumbnail'=>'dx9x.png','description'=>'Vợt công thủ','detail'=>'Phản tay nhanh'],
            ['brand_id'=>3,'category_id'=>5,'name'=>'Victor Jetspeed S12','price'=>3300000,'sale_price'=>null,'sku'=>'VICTOR-JS12','stock'=>14,'thumbnail'=>'js12.png','description'=>'Vợt đánh đơn','detail'=>'Tốc độ cao'],
            ['brand_id'=>3,'category_id'=>6,'name'=>'Victor Auraspeed 90S','price'=>3400000,'sale_price'=>3190000,'sku'=>'VICTOR-AS90','stock'=>12,'thumbnail'=>'as90.png','description'=>'Vợt đánh đôi','detail'=>'Cầu nhanh'],

            // ===== 13–15 MIZUNO =====
            ['brand_id'=>4,'category_id'=>3,'name'=>'Mizuno Altius 01 Feel','price'=>2800000,'sale_price'=>2590000,'sku'=>'MIZUNO-A01','stock'=>20,'thumbnail'=>'altius01.png','description'=>'Vợt cân bằng','detail'=>'Dễ chơi'],
            ['brand_id'=>4,'category_id'=>4,'name'=>'Mizuno JPX Beginner','price'=>1900000,'sale_price'=>null,'sku'=>'MIZUNO-JPXB','stock'=>30,'thumbnail'=>'jpxb.png','description'=>'Vợt cho người mới','detail'=>'Trợ lực tốt'],
            ['brand_id'=>4,'category_id'=>6,'name'=>'Mizuno Fortius 11','price'=>3600000,'sale_price'=>null,'sku'=>'MIZUNO-F11','stock'=>11,'thumbnail'=>'fortius11.png','description'=>'Vợt đánh đôi','detail'=>'Ổn định cao'],

            // ===== 16–17 APACS =====
            ['brand_id'=>5,'category_id'=>1,'name'=>'Apacs Z-Ziggler','price'=>1500000,'sale_price'=>1390000,'sku'=>'APACS-ZZ','stock'=>40,'thumbnail'=>'zziggler.png','description'=>'Vợt giá rẻ thiên công','detail'=>'Phong trào'],
            ['brand_id'=>5,'category_id'=>4,'name'=>'Apacs Nano Fusion Speed','price'=>1200000,'sale_price'=>null,'sku'=>'APACS-NFS','stock'=>35,'thumbnail'=>'nfs.png','description'=>'Vợt người mới','detail'=>'Nhẹ dễ đánh'],

            // ===== 18 FLEET =====
            ['brand_id'=>6,'category_id'=>5,'name'=>'Fleet Woven 1000','price'=>2100000,'sale_price'=>null,'sku'=>'FLEET-W1000','stock'=>18,'thumbnail'=>'woven1000.png','description'=>'Vợt đánh đơn','detail'=>'Ổn định'],

            // ===== 19–20 KUMPOO =====
            ['brand_id'=>7,'category_id'=>6,'name'=>'Kumpoo Power Control','price'=>1600000,'sale_price'=>1490000,'sku'=>'KUMPOO-PC','stock'=>22,'thumbnail'=>'pc.png','description'=>'Vợt đánh đôi','detail'=>'Nhanh'],
            ['brand_id'=>7,'category_id'=>4,'name'=>'Kumpoo Beginner 700','price'=>1100000,'sale_price'=>null,'sku'=>'KUMPOO-B700','stock'=>45,'thumbnail'=>'b700.png','description'=>'Vợt người mới','detail'=>'Dễ làm quen'],
        ];

        foreach ($products as $p) {
            DB::table('product')->insert([
                'brand_id' => $p['brand_id'],
                'category_id' => $p['category_id'],
                'name' => $p['name'],
                'slug' => Str::slug($p['name']),
                'price' => $p['price'],
                'sale_price' => $p['sale_price'],
                'sku' => $p['sku'],
                'stock' => $p['stock'],
                'thumbnail' => $p['thumbnail'],
                'description' => $p['description'],
                'detail' => $p['detail'],
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
