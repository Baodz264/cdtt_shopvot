"use client";
import { useEffect, useState } from "react";
import { Checkbox, Slider, Divider } from "antd";
import CategoryService, { Category } from "@/services/CategoryService";
import BrandService, { Brand } from "@/services/BrandService";

export interface ProductFilters {
  category_id: number[];
  brand_id: number[];
  price_from: number;
  price_to: number;
  status: string[]; // ["Mới", "Giảm giá", "Hết hàng"]
}

interface FiltersProps {
  onChange: (filters: ProductFilters) => void;
}

export default function Filters({ onChange }: FiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [status, setStatus] = useState<string[]>([]);

  useEffect(() => {
    CategoryService.list().then((res) => setCategories(res.data));
    BrandService.list().then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    onChange({
      category_id: selectedCategories,
      brand_id: selectedBrands,
      price_from: priceRange[0],
      price_to: priceRange[1],
      status,
    });
  }, [selectedCategories, selectedBrands, priceRange, status]);

  return (
    <div className="p-4 border rounded bg-white space-y-4 shadow-sm">
      <div>
        <h3 className="font-bold mb-3">Danh mục</h3>
        <Checkbox.Group
          className="flex flex-col gap-2"
          value={selectedCategories}
          onChange={(v) => setSelectedCategories(v as number[])}
        >
          {categories.map((cat) => (
            <Checkbox key={cat.id} value={cat.id}>{cat.name}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Divider className="my-2" />

      <div>
        <h3 className="font-bold mb-3">Thương hiệu</h3>
        <Checkbox.Group
          className="flex flex-col gap-2"
          value={selectedBrands}
          onChange={(v) => setSelectedBrands(v as number[])}
        >
          {brands.map((b) => (
            <Checkbox key={b.id} value={b.id}>{b.name}</Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Divider className="my-2" />

      <div>
        <h3 className="font-bold mb-3">Tình trạng</h3>
        <Checkbox.Group
          className="flex flex-col gap-2"
          value={status}
          onChange={(v) => setStatus(v as string[])}
        >
          <Checkbox value="Mới">Sản phẩm mới</Checkbox>
          <Checkbox value="Giảm giá">Đang giảm giá</Checkbox>
          <Checkbox value="Hết hàng">Hết hàng</Checkbox>
        </Checkbox.Group>
      </div>

      <Divider className="my-2" />

      <div>
        <h3 className="font-bold mb-3">Khoảng giá</h3>
        <Slider
          range
          min={0}
          max={50000000}
          step={100000}
          value={priceRange}
          onChange={(v) => setPriceRange(v as [number, number])}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>{priceRange[0].toLocaleString()}₫</span>
          <span>{priceRange[1].toLocaleString()}₫</span>
        </div>
      </div>
    </div>
  );
}