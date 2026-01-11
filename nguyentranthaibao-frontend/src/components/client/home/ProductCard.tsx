"use client";

import Link from "next/link";
import { Card, Typography, Space, Button, Badge } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import { Product } from "@/types/Product";

const { Title, Text } = Typography;
const IMAGE_BASE = "http://localhost:8000";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  /* ================= SAFE DATA ================= */
  const stock = product.stock ?? 0;
  if (stock <= 0) return null;

  const price = product.price ?? 0;
  const salePrice = product.salePrice ?? 0;

  // 🔥 CHỈ TIN isSale – KHÔNG TỰ ĐOÁN
  const isOnSale = product.isSale === true;

  const thumbnailUrl = product.images?.[0]
    ? `${IMAGE_BASE}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`
    : "/placeholder.png";

  /* ================= RENDER ================= */
  return (
    <Card
      hoverable
      className="flex flex-col justify-between rounded-xl shadow-md hover:shadow-xl transition-all h-full"
      cover={
        <div className="relative h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
          {/* SALE badge */}
          {isOnSale && (
            <Badge
              count="SALE"
              className="absolute top-2 left-2"
              style={{ backgroundColor: "#f5222d", fontSize: "0.65rem" }}
            />
          )}

          {/* NEW badge */}
          {!isOnSale && product.isNew && (
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
      }
    >
      <div className="flex flex-col justify-between h-full mt-2">
        {/* INFO */}
        <Space orientation="vertical" size={1}>
          {product.brand && (
            <Text type="secondary" className="text-xs uppercase">
              {product.brand}
            </Text>
          )}

          <Title level={5} ellipsis className="m-0 line-clamp-2">
            {product.name}
          </Title>

          <div className="flex items-center gap-2">
            <Text strong className="text-red-600 text-lg">
              {(isOnSale ? salePrice : price).toLocaleString()}đ
            </Text>

            {isOnSale && (
              <Text delete className="text-gray-400 text-sm">
                {price.toLocaleString()}đ
              </Text>
            )}
          </div>
        </Space>

        {/* ACTIONS */}
        <div className="mt-4 flex gap-2">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <Button icon={<EyeOutlined />} className="w-full hover:bg-gray-100">
              Xem
            </Button>
          </Link>

          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="flex-1"
          >
            Thêm giỏ
          </Button>
        </div>
      </div>
    </Card>
  );
}
