"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

type MenuType = "category" | "topic" | "post" | "custom";
type PositionType = "top" | "middle" | "bottom";

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const { menuId } = params as { menuId: string };

  // Khởi tạo state trực tiếp từ menuId
  const [menu, setMenu] = useState({
    name: `Menu ${menuId}`,
    link: "/example",
    type: "custom" as MenuType,
    position: "top" as PositionType,
    status: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cập nhật menu thành công: ${menu.name}`);
    router.push("/admin/menu");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sửa Menu</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {/* Tên Menu */}
        <div>
          <label className="block mb-1">Tên Menu</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={menu.name}
            onChange={(e) => setMenu({ ...menu, name: e.target.value })}
            required
          />
        </div>

        {/* Link */}
        <div>
          <label className="block mb-1">Link</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={menu.link}
            onChange={(e) => setMenu({ ...menu, link: e.target.value })}
          />
        </div>

        {/* Loại */}
        <div>
          <label className="block mb-1">Loại</label>
          <select
            className="w-full border p-2 rounded"
            value={menu.type}
            onChange={(e) =>
              setMenu({ ...menu, type: e.target.value as MenuType })
            }
          >
            <option value="category">Category</option>
            <option value="topic">Topic</option>
            <option value="post">Post</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Vị trí */}
        <div>
          <label className="block mb-1">Vị trí</label>
          <select
            className="w-full border p-2 rounded"
            value={menu.position}
            onChange={(e) =>
              setMenu({ ...menu, position: e.target.value as PositionType })
            }
          >
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block mb-1">Trạng thái</label>
          <select
            className="w-full border p-2 rounded"
            value={menu.status}
            onChange={(e) =>
              setMenu({ ...menu, status: Number(e.target.value) })
            }
          >
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Cập nhật Menu
        </button>
      </form>
    </div>
  );
}
