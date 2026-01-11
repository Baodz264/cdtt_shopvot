"use client";

import { Card, Image, Tag, Button } from "antd";
import { useRouter } from "next/navigation";

const IMAGE_BASE = "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number | null;
  stock: number;
  slug: string;
  description?: string;
  thumbnail?: string;
}

export default function ProductInfoCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <Card
      title={<span className="text-xl font-semibold">🎯 Chi tiết sản phẩm</span>}
      extra={
        <Button type="primary" onClick={() => router.push("/admin/products")}>
          Quay lại
        </Button>
      }
      className="shadow-md rounded-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex justify-center">
          <Image
            src={
              product.thumbnail
                ? `${IMAGE_BASE}/${product.thumbnail.replace(/^\/+/, "")}`
                : "/no-image.png"
            }
            width={260}
            className="rounded-xl shadow"
          />
        </div>

        <div className="col-span-2 space-y-3 text-[16px]">
          <h2 className="text-2xl font-bold">{product.name}</h2>

          <p>
            <strong>Giá: </strong>
            <span className="text-blue-600 font-semibold">
              {product.price.toLocaleString()} đ
            </span>
          </p>

          <p>
            <strong>Giá sale: </strong>
            {product.sale_price ? (
              <Tag color="red">
                {product.sale_price.toLocaleString()} đ
              </Tag>
            ) : (
              "-"
            )}
          </p>

          <p><strong>Kho:</strong> {product.stock}</p>
          <p><strong>Slug:</strong> {product.slug}</p>

          <div>
            <p className="font-semibold mb-1">Mô tả:</p>
            <div
              className="p-4 border rounded-lg bg-gray-50"
              dangerouslySetInnerHTML={{
                __html: product.description ?? "<i>Không có mô tả</i>",
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          size="large"
          onClick={() =>
            router.push(`/admin/products/${product.id}/edit`)
          }
        >
          ✏️ Sửa sản phẩm
        </Button>
      </div>
    </Card>
  );
}
