"use client";

import { useState, useEffect } from "react";
import { Table, Tag, Button, Space, message, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import OrderService, { Order } from "@/services/OrderService";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  // Fetch orders từ API
  const fetchOrders = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const data = await OrderService.list({ page, limit });
      setOrders(data.data);
      setCurrentPage(data.page);
      setPageSize(data.limit);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, pageSize);
  }, []);

  const statusColor = (status: Order["status"]) => {
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

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money",
      key: "total_money",
      align: "right",
      render: (amount: number) => (amount ? amount.toLocaleString() + "₫" : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: Order["status"]) => (
        <Tag color={statusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      key: "payment_method",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/admin/orders/${record.id}/show`}>
            <Button type="link" size="small">
              Xem
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Danh sách đơn hàng</h1>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        bordered
        pagination={false} // pagination dùng Ant Design Pagination bên dưới
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchOrders(page, size)}
          onShowSizeChange={(current, size) => fetchOrders(1, size)}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} đơn hàng`
          }
        />
      </div>
    </div>
  );
}
