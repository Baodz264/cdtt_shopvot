"use client";

import { Button, Typography } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import React from "react";

const { Text } = Typography;

/* ================= TYPES ================= */

interface ProductQuantityProps {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  max?: number;
}

/* ================= COMPONENT ================= */

export default function ProductQuantity({
  quantity,
  setQuantity,
  max = 999,
}: ProductQuantityProps) {
  return (
    <div className="mb-6">
      <Text strong>Số lượng</Text>

      <div className="flex items-center gap-3 mt-2">
        <Button
          icon={<MinusOutlined />}
          onClick={() =>
            setQuantity((q) => Math.max(1, q - 1))
          }
        />

        <span className="text-xl font-bold">{quantity}</span>

        <Button
          icon={<PlusOutlined />}
          onClick={() =>
            setQuantity((q) => Math.min(max, q + 1))
          }
        />
      </div>
    </div>
  );
}
