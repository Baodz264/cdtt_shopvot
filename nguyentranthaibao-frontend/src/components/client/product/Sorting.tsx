"use client";

import { Select } from "antd";

interface SortingProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function Sorting({ value, onChange }: SortingProps) {
  return (
    <Select
      placeholder="Sắp xếp"
      style={{ width: 220 }}
      value={value}
      onChange={onChange}
      allowClear
    >
      {/* 🔥 Thêm tùy chọn hiển thị tất cả sản phẩm */}
      <Select.Option value="">Tất cả sản phẩm</Select.Option>

      <Select.Option value="created_at_desc">Mới nhất → Cũ nhất</Select.Option>
      <Select.Option value="created_at_asc">Cũ nhất → Mới nhất</Select.Option>
      <Select.Option value="price_asc">Giá thấp → Giá cao</Select.Option>
      <Select.Option value="price_desc">Giá cao → Giá thấp</Select.Option>
      <Select.Option value="sale_price_desc">Giảm giá nhiều nhất</Select.Option>
      <Select.Option value="views_desc">Xem nhiều / Bán chạy nhất</Select.Option>
    </Select>
  );
}
