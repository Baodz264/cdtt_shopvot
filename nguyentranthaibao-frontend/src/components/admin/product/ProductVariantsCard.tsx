"use client";

import { Card, Button, Space, Popconfirm } from "antd";
import VariantValuesTable from "./VariantValuesTable";

interface ProductVariant {
  id: number;
  name: string;
}

interface ProductVariantValue {
  id: number;
  value: string;
  extra_price?: number;
  stock?: number;
  thumbnail?: string;
}

interface Props {
  variants: ProductVariant[];
  variantValues: Record<number, ProductVariantValue[]>;
  onAddVariant(): void;
  onEditVariant(v: ProductVariant): void;
  onDeleteVariant(id: number): void;
  onAddValue(variantId: number): void;
  onEditValue(value: ProductVariantValue, variantId: number): void;
  onDeleteValue(id: number): void;
}

export default function ProductVariantsCard({
  variants,
  variantValues,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onAddValue,
  onEditValue,
  onDeleteValue,
}: Props) {
  return (
    <Card
      title="🔧 Biến thể sản phẩm"
      extra={<Button type="primary" onClick={onAddVariant}>➕ Thêm biến thể</Button>}
      className="shadow-md rounded-xl"
    >
      {variants.length === 0 && (
        <p className="text-gray-500">Không có biến thể.</p>
      )}

      {variants.map((variant) => (
        <div key={variant.id} className="mb-6 p-4 border rounded-xl">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{variant.name}</h3>
            <Space>
              <Button onClick={() => onEditVariant(variant)}>Sửa</Button>
              <Popconfirm
                title="Xoá biến thể?"
                onConfirm={() => onDeleteVariant(variant.id)}
              >
                <Button danger>Xoá</Button>
              </Popconfirm>
            </Space>
          </div>

          <div className="mt-4">
            <VariantValuesTable
              data={variantValues[variant.id] || []}
              onEdit={(v) => onEditValue(v, variant.id)}
              onDelete={onDeleteValue}
            />
          </div>

          <div className="flex justify-end mt-3">
            <Button
              type="primary"
              size="small"
              onClick={() => onAddValue(variant.id)}
            >
              ➕ Thêm giá trị
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
