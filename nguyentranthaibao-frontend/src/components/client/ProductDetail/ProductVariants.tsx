"use client";

import React from "react";

const IMAGE_BASE = "http://localhost:8000";

/* ================= TYPES ================= */
export interface VariantValue {
  id: number;
  value: string;
  extra_price: number;
  thumbnail?: string;
}

export interface Variant {
  id: number;
  name: string;
  values: VariantValue[];
}

export type SelectedVariants = Record<number, VariantValue>;

interface ProductVariantsProps {
  variants: Variant[];
  selected: SelectedVariants;
  onSelect: React.Dispatch<React.SetStateAction<SelectedVariants>>;
}

/* ================= COMPONENT ================= */
export default function ProductVariants({
  variants,
  selected,
  onSelect,
}: ProductVariantsProps) {
  
  // Hàm xử lý URL ảnh
  const renderImage = (img?: string): string => {
    if (!img || img.trim() === "") return ""; 
    if (img.startsWith("http")) return img;
    const path = img.startsWith("/") ? img : `/${img}`;
    return `${IMAGE_BASE}${path}`;
  };

  return (
    <div className="space-y-6">
      {variants.map((variant) => {
        // Kiểm tra variant này có ít nhất 1 giá trị có thumbnail không
        const hasAnyImage = variant.values.some(v => v.thumbnail && v.thumbnail.trim() !== "");

        return (
          <div key={variant.id} className="flex flex-col gap-3">
            {/* Label variant */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">
                {variant.name}
              </span>
              {selected[variant.id] && (
                <span className="text-[12px] font-semibold text-slate-900">
                  {selected[variant.id].value}
                </span>
              )}
            </div>

            {/* Values */}
            <div className="flex flex-wrap gap-2">
              {variant.values.map((v) => {
                const active = selected[variant.id]?.id === v.id;
                const imageUrl = renderImage(v.thumbnail);
                const hasImage = imageUrl !== "" && hasAnyImage;

                return (
                  <button
                    key={v.id}
                    onClick={() =>
                      onSelect((prev) => ({ ...prev, [variant.id]: v }))
                    }
                    className={`
                      relative flex items-center transition-all duration-300 rounded-xl border
                      ${hasImage ? "pl-1.5 pr-4 py-1.5" : "px-5 py-2.5"} 
                      ${active 
                        ? "border-slate-900 bg-white ring-1 ring-slate-900 shadow-sm" 
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-900"
                      }
                    `}
                  >
                    {/* Chỉ hiển thị ảnh khi có */}
                    {hasImage && (
                      <div className="w-9 h-9 mr-3 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                        <img
                          src={imageUrl}
                          className="w-full h-full object-cover transition-transform duration-500"
                          alt={v.value}
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Text + Extra Price */}
                    <div className="flex flex-col items-start">
                      <span className={`text-sm ${active ? "font-bold text-slate-900" : "font-medium"}`}>
                        {v.value}
                      </span>
                      {v.extra_price > 0 && (
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          +{v.extra_price.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
