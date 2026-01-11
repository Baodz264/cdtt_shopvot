"use client";

import { useEffect, useState } from "react";
import ProductService from "@/services/ProductService";
import ProductNewService from "@/services/ProductNewService";
import { Product } from "@/types/Product";
import ProductCard from "./ProductCard";

interface ProductNewItem {
  product_id: number;
}

export default function ProductNew() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);

        // 1️⃣ Lấy danh sách product_new
        const res = await ProductNewService.list({ limit: 20 });
        const ids: number[] = res.data.data.map(
          (item: ProductNewItem) => item.product_id
        );

        if (!ids.length) {
          setProducts([]);
          return;
        }

        // 2️⃣ Lấy product theo id song song, an toàn
        const results = await Promise.allSettled(
          ids.map((id) => ProductService.get(id))
        );

        const productsData: Product[] = results
          .map((r) => {
            if (r.status !== "fulfilled") return null;

            const p = r.value.data;
            if (!p || p.stock <= 0) return null;

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price ?? 0,
              salePrice: p.sale_price ?? undefined,
              stock: p.stock,
              images: p.thumbnail ? [p.thumbnail] : [],
              brand: p.brand?.name,
              isNew: true,
              isSale: p.sale_price != null && p.sale_price < p.price,
              categories: p.category ? [p.category.name] : [],
            } as Product;
          })
          .filter((item): item is Product => Boolean(item));

        setProducts(productsData);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm mới:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  if (loading) return <p>Đang tải sản phẩm mới...</p>;
  if (products.length === 0) return <p>Chưa có sản phẩm mới</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
