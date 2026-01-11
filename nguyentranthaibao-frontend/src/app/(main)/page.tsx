"use client";

import { useEffect, useState } from "react";
import BannerSlider from "@/components/client/home/BannerSlider";
import PostSection from "@/components/client/home/PostSection";
import CategorySection from "@/components/client/home/CategorySection";
import BannerService, { Banner } from "@/services/BannerService";
import ProductSale from "@/components/client/home/ProductSale";
import ProductNew from "@/components/client/home/ProductNew";

export default function HomePage() {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await BannerService.list({ status: 1 });
        setBanners(res.data.map((b: Banner) => b.image));
      } catch (err) {
        console.error("Lỗi lấy banner:", err);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="space-y-16 pb-12 bg-gray-50">
      {/* Banner */}
      {banners.length > 0 && (
        <div className="container mx-auto px-4 pt-6">
          <BannerSlider
            banners={banners}
            currentBanner={currentBanner}
            onChange={setCurrentBanner}
          />
        </div>
      )}

      {/* Category */}
      <CategorySection onSelect={() => {}} />

      {/* Sale */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-red-600 mb-8">
          GIÁ SỐC HÔM NAY
        </h2>
        <ProductSale />
      </section>

      {/* New Product */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-black text-emerald-700 mb-8">
          HÀNG MỚI VỀ
        </h2>
        <ProductNew />
      </section>

      {/* Post */}
      <PostSection title="Bài viết mới" type="post" />
    </div>
  );
}
