"use client";

import { Image } from "antd";

/* ================= TYPES ================= */
interface ProductGalleryProps {
  gallery: string[];
  activeImage: string;
  onChange: (image: string) => void;
}

const IMAGE_BASE = "http://localhost:8000";

export default function ProductGallery({
  gallery,
  activeImage,
  onChange,
}: ProductGalleryProps) {
  
  const renderImage = (img: string): string =>
    img?.startsWith("http") ? img : `${IMAGE_BASE}${img.startsWith("/") ? "" : "/"}${img}`;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Ảnh chính */}
      <div className="relative aspect-square w-full bg-[#f9f9f9] rounded-2xl border border-slate-100 overflow-hidden">
        <Image
          src={renderImage(activeImage)}
          alt="Product Display"
          className="object-cover w-full h-full transition-all duration-700 hover:scale-110"
          preview={{
            // ✅ Thay mask deprecated bằng cover
            cover: <div className="text-xs font-medium p-1 bg-black/40 text-white rounded">Xem ảnh lớn</div>
          }}
          rootClassName="w-full h-full"
        />
      </div>

      {/* 2. Danh sách ảnh nhỏ */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {gallery.map((img, index) => {
          const isActive = img === activeImage;
          return (
            <button
              key={`${img}-${index}`}
              onClick={() => onChange(img)}
              className={`
                relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200
                ${isActive 
                  ? "ring-2 ring-slate-900 ring-offset-2 scale-95" 
                  : "opacity-60 hover:opacity-100 border border-slate-200"
                }
              `}
            >
              <img
                src={renderImage(img)}
                alt={`Thumb ${index}`}
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* 3. Style global */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Fix Ant Design Image fill parent */
        .ant-image { width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}
