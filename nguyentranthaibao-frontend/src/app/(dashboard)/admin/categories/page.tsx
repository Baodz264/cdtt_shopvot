"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Tag,
  Space,
  Popconfirm,
  Image,
  Input,
  Pagination,
  Select,
  DatePicker,
} from "antd";
import CategoryService, {
  Category,
  PaginatedCategories,
} from "@/services/CategoryService";
import { useToast } from "@/context/ToastProvider";

const { RangePicker } = DatePicker;
const IMAGE_BASE = "http://localhost:8000";

export default function CategoryList() {
  const router = useRouter();
  const toast = useToast();

  /* ================= STATE ================= */
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  // Filter
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<0 | 1 | undefined>(undefined);
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  /* ================= FETCH ================= */
  const fetchCategories = async (page = 1, limit = pageSize) => {
    try {
      setLoading(true);

      const res: PaginatedCategories = await CategoryService.list({
        page,
        limit,
        search: search || undefined,
        status,
        from_date: fromDate,
        to_date: toDate,
      });

      setCategories(res.data);
      setTotal(res.total);
      setCurrentPage(res.page);
      setPageSize(res.limit);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await CategoryService.delete(id);
      toast.success("Đã xóa danh mục");

      if (categories.length === 1 && currentPage > 1) {
        fetchCategories(currentPage - 1, pageSize);
      } else {
        fetchCategories(currentPage, pageSize);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 80,
      render: (src: string | null | undefined) => (
        <Image
          src={
            src
              ? `${IMAGE_BASE}/${src.replace(/^\/+/, "")}`
              : "/no-image.jpg"
          }
          width={60}
          height={60}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Tên",
      dataIndex: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: number) =>
        status ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="gray">Ẩn</Tag>
        ),
    },
    {
      title: "Thao tác",
      width: 180,
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() =>
              router.push(`/admin/categories/${record.id}/edit`)
            }
          >
            Sửa
          </Button>

          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh Mục Sản Phẩm</h2>
        <Button
          type="primary"
          size="small"
          onClick={() => router.push("/admin/categories/add")}
        >
          + Thêm danh mục
        </Button>
      </div>

      {/* FILTER */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Tìm theo tên hoặc slug..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { label: "Hiển thị", value: 1 },
            { label: "Ẩn", value: 0 },
          ]}
        />

        <RangePicker
          format="YYYY-MM-DD"
          onChange={(dates) => {
            setFromDate(dates?.[0]?.format("YYYY-MM-DD"));
            setToDate(dates?.[1]?.format("YYYY-MM-DD"));
          }}
        />

        <Space>
          <Button type="primary" onClick={() => fetchCategories(1, pageSize)}>
            Lọc
          </Button>
          <Button
            onClick={() => {
              setSearch("");
              setStatus(undefined);
              setFromDate(undefined);
              setToDate(undefined);
              fetchCategories(1, pageSize);
            }}
          >
            Reset
          </Button>
        </Space>
      </div>

      {/* TABLE */}
      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={false}
      />

      {/* PAGINATION */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchCategories(page, size)}
          onShowSizeChange={(_, size) => fetchCategories(1, size)}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trên ${total} danh mục`
          }
        />
      </div>
    </div>
  );
}
