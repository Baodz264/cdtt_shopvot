"use client";

import { Empty, Button } from "antd";
import { useRouter } from "next/navigation";

export default function EmptyCart() {
  const router = useRouter();

  return (
    <Empty description="Giỏ hàng đang trống" style={{ padding: '100px 0' }}>
      <Button type="primary" size="large" onClick={() => router.push('/')}>Mua sắm ngay</Button>
    </Empty>
  );
}
