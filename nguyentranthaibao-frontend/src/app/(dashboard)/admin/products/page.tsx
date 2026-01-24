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
  Select,
  InputNumber,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import ProductService from "@/services/ProductService";
import api from "@/services/api";
import { useToast } from "@/context/ToastProvider";

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

interface Option {
  id: number;
  name: string;
}

/* ================= COMPONENT ================= */
export default function ProductList() {
  const router = useRouter();
  const toast = useToast();

  /* ===== DATA ===== */
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  /* ===== FILTER ===== */
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandId, setBrandId] = useState<number | undefined>();
  const [priceFrom, setPriceFrom] = useState<number | undefined>();
  const [priceTo, setPriceTo] = useState<number | undefined>();

  /* ===== OPTIONS ===== */
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  /* ================= FETCH OPTIONS ================= */
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
    api.get("/brands").then((res) => setBrands(res.data.data));
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = useCallback(
    async (p = page, l = limit) => {
      try {
        setLoading(true);

        const res = await ProductService.list({
          page: p,
          limit: l,
          search,
          category_id: categoryId,
          brand_id: brandId,
          price_from: priceFrom,
          price_to: priceTo,
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
    [page, limit, search, categoryId, brandId, priceFrom, priceTo, toast]
  );

  /* 🔥 FIX DELAY: gọi API khi FILTER THAY ĐỔI */
  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryId, brandId, priceFrom, priceTo]);

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await ProductService.delete(id);
      toast.success("Đã xóa sản phẩm");

      fetchProducts(data.length === 1 && page > 1 ? page - 1 : page);
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
            <Button type="link" onClick={() => router.push(`/admin/products/${r.id}/show`)}>
              Xem
            </Button>
            <Button type="link" onClick={() => router.push(`/admin/products/${r.id}/edit`)}>
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
    [page, limit, data.length, router]
  );

  /* ================= RENDER ================= */
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Danh sách sản phẩm</h2>

      {/* ===== FILTER BAR ===== */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input.Search
          placeholder="Tìm sản phẩm..."
          allowClear
          style={{ width: 220 }}
          onSearch={(v) => setSearch(v)}
        />

        <Select
          allowClear
          placeholder="Danh mục"
          style={{ width: 180 }}
          onChange={(v) => setCategoryId(v)}
        >
          {categories.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          allowClear
          placeholder="Brand"
          style={{ width: 160 }}
          onChange={(v) => setBrandId(v)}
        >
          {brands.map((b) => (
            <Select.Option key={b.id} value={b.id}>
              {b.name}
            </Select.Option>
          ))}
        </Select>

        <InputNumber
          placeholder="Giá từ"
          min={0}
          onChange={(v) => setPriceFrom(v ?? undefined)}
        />

        <InputNumber
          placeholder="Giá đến"
          min={0}
          onChange={(v) => setPriceTo(v ?? undefined)}
        />

        <Button onClick={() => router.push("/admin/products/add")}>
          + Thêm
        </Button>
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
          onChange={(p, l) => fetchProducts(p, l)}
          onShowSizeChange={(_, l) => fetchProducts(1, l)}
          showTotal={(t, r) => `${r[0]}-${r[1]} trên ${t} sản phẩm`}
        />
      </div>
    </div>
  );
}
