"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Badge, Rate } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";

import ReviewService from "@/services/ReviewService";

/* ================= TYPES ================= */

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  stock?: number;
  thumbnail?: string;
  is_new?: boolean;
}

/** ✅ REVIEW TYPE (FIX eslint no-any) */
interface Review {
  id: number;
  rating: number;
  comment?: string;
  user_id?: number;
  product_id?: number;
  created_at?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  onAddToCart?: (product: Product) => void;
}

const IMAGE_BASE = "http://localhost:8000";

/* ================= COMPONENT ================= */

export default function ProductCard({
  product,
  viewMode = "grid",
  onAddToCart,
}: ProductCardProps) {
  const stock = product.stock ?? 0;
  const price = product.price ?? 0;
  const salePrice = product.sale_price ?? 0;

  const thumbnailUrl = product.thumbnail
    ? `${IMAGE_BASE}${product.thumbnail.startsWith("/") ? "" : "/"}${product.thumbnail}`
    : "/placeholder.png";

  const isOnSale = !!product.sale_price;
  const isNew = !!product.is_new;

  /* ===== ⭐ REVIEW STATE ===== */
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loadingReview, setLoadingReview] = useState<boolean>(true);

  /* ===== FETCH REVIEW ===== */
  useEffect(() => {
    if (!product.id) return;

    const fetchReviews = async () => {
      try {
        setLoadingReview(true);

        const res = await ReviewService.list({
          product_id: product.id,
          limit: 1000,
        });

        /** ✅ ÉP KIỂU CHUẨN */
        const reviews: Review[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        if (reviews.length === 0) {
          setAvgRating(0);
          setReviewCount(0);
          return;
        }

        const totalRating = reviews.reduce(
          (sum, review) => sum + Number(review.rating ?? 0),
          0
        );

        const avg = Number(
          (totalRating / reviews.length).toFixed(1)
        );

        setAvgRating(avg);
        setReviewCount(reviews.length);
      } catch (error) {
        console.error("❌ Fetch reviews error:", error);
        setAvgRating(0);
        setReviewCount(0);
      } finally {
        setLoadingReview(false);
      }
    };

    fetchReviews();
  }, [product.id]);

  /* ================= UI ================= */

  return (
    <Card
      hoverable
      className={`transition-all h-full ${
        viewMode === "list" ? "flex gap-4 items-center" : ""
      }`}
      cover={
        viewMode === "grid" && (
          <div className="relative h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
            {isOnSale && (
              <Badge
                count="SALE"
                className="absolute top-2 left-2"
                style={{ backgroundColor: "#f5222d", fontSize: "0.65rem" }}
              />
            )}
            {!isOnSale && isNew && (
              <Badge
                count="NEW"
                className="absolute top-2 left-2"
                style={{ backgroundColor: "#52c41a", fontSize: "0.65rem" }}
              />
            )}

            <img
              src={thumbnailUrl}
              alt={product.name}
              className="object-contain h-full w-full p-4 hover:scale-105 transition-transform duration-500"
            />
          </div>
        )
      }
    >
      <div className={viewMode === "list" ? "flex-1" : ""}>
        {viewMode === "list" && (
          <img
            alt={product.name}
            src={thumbnailUrl}
            className="w-32 h-32 object-cover mr-4"
          />
        )}

        <h3 className="font-semibold mt-2">{product.name}</h3>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-1">
          {isOnSale ? (
            <>
              <span className="text-red-600 font-bold">
                {salePrice.toLocaleString()}₫
              </span>
              <span className="line-through text-gray-400">
                {price.toLocaleString()}₫
              </span>
            </>
          ) : (
            <span className="font-bold">
              {price.toLocaleString()}₫
            </span>
          )}
        </div>

        {/* ⭐ RATING */}
        <div className="flex items-center gap-1 mt-1 min-h-[20px]">
          {loadingReview ? (
            <span className="text-xs text-gray-400">
              Đang tải đánh giá...
            </span>
          ) : reviewCount > 0 ? (
            <>
              <Rate
                allowHalf
                disabled
                value={avgRating}
                style={{ fontSize: 14 }}
              />
              <span className="text-xs text-gray-500">
                {avgRating}/5 – {reviewCount} đánh giá
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">
              Chưa có đánh giá
            </span>
          )}
        </div>

        {/* ACTION */}
        <div className="flex gap-2 mt-2">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="w-full"
            >
              Chi tiết
            </Button>
          </Link>

          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="small"
            onClick={() => onAddToCart?.(product)}
            disabled={stock <= 0}
            className="flex-1"
          >
            {stock > 0 ? "Thêm giỏ" : "Hết hàng"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
