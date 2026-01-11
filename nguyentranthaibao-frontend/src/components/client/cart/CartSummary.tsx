"use client";

import { Card, Divider, Typography, Button } from "antd";

const { Text } = Typography;

interface CartSummaryProps {
  totalPrice: number;
  selectedCount: number;
  onCheckout: () => void;
}

export default function CartSummary({
  totalPrice,
  selectedCount,
  onCheckout,
}: CartSummaryProps) {
  return (
    <Card
      variant="borderless"
      title="Tóm tắt đơn hàng"
      className="shadow-sm sticky top-6"
    >
      <div className="flex justify-between mb-4">
        <Text type="secondary">
          Tạm tính ({selectedCount} sản phẩm):
        </Text>
        <Text strong>{totalPrice.toLocaleString()} đ</Text>
      </div>

      <Divider />

      <div className="flex justify-between items-center mb-8">
        <Text strong className="text-lg">Tổng cộng:</Text>
        <Text strong className="text-2xl text-red-500">
          {totalPrice.toLocaleString()} đ
        </Text>
      </div>

      <Button
        type="primary"
        size="large"
        block
        className="h-14 text-lg font-bold"
        disabled={selectedCount === 0}
        onClick={onCheckout}
      >
        Tiến hành đặt hàng
      </Button>
    </Card>
  );
}
