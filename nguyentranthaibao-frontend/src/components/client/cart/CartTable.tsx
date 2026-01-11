"use client";

import { Table, InputNumber, Image, Space, Typography, Tag, Popconfirm, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { ExtendedCartItem } from "@/types/cart";

const { Text } = Typography;
const IMAGE_BASE = "http://localhost:8000";

interface CartTableProps {
  items: ExtendedCartItem[];
  selectedRowKeys: React.Key[];
  onSelectChange: (keys: React.Key[]) => void;
  onQuantityChange: (id: number, qty: number, price: number) => void;
  onRemove: (id: number) => void;
}

export default function CartTable({
  items,
  selectedRowKeys,
  onSelectChange,
  onQuantityChange,
  onRemove,
}: CartTableProps) {
  const columns: ColumnsType<ExtendedCartItem> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => {
        // Lấy ảnh ưu tiên: variant thumbnail > product thumbnail > placeholder
        const imgPath: string | undefined = record.variant_value?.thumbnail || record.product?.thumbnail;
        const imgSrc = imgPath
          ? `${IMAGE_BASE}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`
          : "/images/placeholder.png";

        return (
          <Space size="middle">
            <Image
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: 8 }}
              src={imgSrc}
              fallback="/images/placeholder.png"
            />
            <div>
              <Text strong style={{ fontSize: 15, display: "block" }}>
                {record.product?.name}
              </Text>
              {record.variant_value ? (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Phân loại:{" "}
                  </Text>
                  <Tag color="orange">{record.variant_value.value}</Tag>
                </div>
              ) : (
                <Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
                  Mặc định
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Đơn giá",
      key: "price",
      render: (_, record) => <Text strong>{record.price.toLocaleString()} đ</Text>,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => val && onQuantityChange(record.id, val, record.price)}
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      render: (_, record) => (
        <Text type="danger" strong>
          {(record.price * record.quantity).toLocaleString()} đ
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Xóa sản phẩm này?"
          onConfirm={() => onRemove(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      columns={columns}
      dataSource={items.map((item) => ({ ...item, key: item.id }))}
      pagination={false}
    />
  );
}
