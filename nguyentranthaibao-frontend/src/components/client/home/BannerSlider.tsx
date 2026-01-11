"use client";

import React, { useEffect, useState, useCallback } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const IMAGE_BASE = "http://localhost:8000";

interface BannerSliderProps {
  banners: string[];
  currentBanner: number;
  onChange: (index: number) => void;
  autoPlaySpeed?: number; // Tốc độ tự động chạy (ms)
}

export default function BannerSlider({
  banners,
  currentBanner,
  onChange,
  autoPlaySpeed = 5000,
}: BannerSliderProps) {
  const [direction, setDirection] = useState(0); // 1 cho tới, -1 cho lùi
  const total = banners.length;

  // Hàm chuyển slide (memoized để dùng trong useEffect)
  const nextSlide = useCallback(() => {
    setDirection(1);
    onChange((currentBanner + 1) % total);
  }, [currentBanner, total, onChange]);

  const prevSlide = () => {
    setDirection(-1);
    onChange((currentBanner - 1 + total) % total);
  };

  // Tự động chạy (Autoplay)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlaySpeed);

    return () => clearInterval(timer); // Dọn dẹp timer khi unmount
  }, [nextSlide, autoPlaySpeed]);

  // Framer Motion variants cho hiệu ứng trượt mượt mà
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="group relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl bg-gray-900">
      {/* Slides với AnimatePresence */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentBanner}
            src={
              banners[currentBanner].startsWith("http")
                ? banners[currentBanner]
                : `${IMAGE_BASE}/${banners[currentBanner].replace(/^\/+/, "")}`
            }
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="absolute w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Lớp phủ Gradient giúp UI trông cao cấp hơn */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Nút Điều Hướng (Ẩn hiện khi hover) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
      >
        <LeftOutlined style={{ fontSize: "20px" }} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/40"
      >
        <RightOutlined style={{ fontSize: "20px" }} />
      </button>

      {/* Dots Chỉ Số (Phong cách hiện đại) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentBanner ? 1 : -1);
              onChange(index);
            }}
            className={`transition-all duration-300 h-2 rounded-full ${
              index === currentBanner ? "w-8 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}