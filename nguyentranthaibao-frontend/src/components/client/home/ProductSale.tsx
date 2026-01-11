"use client";

import { useEffect, useState } from "react";
import ProductService from "@/services/ProductService";
import ProductSaleService from "@/services/ProductSaleService";
import { Product } from "@/types/Product";
import ProductCard from "./ProductCard";

// Kiểu cho item trong bảng product_sale
interface ProductSaleItem {
  id: number;
  product_id: number;
  sale_price: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: boolean;
}

export default function ProductSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);

        // 1️⃣ Lấy danh sách product-sale
        const res = await ProductSaleService.list({ limit: 20 });
        const saleItems: ProductSaleItem[] = res.data.data;

        if (!saleItems || saleItems.length === 0) {
          setProducts([]);
          return;
        }

        const today = new Date();

        // 2️⃣ Lấy tất cả product cùng 1 request nếu API hỗ trợ nhiều id
        // Nếu ProductService không hỗ trợ nhiều id, dùng Promise.allSettled
        const productPromises = saleItems.map((sale) =>
          ProductService.get(sale.product_id)
        );

        const results = await Promise.allSettled(productPromises);

        // 3️⃣ Ghép dữ liệu product với product_sale và filter theo thời gian
        const productsData: Product[] = results
          .map((r, idx) => {
            if (r.status !== "fulfilled") return null;

            const p = r.value.data;
            const sale = saleItems[idx];

            if (!p || p.stock <= 0) return null;

            // Kiểm tra thời gian sale
            const startDate = sale.start_date ? new Date(sale.start_date) : null;
            const endDate = sale.end_date ? new Date(sale.end_date) : null;

            // Nếu chưa tới ngày sale hoặc đã hết hạn, bỏ qua
            if ((startDate && today < startDate) || (endDate && today > endDate)) {
              return null;
            }

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price ?? 0,
              salePrice: sale.sale_price ?? 0,
              stock: p.stock,
              images: p.thumbnail ? [p.thumbnail] : [],
              brand: p.brand?.name,
              categories: p.category ? [p.category.name] : [],
              isSale: true,
            } as Product;
          })
          .filter((item): item is Product => Boolean(item));

        setProducts(productsData);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm sale:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  if (loading) return <p>Đang tải sản phẩm sale...</p>;
  if (products.length === 0) return <p>Chưa có sản phẩm sale</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
