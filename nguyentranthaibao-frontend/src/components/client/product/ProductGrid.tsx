"use client";

import { Row, Col, Pagination, Spin } from "antd";
import ProductCard, { Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  viewMode?: "grid" | "list";
}

export default function ProductGrid({
  products,
  total,
  page,
  onPageChange,
  loading,
  viewMode = "grid",
}: ProductGridProps) {
  if (loading) return <Spin />;

  if (!products.length)
    return <div className="text-center py-10">Không có sản phẩm</div>;

  return (
    <>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col
            key={product.id}
            xs={24}
            sm={viewMode === "grid" ? 12 : 24}
            md={viewMode === "grid" ? 8 : 24}
          >
            <ProductCard product={product} viewMode={viewMode} />
          </Col>
        ))}
      </Row>

      <div className="flex justify-center mt-4">
        <Pagination
          current={page}
          total={total}
          pageSize={12}
          onChange={onPageChange}
        />
      </div>
    </>
  );
}
