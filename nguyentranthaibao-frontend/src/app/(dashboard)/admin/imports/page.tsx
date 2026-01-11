"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table, Space, Modal, Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";

import ImportService, { Import as ImportType } from "@/services/ImportService";
import { useToast } from "@/context/ToastProvider";

export default function ImportListPage() {
  const toast = useToast();

  const [imports, setImports] = useState<ImportType[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* ================= FETCH DATA ================= */
  const fetchImports = async (
    page = pagination.current,
    limit = pagination.pageSize
  ) => {
    try {
      setLoading(true);

      const res = await ImportService.list({ page, limit });

      setImports(res.data);
      setPagination({
        current: res.page,
        pageSize: res.limit,
        total: res.total,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách import!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports(1, pagination.pageSize);
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc chắn muốn xoá import này?",
      okText: "Xoá",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await ImportService.delete(id);
          toast.success("Xóa import thành công!");
          fetchImports(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error(error);
          toast.error("Xóa thất bại!");
        }
      },
    });
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<ImportType> = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
      width: 80,
      render: (id) => <span className="font-medium">{id}</span>,
    },
    {
      title: "Người tạo",
      dataIndex: ["user", "name"],
      align: "center",
      render: (name: string) =>
        name || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      align: "center",
      render: (note) => <span className="text-gray-700">{note}</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
      render: (date?: string) => (
        <Tag color="blue">
          {date ? date : "N/A"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      align: "center",
      width: 250,
      render: (_: unknown, record: ImportType) => (
        <Space size="middle">
          <Link
            href={`/admin/imports/${record.id}/show`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Xem
          </Link>

          <Link
            href={`/admin/imports/${record.id}/edit`}
            className="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Sửa
          </Link>

          <span
            className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </span>
        </Space>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Danh sách Import
        </h1>

        <Link href="/admin/imports/add">
          <Button type="primary" className="px-5 py-5 text-base font-medium">
            Thêm Import
          </Button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <Table
          rowKey="id"
          dataSource={imports}
          columns={columns}
          bordered
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) =>
              fetchImports(page, pageSize),
          }}
        />
      </div>
    </div>
  );
}
