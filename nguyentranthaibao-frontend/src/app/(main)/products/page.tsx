"use client";

import { useState, useEffect } from "react";
import { Row, Col, Button, Spin, Empty } from "antd";

import Filters, { ProductFilters } from "@/components/client/product/Filters";
import Sorting from "@/components/client/product/Sorting";
import ProductGrid from "@/components/client/product/ProductGrid";

import ProductService, { ProductListParams } from "@/services/ProductService";
import ProductNewService from "@/services/ProductNewService";
import ProductSaleService from "@/services/ProductSaleService";

/* ================= TYPES ================= */

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  stock: number;
  is_new?: boolean;
  isSale: boolean;
  brand: string;
  thumbnail: string;
}

interface RawProductAPI {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  stock: number;
  is_new?: boolean;
  brand?: { name: string } | string;
  thumbnail?: string;
  product?: RawProductAPI;
}

type SortField =
  | "id"
  | "name"
  | "price"
  | "sale_price"
  | "stock"
  | "created_at";

type SortOrder = "asc" | "desc";

/* ================= COMPONENT ================= */

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [sort, setSort] = useState<string>("");

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    if (!filters) return;

    setLoading(true);
    try {
      const params: ProductListParams & {
        valid_only?: boolean;
        active_only?: boolean;
      } = {
        page,
        limit: 10,
        category_id: filters.category_id?.[0],
        brand_id: filters.brand_id?.[0],
        price_from: filters.price_from,
        price_to: filters.price_to,
      };

      if (sort) {
        const [field, order] = sort.split("_");
        if (field && (order === "asc" || order === "desc")) {
          params.sortBy = field as SortField;
          params.sortOrder = order as SortOrder;
        }
      }

      let res;

      if (filters.status.includes("Mới")) {
        params.valid_only = true;
        res = await ProductNewService.list(params);
      } else if (filters.status.includes("Giảm giá")) {
        params.active_only = true;
        res = await ProductSaleService.list(params);
      } else {
        if (filters.status.includes("Hết hàng")) {
          params.status = 0;
        }
        res = await ProductService.list(params);
      }

      /* ======= FIX PHÂN TRANG ======= */
      const response = res.data;
      const rawData: RawProductAPI[] = response?.data ?? [];

      const mappedProducts: Product[] = rawData.map((item) => {
        const p = item.product ?? item;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          sale_price: p.sale_price || item.sale_price,
          stock: p.stock,
          is_new: filters.status.includes("Mới") || p.is_new,
          isSale: Boolean(p.sale_price || item.sale_price),
          brand:
            typeof p.brand === "object"
              ? p.brand?.name || ""
              : p.brand || "",
          thumbnail: p.thumbnail || "/placeholder.png",
        };
      });

      setProducts(mappedProducts);
      setTotal(response?.total ?? mappedProducts.length);
    } catch (error) {
      console.error("Fetch products error:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, filters, sort]);

  /* ================= RENDER ================= */

  return (
    <div className="container mx-auto py-6 px-4">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <Filters
            onChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
          />
        </Col>

        <Col xs={24} md={18}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-3 rounded border shadow-sm">
            <Sorting value={sort} onChange={setSort} />

            <div className="flex gap-2">
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              >
                Lưới
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              >
                Danh sách
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24 bg-white rounded border">
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center py-20 bg-white rounded border border-dashed">
              <Empty description="Không tìm thấy sản phẩm nào" />
              <Button
                type="primary"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Làm mới bộ lọc
              </Button>
            </div>
          ) : (
            <ProductGrid
              products={products}
              total={total}
              page={page}
              onPageChange={setPage}
              loading={loading}
              viewMode={viewMode}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
