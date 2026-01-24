"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Space,
  Modal,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import ImportService, { Import as ImportType } from "@/services/ImportService";
import { useToast } from "@/context/ToastProvider";

const { RangePicker } = DatePicker;

export default function ImportListPage() {
  const toast = useToast();

  const [imports, setImports] = useState<ImportType[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FILTER STATE ================= */
  const [keyword, setKeyword] = useState("");
  const [userId, setUserId] = useState<number | undefined>();
  const [dates, setDates] = useState<[string?, string?]>([]);
  const [sortBy, setSortBy] = useState<"created_at" | "id">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

      const res = await ImportService.list({
        page,
        limit,
        keyword: keyword || undefined,
        user_id: userId,
        from_date: dates?.[0],
        to_date: dates?.[1],
        sort_by: sortBy,
        sort_order: sortOrder,
      });

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
          fetchImports();
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
    },
    {
      title: "Người tạo",
      dataIndex: ["user", "name"],
      align: "center",
      render: (name?: string) =>
        name || <span className="text-gray-400">N/A</span>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      align: "center",
      render: (date?: string) => (
        <Tag color="blue">{date || "N/A"}</Tag>
      ),
    },
    {
      title: "Hành động",
      align: "center",
      width: 240,
      render: (_: unknown, record) => (
        <Space>
          <Link href={`/admin/imports/${record.id}/show`}>Xem</Link>
          <Link href={`/admin/imports/${record.id}/edit`}>Sửa</Link>
          <span
            className="text-red-600 cursor-pointer"
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
        <h1 className="text-3xl font-bold">Danh sách Import</h1>

        <Link href="/admin/imports/add">
          <Button type="primary">Thêm Import</Button>
        </Link>
      </div>

      {/* FILTER */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Tìm theo ghi chú / user"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
          </Col>

          <Col span={4}>
            <Input
              placeholder="User ID"
              type="number"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </Col>

          <Col span={6}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(values) =>
                setDates(
                  values
                    ? [
                        values[0]?.format("YYYY-MM-DD"),
                        values[1]?.format("YYYY-MM-DD"),
                      ]
                    : []
                )
              }
            />
          </Col>

          <Col span={4}>
            <Select
              value={sortBy}
              onChange={(v) => setSortBy(v)}
              style={{ width: "100%" }}
            >
              <Select.Option value="created_at">Ngày tạo</Select.Option>
              <Select.Option value="id">ID</Select.Option>
            </Select>
          </Col>

          <Col span={4}>
            <Select
              value={sortOrder}
              onChange={(v) => setSortOrder(v)}
              style={{ width: "100%" }}
            >
              <Select.Option value="desc">Giảm dần</Select.Option>
              <Select.Option value="asc">Tăng dần</Select.Option>
            </Select>
          </Col>
        </Row>

        <div className="mt-4 flex gap-3">
          <Button type="primary" onClick={() => fetchImports(1)}>
            Lọc
          </Button>
          <Button
            onClick={() => {
              setKeyword("");
              setUserId(undefined);
              setDates([]);
              setSortBy("created_at");
              setSortOrder("desc");
              fetchImports(1);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <Table
          rowKey="id"
          dataSource={imports}
          columns={columns}
          loading={loading}
          bordered
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              fetchImports(page, pageSize),
          }}
        />
      </div>
    </div>
  );
}
