"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Popconfirm,
  Image,
  Tag,
  Space,
  Pagination,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import BrandService, { Brand } from "@/services/BrandService";
import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000"; // Backend URL

export default function BrandList() {
  const router = useRouter();
  const toast = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  /* =======================
   * FETCH DATA
   * ======================= */
  const fetchBrands = async (
    page = 1,
    limit = pageSize,
    keyword = search
  ) => {
    try {
      setLoading(true);
      const res = await BrandService.list({
        page,
        limit,
        search: keyword,
        status: 1,
      });

      setBrands(res.data);
      setCurrentPage(res.pagination.current);
      setPageSize(res.pagination.per_page);
      setTotal(res.pagination.total);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách Brand!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands(1, pageSize);
  }, []);

  /* =======================
   * DELETE
   * ======================= */
  const handleDelete = async (id: number) => {
    try {
      await BrandService.delete(id);
      toast.success("Đã xóa Brand!");

      if (brands.length === 1 && currentPage > 1) {
        fetchBrands(currentPage - 1, pageSize, search);
      } else {
        fetchBrands(currentPage, pageSize, search);
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  /* =======================
   * TABLE COLUMNS
   * ======================= */
  const columns: ColumnsType<Brand> = [
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 90,
      render: (src?: string) => (
        <Image
          src={src ? `${IMAGE_BASE}${src}` : "/images/default-brand.png"}
          width={60}
          height={60}
          style={{ objectFit: "cover" }}
          alt="brand"
          fallback="/images/default-brand.png"
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
      width: 100,
      align: "center",
      render: (status?: number) =>
        status ? <Tag color="green">Hiện</Tag> : <Tag color="default">Ẩn</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      width: 160,
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      render: (_: unknown, record: Brand) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => router.push(`/admin/brands/${record.id}/edit`)}
          >
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

  /* =======================
   * RENDER
   * ======================= */
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Brand</h2>
        <Button type="primary" size="small" onClick={() => router.push("/admin/brands/add")}>
          + Thêm
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 flex justify-end">
        <Input.Search
          placeholder="Tìm Brand..."
          allowClear
          style={{ width: 250 }}
          onSearch={(value) => {
            setSearch(value);
            fetchBrands(1, pageSize, value);
          }}
        />
      </div>

      {/* Table */}
      <Table
        size="small"
        bordered
        rowKey="id"
        columns={columns}
        dataSource={brands}
        loading={loading}
        pagination={false}
      />

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchBrands(page, size, search)}
          onShowSizeChange={(_, size) => fetchBrands(1, size, search)}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} Brand`}
        />
      </div>
    </div>
  );
}
