<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('post')->insert([
            [
                'topic_id' => 1, // Tin tức cầu lông
                'user_id' => 1,  // Admin
                'title' => 'Yonex ra mắt dòng vợt Astrox mới 2025',
                'slug' => Str::slug('Yonex ra mắt dòng vợt Astrox mới 2025'),
                'excerpt' => 'Yonex chính thức giới thiệu dòng vợt Astrox mới với nhiều cải tiến vượt trội.',
                'content' => 'Dòng vợt Yonex Astrox mới năm 2025 được nâng cấp về công nghệ trục và khung, giúp tăng sức mạnh smash và kiểm soát cầu tốt hơn.',
                'image' => 'post-astrox-2025.jpg',
                'type' => 'post',
                'status' => 1,
                'views' => 120,
                'seo_title' => 'Yonex Astrox 2025 – Dòng vợt cầu lông mới nhất',
                'seo_description' => 'Thông tin chi tiết về dòng vợt Yonex Astrox mới ra mắt năm 2025.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'topic_id' => 2, // Hướng dẫn chọn vợt
                'user_id' => 1,
                'title' => 'Cách chọn vợt cầu lông phù hợp cho người mới chơi',
                'slug' => Str::slug('Cách chọn vợt cầu lông phù hợp cho người mới chơi'),
                'excerpt' => 'Hướng dẫn chi tiết cách chọn vợt cầu lông cho người mới bắt đầu.',
                'content' => 'Người mới chơi nên chọn vợt có trọng lượng nhẹ, thân dẻo và điểm cân bằng trung bình để dễ làm quen và hạn chế chấn thương.',
                'image' => 'chon-vot-cau-long.jpg',
                'type' => 'post',
                'status' => 1,
                'views' => 340,
                'seo_title' => 'Hướng dẫn chọn vợt cầu lông cho người mới',
                'seo_description' => 'Bí quyết chọn vợt cầu lông phù hợp cho người mới chơi.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'topic_id' => 4, // Đánh giá vợt
                'user_id' => 1,
                'title' => 'Đánh giá chi tiết vợt Lining Aeronaut 9000',
                'slug' => Str::slug('Đánh giá chi tiết vợt Lining Aeronaut 9000'),
                'excerpt' => 'Review chi tiết ưu nhược điểm của vợt Lining Aeronaut 9000.',
                'content' => 'Lining Aeronaut 9000 là mẫu vợt cân bằng, phù hợp đánh đôi, cho cảm giác cầu tốt và phản tay nhanh.',
                'image' => 'review-aeronaut-9000.jpg',
                'type' => 'post',
                'status' => 1,
                'views' => 210,
                'seo_title' => 'Review vợt Lining Aeronaut 9000',
                'seo_description' => 'Đánh giá chi tiết vợt cầu lông Lining Aeronaut 9000.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'topic_id' => null,
                'user_id' => 1,
                'title' => 'Giới thiệu Shop Vợt Cầu Lông Pro',
                'slug' => Str::slug('Giới thiệu Shop Vợt Cầu Lông Pro'),
                'excerpt' => 'Thông tin giới thiệu về shop vợt cầu lông.',
                'content' => 'Shop Vợt Cầu Lông Pro chuyên cung cấp vợt cầu lông chính hãng, uy tín, bảo hành đầy đủ.',
                'image' => 'gioi-thieu-shop.jpg',
                'type' => 'page',
                'status' => 1,
                'views' => 50,
                'seo_title' => 'Giới thiệu Shop Vợt Cầu Lông Pro',
                'seo_description' => 'Thông tin về shop bán vợt cầu lông chính hãng.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
