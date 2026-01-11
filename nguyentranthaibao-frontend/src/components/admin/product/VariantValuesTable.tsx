"use client";

import { Table, Image, Button, Space, Popconfirm } from "antd";

const IMAGE_BASE = "http://localhost:8000";

interface ProductVariantValue {
  id: number;
  value: string;
  extra_price?: number;
  stock?: number;
  thumbnail?: string; // Tên trường: thumbnail
}

interface Props {
  data: ProductVariantValue[];
  onEdit(value: ProductVariantValue): void;
  onDelete(id: number): void;
}

export default function VariantValuesTable({
  data,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Table
      dataSource={data}
      rowKey="id"
      pagination={false}
      bordered
      size="middle"
      columns={[
        {
          title: "Ảnh",
          dataIndex: "thumbnail",
          render: (v: string) =>
            v ? (
              <Image
                src={`${IMAGE_BASE}${v.startsWith("/") ? "" : "/"}${v}`}
                width={60}
                height={60}
              />
            ) : (
              "-"
            ),
        },
        { title: "Giá trị", dataIndex: "value" },
        {
          title: "Giá + thêm",
          dataIndex: "extra_price",
          render: (v: number) => (v ? `${v.toLocaleString()} đ` : "-"),
        },
        { title: "Kho", dataIndex: "stock" },
        {
          title: "Hành động",
          render: (_, row) => (
            <Space>
              <Button size="small" onClick={() => onEdit(row)}>Sửa</Button>
              <Popconfirm
                title="Xoá giá trị?"
                onConfirm={() => onDelete(row.id)}
              >
                <Button danger size="small">Xoá</Button>
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
  );
}