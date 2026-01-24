"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";

import ProductService, { ProductListParams } from "@/services/ProductService";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  thumbnail?: string;
}

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSearch = (slug?: string) => {
    setOpen(false);
    if (slug) {
      router.push(`/products/${slug}`);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const params: ProductListParams = {
          search: query,
          limit: 5,
          status: 1,
        };
        const res = await ProductService.list(params);
        setResults(res.data.data || []);
      } catch (err) {
        console.log("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {open && (
          <motion.input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            placeholder="Tìm sản phẩm, thương hiệu..."
            className="bg-gray-100 rounded-full h-10 pl-4 pr-10 outline-none text-sm font-medium border border-gray-200 focus:border-orange-500"
            autoFocus
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (open && query.trim()) handleSearch();
          else setOpen(!open);
        }}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
          open
            ? "absolute right-0 text-orange-600"
            : "bg-gray-100 hover:bg-orange-600 hover:text-white"
        }`}
      >
        {open ? <FaTimes size={14} /> : <FaSearch size={14} />}
      </button>

      {open && query.trim() && (
        <div className="absolute top-12 left-0 w-[300px] max-h-80 overflow-y-auto bg-white shadow-xl rounded-2xl z-50 border">
          {loading && (
            <div className="flex justify-center py-6">
              <Spin />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              Không tìm thấy sản phẩm
            </div>
          )}

          {!loading &&
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSearch(product.slug)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-xl"
              >
                <img
                  src={
                    product.thumbnail
                      ? `http://localhost:8000${product.thumbnail}`
                      : "/placeholder.png"
                  }
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="truncate">
                  <p className="text-sm font-bold truncate">
                    {product.name}
                  </p>
                  <p className="text-orange-600 text-xs font-black">
                    {(product.sale_price ?? product.price).toLocaleString()}₫
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
