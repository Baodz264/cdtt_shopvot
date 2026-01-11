"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Popconfirm,
  Image,
  Tag,
  Space,
  Input,
  Pagination,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import ProductService from "@/services/ProductService";
import { useToast } from "@/context/ToastProvider"; // import hook toast

const IMAGE_BASE = "http://localhost:8000";

/* ================= TYPES ================= */
interface Product {
  id: number;
  name: string;
  sku?: string;
  price: number;
  sale_price?: number | null;
  stock?: number;
  thumbnail?: string;
  category?: { id: number; name: string };
  brand?: { id: number; name: string };
}

/* ================= COMPONENT ================= */
export default function ProductList() {
  const router = useRouter();
  const toast = useToast(); // Sử dụng toast

  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchProducts = useCallback(
    async (params?: { page?: number; limit?: number; search?: string }) => {
      try {
        setLoading(true);

        const res = await ProductService.list({
          page: params?.page ?? page,
          limit: params?.limit ?? limit,
          search: params?.search ?? search,
          status: 1,
        });

        setData(res.data.data);
        setPage(res.data.page);
        setLimit(res.data.limit);
        setTotal(res.data.total);
      } catch {
        toast.error("Không tải được danh sách sản phẩm!");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, toast]
  );

  useEffect(() => {
    fetchProducts({ page: 1 });
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await ProductService.delete(id);
      toast.success("Đã xóa sản phẩm");

      fetchProducts({
        page: data.length === 1 && page > 1 ? page - 1 : page,
      });
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  /* ================= COLUMNS ================= */
  const columns: ColumnsType<Product> = useMemo(
    () => [
      {
        title: "STT",
        width: 60,
        align: "center",
        render: (_v, _r, index) => (page - 1) * limit + index + 1,
      },
      {
        title: "Ảnh",
        dataIndex: "thumbnail",
        width: 80,
        render: (src) => (
          <Image
            width={60}
            height={60}
            style={{ objectFit: "cover" }}
            src={
              src
                ? `${IMAGE_BASE}${src.startsWith("/") ? src : "/" + src}`
                : "/no-image.png"
            }
          />
        ),
      },
      { title: "Tên", dataIndex: "name" },
      { title: "SKU", dataIndex: "sku", render: (v) => v || "-" },
      {
        title: "Danh mục",
        dataIndex: "category",
        render: (c) => (c ? <Tag color="blue">{c.name}</Tag> : "-"),
      },
      {
        title: "Brand",
        dataIndex: "brand",
        render: (b) => (b ? <Tag color="green">{b.name}</Tag> : "-"),
      },
      {
        title: "Giá",
        dataIndex: "price",
        render: (v) => v.toLocaleString() + " đ",
      },
      {
        title: "Sale",
        dataIndex: "sale_price",
        render: (v) =>
          v ? <Tag color="red">{v.toLocaleString()} đ</Tag> : "-",
      },
      { title: "Kho", dataIndex: "stock" },
      {
        title: "Thao tác",
        width: 160,
        render: (_v, r) => (
          <Space>
            <Button
              type="link"
              onClick={() => router.push(`/admin/products/${r.id}/show`)}
            >
              Xem
            </Button>
            <Button
              type="link"
              onClick={() => router.push(`/admin/products/${r.id}/edit`)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Bạn có chắc muốn xóa?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDelete(r.id)}
            >
              <Button type="link" danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [page, limit, data.length, router, toast]
  );

  /* ================= RENDER ================= */
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>

        <div className="flex gap-2">
          <Input.Search
            placeholder="Tìm sản phẩm..."
            allowClear
            style={{ width: 220 }}
            onSearch={(v) => {
              setSearch(v);
              fetchProducts({ page: 1, search: v });
            }}
          />
          <Button
            type="primary"
            onClick={() => router.push("/admin/products/add")}
          >
            + Thêm
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        bordered
        size="small"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(p, l) => fetchProducts({ page: p, limit: l })}
          onShowSizeChange={(_, l) => fetchProducts({ page: 1, limit: l })}
          showTotal={(t, r) => `${r[0]}-${r[1]} trên ${t} sản phẩm`}
        />
      </div>
    </div>
  );
}
