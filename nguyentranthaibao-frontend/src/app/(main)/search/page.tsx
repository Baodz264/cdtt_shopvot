"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductService, { ProductListParams } from "@/services/ProductService";
import { Spin } from "antd";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  thumbnail?: string;
}

interface Props {
  query?: string; // cho query mặc định undefined
  onSelect?: () => void;
}

export default function SearchDropdown({ query = "", onSelect }: Props) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu query rỗng hoặc chỉ có khoảng trắng thì clear kết quả
    if (!query || !query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const params: ProductListParams = { search: query, limit: 5, status: 1 };
        const res = await ProductService.list(params);
        setResults(res.data?.data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timeout);
  }, [query]);

  if (loading)
    return (
      <div className="flex justify-center py-6">
        <Spin />
      </div>
    );

  if (!results.length)
    return query.trim() ? (
      <div className="p-4 text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
    ) : null; // không hiện gì khi chưa nhập

  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden">
      {results.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
          onClick={onSelect}
        >
          <img
            src={product.thumbnail ? `http://localhost:8000${product.thumbnail}` : "/placeholder.png"}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="flex flex-col truncate">
            <span className="text-sm font-bold truncate">{product.name}</span>
            <span className="text-orange-600 text-xs font-black">
              {product.sale_price ? product.sale_price.toLocaleString() : product.price.toLocaleString()}₫
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
