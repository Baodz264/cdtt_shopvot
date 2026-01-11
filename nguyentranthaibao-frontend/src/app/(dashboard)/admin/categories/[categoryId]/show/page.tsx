"use client";

export default function ShowCategory() {
  const category = {
    id: 1,
    name: "Giày thể thao",
    slug: "giay-the-thao",
    image: "/no-image.jpg",
    status: 1,
    created_at: "2025-01-01",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chi Tiết Danh Mục</h1>

      <p><b>ID:</b> {category.id}</p>
      <p><b>Tên:</b> {category.name}</p>
      <p><b>Slug:</b> {category.slug}</p>
      <p><b>Trạng thái:</b> {category.status ? "Hiển thị" : "Ẩn"}</p>

      <img src={category.image} className="w-32 h-32 object-cover my-4" />

      <p><b>Ngày tạo:</b> {category.created_at}</p>
    </div>
  );
}
