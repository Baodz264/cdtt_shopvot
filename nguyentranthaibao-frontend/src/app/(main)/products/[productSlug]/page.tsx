"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Spin, Divider, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import ProductService from "@/services/ProductService";
import ProductSaleService from "@/services/ProductSaleService";
import ProductNewService from "@/services/ProductNewService";
import ProductImageService from "@/services/ProductImageService";
import ProductVariantService from "@/services/ProductVariantService";
import ProductVariantValueService from "@/services/ProductVariantValueService";

import ReviewService from "@/services/ReviewService";
import ReviewReplyService from "@/services/ReviewReplyService";
import ReviewLikeService from "@/services/ReviewLikeService";
import ReviewImageService from "@/services/ReviewImageService";

import ProductGallery from "@/components/client/ProductDetail/ProductGallery";
import ProductInfo from "@/components/client/ProductDetail/ProductInfo";
import ReviewForm from "@/components/client/ProductDetail/ReviewForm";
import ReviewList from "@/components/client/ProductDetail/ReviewList";

import { Review, ReviewReply } from "@/types/review";

/* ================= CONFIG ================= */

const IMAGE_BASE = "http://localhost:8000";

/* ================= TYPES ================= */

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  stock: number;
  brand?: string;
  isNew?: boolean;
  category_id?: number;
  thumbnail?: string;
}

interface ProductImage {
  image: string;
}

interface VariantValue {
  id: number;
  value: string;
  extra_price: number;
  thumbnail?: string;
}

interface Variant {
  id: number;
  name: string;
  values: VariantValue[];
}

/* ================= SUGGESTED PRODUCTS ================= */

interface SuggestedProductsProps {
  products: Product[];
}

function SuggestedProducts({ products }: SuggestedProductsProps) {
  if (!products.length) return null;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">
        Sản phẩm được đề xuất
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => {
          const thumbnailUrl = p.thumbnail
            ? `${IMAGE_BASE}${p.thumbnail.startsWith("/") ? "" : "/"}${p.thumbnail}`
            : "/placeholder.png";

          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
            >
              <img
                src={thumbnailUrl}
                alt={p.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-3">
                <h4 className="text-sm font-medium line-clamp-2">
                  {p.name}
                </h4>

                <p className="text-red-500 font-semibold">
                  {(p.salePrice ?? p.price).toLocaleString()}₫
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function ProductDetailPage() {
  const { productSlug } = useParams<{ productSlug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, VariantValue>
  >({});

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (!productSlug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await ProductService.getBySlug(productSlug);
        const p = res.data;
        if (!p) return;

        const [saleRes, newRes, imgRes, variantRes] = await Promise.all([
          ProductSaleService.list({ active_only: true, limit: 1000 }),
          ProductNewService.list({ valid_only: true }),
          ProductImageService.list({ product_id: p.id }),
          ProductVariantService.list({ product_id: p.id }),
        ]);

        /* ✅ MAP SALE */
        const saleMap = new Map<number, number>();
        saleRes.data.data.forEach(
          (s: { product_id: number; sale_price: number }) => {
            saleMap.set(s.product_id, s.sale_price);
          }
        );

        const images = [
          p.thumbnail ? `${IMAGE_BASE}${p.thumbnail}` : undefined,
          ...(imgRes.data.data as ProductImage[]).map(
            (i) => `${IMAGE_BASE}${i.image}`
          ),
        ].filter(Boolean) as string[];

        setGallery(images);
        setActiveImage(images[0]);

        setProduct({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          salePrice: saleMap.get(p.id),
          stock: p.stock,
          brand: p.brand?.name,
          isNew: newRes.data.data.some(
            (n: { product_id: number }) => n.product_id === p.id
          ),
          category_id: p.category_id,
          thumbnail: p.thumbnail,
        });

        const variantData: Variant[] = await Promise.all(
          variantRes.data.data.map(async (v: { id: number; name: string }) => {
            const valueRes = await ProductVariantValueService.list({
              variant_id: v.id,
            });

            return {
              id: v.id,
              name: v.name,
              values: valueRes.data.data as VariantValue[],
            };
          })
        );

        setVariants(variantData);

        /* ================= FIX LỖI GIÁ SALE Ở ĐÂY ================= */

        const suggestedRes = await ProductService.list({
          category_id: p.category_id,
          limit: 8,
        });

        const suggestedRaw = (suggestedRes.data.data as Product[]).filter(
          (sp) => sp.id !== p.id
        );

        const suggestedWithSale: Product[] = suggestedRaw.map((sp) => ({
          ...sp,
          salePrice: saleMap.get(sp.id),
        }));

        setSuggestedProducts(suggestedWithSale);
      } catch {
        message.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug]);

  /* ================= FETCH REVIEW ================= */

  useEffect(() => {
    if (!product?.id) return;

    const fetchReviews = async () => {
      try {
        setReviewLoading(true);

        const res = await ReviewService.list({ product_id: product.id });

        const data: Review[] = await Promise.all(
          res.data.data.map(async (r: Review) => {
            const [replyRes, imgRes, likeRes] = await Promise.all([
              ReviewReplyService.list({ review_id: r.id }),
              ReviewImageService.list({ review_id: r.id }),
              ReviewLikeService.list({ review_id: r.id }),
            ]);

            return {
              ...r,
              replies: replyRes.data.data as ReviewReply[],
              images: imgRes.data.data.map(
                (i: { image: string }) => `${IMAGE_BASE}${i.image}`
              ),
              likes: likeRes.data.data.filter(
                (l: { type: string }) => l.type === "like"
              ).length,
              dislikes: likeRes.data.data.filter(
                (l: { type: string }) => l.type === "dislike"
              ).length,
            };
          })
        );

        setReviews(data);
      } catch {
        message.error("Không thể tải đánh giá");
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [product]);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div className="py-20 text-center">Không tồn tại sản phẩm</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/products"
          className="flex items-center gap-2 text-gray-500 mb-6"
        >
          <ArrowLeftOutlined /> Quay lại
        </Link>

        <div className="bg-white rounded-3xl p-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ProductGallery
            gallery={gallery}
            activeImage={activeImage}
            onChange={setActiveImage}
          />

          <ProductInfo
            product={product}
            variants={variants}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
            quantity={quantity}
            setQuantity={setQuantity}
            activeImage={activeImage}
          />
        </div>

        <Divider />

        <ReviewForm productId={product.id} />
        <ReviewList reviews={reviews} loading={reviewLoading} />

        <Divider />

        <SuggestedProducts products={suggestedProducts} />
      </div>
    </div>
  );
}
