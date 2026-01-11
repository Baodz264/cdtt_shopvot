"use client";

import { useEffect, useState } from "react";
import CategoryService, { Category } from "@/services/CategoryService";

const IMAGE_BASE = "http://localhost:8000";

interface CategorySectionProps {
  onSelect?: (slug: string) => void;
}

export default function CategorySection({ onSelect }: CategorySectionProps) {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.list({ page: 1, limit: 20, status: 1 });
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 mt-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
            Khám phá danh mục
          </h2>
          <div className="h-1 w-20 bg-emerald-500 mt-2 rounded-full"></div>
        </div>
        <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
          Xem tất cả &rarr;
        </button>
      </div>

      {/* Container cuộn ngang ẩn thanh cuộn */}
      <div className="overflow-x-auto no-scrollbar pb-6">
        <div className="flex gap-6 min-w-max">
          {loading
            ? // Skeleton Loading
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-32 h-40 bg-gray-200 animate-pulse rounded-2xl" />
              ))
            : categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onSelect?.(cat.slug)}
                  className="group flex flex-col items-center cursor-pointer transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white shadow-md rounded-[2.5rem] flex items-center justify-center p-4 group-hover:shadow-xl group-hover:shadow-emerald-100 group-hover:-translate-y-2 transition-all duration-300 border border-gray-50">
                    <div className="w-full h-full relative overflow-hidden rounded-2xl">
                      <img
                        src={
                          cat.image
                            ? `${IMAGE_BASE}/${cat.image.replace(/^\/+/, "")}`
                            : "/images/no-image.png"
                        }
                        alt={cat.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Category Name */}
                  <span className="mt-4 text-sm md:text-base font-bold text-gray-700 group-hover:text-emerald-600 transition-colors text-center max-w-[120px] line-clamp-1 uppercase tracking-wider">
                    {cat.name}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Thêm CSS thủ công để ẩn scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}