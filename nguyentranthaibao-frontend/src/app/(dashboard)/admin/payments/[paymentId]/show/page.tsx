"use client";

import { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Spin, message, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import PaymentService, { Payment } from "@/services/PaymentService";

export default function PaymentShowPage() {
  const params = useParams();
  const router = useRouter();

  const paymentId = Number(params?.paymentId);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayment = async (id: number) => {
    try {
      setLoading(true);
      const res = await PaymentService.detail(id);
      setPayment(res.data);
    } catch (error) {
      console.error(error);
      message.error("Không tải được chi tiết thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!paymentId || Number.isNaN(paymentId)) {
      message.error("Payment ID không hợp lệ");
      return;
    }
    fetchPayment(paymentId);
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 text-center text-red-500">
        Không tìm thấy thông tin thanh toán
      </div>
    );
  }

  const statusColor = (status?: Payment["payment_status"]) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "orange";
      case "failed":
      case "refunded":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card
        title={`Chi tiết thanh toán #${payment.id}`}
        extra={<Button onClick={() => router.back()}>Quay lại</Button>}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{payment.id}</Descriptions.Item>
          <Descriptions.Item label="Mã đơn hàng">
            {payment.order?.id ?? payment.order_id}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức">
            {payment.method.toUpperCase()}
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền">
            {payment.amount.toLocaleString()}₫
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColor(payment.payment_status)}>
              {payment.payment_status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mã giao dịch">
            {payment.transaction_id || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Thông báo">
            {payment.message || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {payment.created_at || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {payment.updated_at || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
