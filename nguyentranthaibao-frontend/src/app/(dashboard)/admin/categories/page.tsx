"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Tag, Space, Popconfirm, Image, Input, Pagination } from "antd";
import CategoryService, { Category } from "@/services/CategoryService";
import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000";

export default function CategoryList() {
  const router = useRouter();
  const toast = useToast(); // sử dụng toast
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  // =============================
  // Lấy dữ liệu category từ API
  // =============================
  const fetchCategories = async (page = 1, limit = pageSize, keyword = search) => {
    try {
      setLoading(true);
      const res = await CategoryService.list({ page, limit, search: keyword, status: 1 });

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
  }, []);

  // =============================
  // Xóa category
  // =============================
  const handleDelete = async (id: number) => {
    try {
      await CategoryService.delete(id);
      toast.success("Đã xóa danh mục");

      // Nếu xóa danh mục cuối cùng trên trang → quay về trang trước
      if (categories.length === 1 && currentPage > 1) {
        fetchCategories(currentPage - 1, pageSize, search);
      } else {
        fetchCategories(currentPage, pageSize, search);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  // =============================
  // Table columns
  // =============================
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (src: string | undefined | null) => (
        <Image
          src={src ? `${IMAGE_BASE}/${src.replace(/^\/+/, "")}` : "/no-image.jpg"}
          width={60}
          height={60}
          style={{ objectFit: "cover" }}
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
        status ? <Tag color="green">Hiển thị</Tag> : <Tag color="gray">Ẩn</Tag>,
    },
    {
      title: "Thao tác",
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Button type="link" onClick={() => router.push(`/admin/categories/${record.id}/edit`)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh Mục Sản Phẩm</h2>
        <Button type="primary" size="small" onClick={() => router.push("/admin/categories/add")}>
          + Thêm danh mục
        </Button>
      </div>

      <Input.Search
        placeholder="Tìm danh mục..."
        allowClear
        style={{ width: 250, marginBottom: 16 }}
        onSearch={(value) => {
          setSearch(value);
          fetchCategories(1, pageSize, value); // search về trang 1
        }}
      />

      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
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
          onChange={(page, size) => fetchCategories(page, size, search)}
          onShowSizeChange={(current, size) => fetchCategories(1, size, search)}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} danh mục`}
        />
      </div>
    </div>
  );
}
