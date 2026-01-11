"use client";

type Brand = {
  id: number;
  name: string;
  slug: string;
  image: string;
  status: number;
  created_at: string;
};

const brand: Brand = {
  id: 1,
  name: "Apple",
  slug: "apple",
  image: "/images/apple.png",
  status: 1,
  created_at: "2025-11-23 14:00:00"
};

export default function ShowBrandPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi tiết Brand</h1>
      <div className="space-y-2">
        <p><strong>ID:</strong> {brand.id}</p>
        <p><strong>Tên:</strong> {brand.name}</p>
        <p><strong>Slug:</strong> {brand.slug}</p>
        <p><strong>Trạng thái:</strong> {brand.status ? "Hiện" : "Ẩn"}</p>
        <p><strong>Ngày tạo:</strong> {brand.created_at}</p>
        <p><strong>Ảnh:</strong></p>
        <img src={brand.image} alt={brand.name} className="w-32 h-32 object-cover"/>
      </div>
    </div>
  );
}
