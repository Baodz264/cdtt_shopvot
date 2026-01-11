"use client";

import { useState, useEffect } from "react";
import { Table, Tag, Space, message, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import PaymentService, { Payment, PaymentListResponse } from "@/services/PaymentService";

export default function PaymentListPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const fetchPayments = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);
      const res = await PaymentService.list({ page, limit });
      const data: PaymentListResponse = res.data;
      setPayments(data.data);
      setCurrentPage(data.page);
      setPageSize(data.limit);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
      message.error("Không tải được danh sách thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, pageSize);
  }, []);

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

  const columns: ColumnsType<Payment> = [
    { title: "ID", dataIndex: "id", key: "id", width: 60, align: "center" },
    {
      title: "Mã đơn",
      dataIndex: "order",
      key: "order_id",
      align: "center",
      render: (order) => order?.id || "-",
    },
    {
      title: "Phương thức",
      dataIndex: "method",
      key: "method",
      align: "center",
      render: (text) => text?.toUpperCase() || "-",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => (value ? value.toLocaleString() + "₫" : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "payment_status",
      key: "payment_status",
      align: "center",
      render: (status) => (
        <Tag color={statusColor(status)}>{status?.toUpperCase() || "-"}</Tag>
      ),
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
          <Link
            href={`/admin/payments/${record.id}/show`}
            className="text-blue-500 hover:underline"
          >
            Xem
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách thanh toán</h1>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={payments}
        loading={loading}
        bordered
        pagination={false}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchPayments(page, size)}
          onShowSizeChange={(current, size) => fetchPayments(1, size)}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} thanh toán`
          }
        />
      </div>
    </div>
  );
}
