"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Pagination,
  Input,
  Select,
  Row,
  Col,
  Card,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import OrderService, {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/services/OrderService";

const { Search } = Input;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  /* ================= FILTER ================= */
  const [keyword, setKeyword] = useState<string>();
  const [status, setStatus] = useState<OrderStatus>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>();

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.list({
        page: currentPage,
        limit: pageSize,
        keyword,
        status,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        sort_by: "created_at",
        sort_order: "desc",
      });

      setOrders(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔥 CHỈ GỌI API Ở ĐÂY
   * Khi bất kỳ state nào thay đổi
   */
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    keyword,
    status,
    paymentMethod,
    paymentStatus,
  ]);

  /* ================= UI HELPERS ================= */
  const statusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "orange";
      case "confirmed":
        return "green";
      case "shipping":
        return "blue";
      case "completed":
        return "purple";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  /* ================= TABLE ================= */
  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      align: "center",
      width: 90,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money",
      align: "right",
      render: (v: number) =>
        v ? v.toLocaleString("vi-VN") + "₫" : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (s: OrderStatus) => (
        <Tag color={statusColor(s)}>{s.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      align: "center",
      render: (v) => v?.toUpperCase(),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
    },
    {
      title: "Hành động",
      align: "center",
      render: (_, record) => (
        <Link href={`/admin/orders/${record.id}/show`}>
          <Button type="link" size="small">
            Xem
          </Button>
        </Link>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h1>

      {/* ================= FILTER ================= */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo tên / SĐT"
              allowClear
              onSearch={(value) => {
                setCurrentPage(1);
                setKeyword(value || undefined);
              }}
            />
          </Col>

          <Col xs={24} md={5}>
            <Select
              allowClear
              placeholder="Trạng thái"
              className="w-full"
              onChange={(v) => {
                setCurrentPage(1);
                setStatus(v);
              }}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="confirmed">Confirmed</Select.Option>
              <Select.Option value="shipping">Shipping</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <Select
              allowClear
              placeholder="Phương thức"
              className="w-full"
              onChange={(v) => {
                setCurrentPage(1);
                setPaymentMethod(v);
              }}
            >
              <Select.Option value="cod">COD</Select.Option>
              <Select.Option value="momo">MOMO</Select.Option>
              <Select.Option value="vnpay">VNPAY</Select.Option>
              <Select.Option value="paypal">PAYPAL</Select.Option>
            </Select>
          </Col>

          <Col xs={24} md={6}>
            <Select
              allowClear
              placeholder="Thanh toán"
              className="w-full"
              onChange={(v) => {
                setCurrentPage(1);
                setPaymentStatus(v);
              }}
            >
              <Select.Option value="unpaid">Chưa thanh toán</Select.Option>
              <Select.Option value="paid">Đã thanh toán</Select.Option>
              <Select.Option value="refunded">Hoàn tiền</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ================= TABLE ================= */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        bordered
        pagination={false}
      />

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </div>
    </div>
  );
}
