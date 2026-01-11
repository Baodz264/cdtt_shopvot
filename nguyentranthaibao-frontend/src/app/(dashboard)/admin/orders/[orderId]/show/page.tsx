"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Card, Table, Tag, Select, Button, Space, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";

import OrderService from "@/services/OrderService";
import OrderItemService from "@/services/OrderItemService";
import ProductService from "@/services/ProductService";
import { useToast } from "@/context/ToastProvider"; // ✅ sử dụng toast

const IMAGE_BASE = "http://localhost:8000";

interface Voucher {
  code: string;
}

export interface OrderDetailResponse {
  id: number;
  fullname: string;
  phone: string;
  address?: string;
  note?: string;
  payment_method?: string;
  status: "pending" | "confirmed" | "shipping" | "completed" | "cancelled";
  created_at?: string;
  discount_price?: number;
  voucher?: Voucher;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: { id?: number; name?: string; thumbnail?: string };
  variant_value?: { id?: number; value?: string; thumbnail?: string };
}

export default function OrderShowPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Number(params?.orderId);
  const toast = useToast(); // ✅ hook toast

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || isNaN(orderId)) return;

      try {
        setLoading(true);

        const orderData = await OrderService.detail(orderId);
        setOrder(orderData);

        const itemsData = await OrderItemService.list({ order_id: orderId });
        const items: OrderItem[] = itemsData.data;

        const itemsWithProduct = await Promise.all(
          items.map(async (item) => {
            if (item.product?.id) {
              const prodRes = await ProductService.get(item.product.id);
              item.product = prodRes.data;
            }
            return item;
          })
        );

        setOrderItems(itemsWithProduct);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu đơn hàng"); // ✅ toast
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, toast]);

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin tip="Đang tải đơn hàng...">
          <div className="p-12" />
        </Spin>
      </div>
    );
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAfterDiscount = subtotal - (order.discount_price || 0);

  const handleStatusChange = async (value: OrderDetailResponse["status"]) => {
    try {
      if (!order) return;
      const updated = await OrderService.update(order.id, { status: value });
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success(`Đơn hàng được cập nhật sang trạng thái: ${value.toUpperCase()}`); // ✅ toast
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật trạng thái thất bại"); // ✅ toast
    }
  };

  const statusColor = (status: OrderDetailResponse["status"]) => {
    const colors: Record<string, string> = {
      pending: "orange",
      confirmed: "green",
      shipping: "blue",
      completed: "cyan",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  const customerColumns = [
    { title: "Thông tin", dataIndex: "label", key: "label", width: "30%" },
    { title: "Giá trị", dataIndex: "value", key: "value" },
  ];

  const customerData = [
    { key: "1", label: "Họ tên", value: order.fullname },
    { key: "2", label: "Số điện thoại", value: order.phone },
    { key: "3", label: "Địa chỉ", value: order.address || "-" },
    { key: "4", label: "Ghi chú", value: order.note || "-" },
    { key: "5", label: "Phương thức thanh toán", value: (order.payment_method || "unknown").toUpperCase() },
    {
      key: "6",
      label: "Trạng thái",
      value: (
        <Space>
          <Tag color={statusColor(order.status)}>{order.status.toUpperCase()}</Tag>
          <Select value={order.status} onChange={handleStatusChange} style={{ width: 150 }}>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="shipping">Shipping</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
        </Space>
      ),
    },
    { key: "7", label: "Ngày đặt", value: order.created_at || "-" },
  ];

  const columns: ColumnsType<OrderItem> = [
    {
      title: "Ảnh",
      key: "image",
      render: (_, record) => {
        const imgPath = record.variant_value?.thumbnail || record.product?.thumbnail;
        const src = imgPath ? `${IMAGE_BASE}${imgPath}` : "/images/default.jpg";
        return (
          <Image
            src={src}
            alt={record.product?.name || "Sản phẩm"}
            width={60}
            height={60}
            className="object-cover rounded"
            unoptimized
          />
        );
      },
    },
    { title: "Tên sản phẩm", dataIndex: "product", key: "name", render: (product) => product?.name || "-" },
    { title: "Biến thể", dataIndex: "variant_value", key: "variant", render: (v) => v?.value || "-" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Giá", dataIndex: "price", key: "price", render: (price) => price.toLocaleString() + "₫" },
    { title: "Tổng", key: "total", render: (_, record) => (record.quantity * record.price).toLocaleString() + "₫" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{order.id}</h1>

      <Card title="Thông tin khách hàng" className="mb-6 shadow-sm">
        <Table columns={customerColumns} dataSource={customerData} pagination={false} bordered />
      </Card>

      <Card title="Sản phẩm trong đơn" className="mb-6 shadow-sm">
        <Table rowKey="id" columns={columns} dataSource={orderItems} pagination={false} bordered />

        <div className="mt-4 text-right font-semibold space-y-1">
          <p>Tạm tính: {subtotal.toLocaleString()}₫</p>
          {order.voucher && (
            <p className="text-green-600">
              Voucher ({order.voucher.code}): -{order.discount_price?.toLocaleString()}₫
            </p>
          )}
          <p className="text-xl">
            <strong>Tổng thanh toán: {totalAfterDiscount.toLocaleString()}₫</strong>
          </p>
        </div>

        <div className="mt-6">
          <Button type="default" onClick={() => router.push("/admin/orders")}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    </div>
  );
}
