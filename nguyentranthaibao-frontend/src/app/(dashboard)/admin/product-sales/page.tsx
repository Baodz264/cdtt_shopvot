"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Select,
  InputNumber,
  Switch,
  DatePicker,
  Tag,
  Space,
  Input,
  Row,
  Col,
  Divider,
} from "antd";
import dayjs from "dayjs";

import ProductSaleService, {
  ProductSalePayload,
  ProductSaleListParams,
} from "@/services/ProductSaleService";
import ProductService from "@/services/ProductService";
import { useToast } from "@/context/ToastProvider";

/* ================= TYPES ================= */
interface Product {
  id: number;
  name: string;
  price: number;
}

interface ProductSale {
  id: number;
  product_id: number;
  original_price: number;
  sale_price: number;
  start_date: string | null;
  end_date: string | null;
  status: boolean;
  created_at: string;
  product: Product;
}

interface FormValues {
  product_id: number;
  original_price: number;
  sale_price: number;
  status: boolean;
  date?: [dayjs.Dayjs, dayjs.Dayjs];
}

/* ================= COMPONENT ================= */
export default function ProductSaleManager() {
  const toast = useToast();
  const [form] = Form.useForm<FormValues>();

  const [data, setData] = useState<ProductSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSale, setEditingSale] = useState<ProductSale | null>(null);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState<ProductSaleListParams>({
    page: 1,
    limit: 10,
    sort_by: "id",
    sort_order: "desc",
  });

  /* ================= PAGINATION ================= */
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* ================= LOAD PRODUCTS ================= */
  const loadProducts = async () => {
    try {
      const res = await ProductService.list({ status: 1, limit: 1000 });
      setProducts(res.data.data);
    } catch {
      toast.error("Không tải được danh sách sản phẩm");
    }
  };

  /* ================= LOAD DATA ================= */
  const loadData = async (params?: Partial<ProductSaleListParams>) => {
    try {
      setLoading(true);

      const finalParams = {
        ...filters,
        ...params,
      };

      const res = await ProductSaleService.list(finalParams);

      setData(res.data.data);

      setPagination({
        current: res.data.current_page,
        pageSize: res.data.per_page,
        total: res.data.total,
      });

      setFilters(finalParams);
    } catch {
      toast.error("Không tải được danh sách sản phẩm sale");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadData();
  }, []);

  /* ================= MODAL ================= */
  const openModal = () => {
    setEditingSale(null);
    form.resetFields();
    form.setFieldsValue({ status: true });
    setModalVisible(true);
  };

  const openEditModal = (sale: ProductSale) => {
    setEditingSale(sale);
    form.setFieldsValue({
      product_id: sale.product_id,
      original_price: sale.original_price,
      sale_price: sale.sale_price,
      status: sale.status,
      date:
        sale.start_date && sale.end_date
          ? [dayjs(sale.start_date), dayjs(sale.end_date)]
          : undefined,
    });
    setModalVisible(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (values: FormValues) => {
    setLoading(true);

    const payload: ProductSalePayload = {
      product_id: values.product_id,
      original_price: values.original_price,
      sale_price: values.sale_price,
      status: values.status,
      start_date: values.date?.[0]?.format("YYYY-MM-DD") || null,
      end_date: values.date?.[1]?.format("YYYY-MM-DD") || null,
    };

    try {
      if (editingSale) {
        await ProductSaleService.update(editingSale.id, payload);
        toast.success("Cập nhật sản phẩm sale thành công");
      } else {
        await ProductSaleService.create(payload);
        toast.success("Thêm sản phẩm sale thành công");
      }

      setModalVisible(false);
      setEditingSale(null);
      loadData();
    } catch {
      toast.error("Lỗi khi lưu sản phẩm sale");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await ProductSaleService.delete(id);
      toast.success("Xóa sản phẩm sale thành công");
      loadData();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    {
      title: "Sản phẩm",
      render: (_: unknown, r: ProductSale) => r.product?.name,
    },
    {
      title: "Giá gốc",
      render: (_: unknown, r: ProductSale) =>
        r.original_price.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Giá sale",
      render: (_: unknown, r: ProductSale) =>
        r.sale_price.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Giảm",
      render: (_: unknown, r: ProductSale) => {
        const percent = Math.round(
          ((r.original_price - r.sale_price) / r.original_price) * 100
        );
        return <Tag color="red">-{percent}%</Tag>;
      },
    },
    {
      title: "Thời gian",
      render: (_: unknown, r: ProductSale) =>
        r.start_date && r.end_date ? (
          `${dayjs(r.start_date).format("DD/MM/YYYY")} → ${dayjs(
            r.end_date
          ).format("DD/MM/YYYY")}`
        ) : (
          <Tag color="blue">Không giới hạn</Tag>
        ),
    },
    {
      title: "Trạng thái",
      render: (_: unknown, r: ProductSale) =>
        r.status ? <Tag color="green">Bật</Tag> : <Tag>Ẩn</Tag>,
    },
    {
      title: "Hành động",
      render: (_: unknown, r: ProductSale) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(r)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(r.id)}
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <div className="p-6">
      {/* FILTER */}
      <Row gutter={12} className="mb-4">
        <Col span={6}>
          <Input.Search
            placeholder="Tìm sản phẩm"
            allowClear
            onSearch={(v) => loadData({ search: v, page: 1 })}
          />
        </Col>

        <Col span={4}>
          <Select
            allowClear
            placeholder="Trạng thái"
            className="w-full"
            onChange={(v) => loadData({ status: v, page: 1 })}
          >
            <Select.Option value={1}>Bật</Select.Option>
            <Select.Option value={0}>Ẩn</Select.Option>
          </Select>
        </Col>

        <Col span={4}>
          <Select
            placeholder="Sắp xếp"
            className="w-full"
            defaultValue="id"
            // Sửa lỗi tại đây bằng cách ép kiểu value
            onChange={(v: ProductSaleListParams["sort_by"]) => loadData({ sort_by: v })}
          >
            <Select.Option value="id">ID</Select.Option>
            <Select.Option value="sale_price">Giá sale</Select.Option>
            <Select.Option value="sale_percent">% giảm</Select.Option>
            <Select.Option value="created_at">Ngày tạo</Select.Option>
          </Select>
        </Col>

        <Col span={4}>
          <Select
            placeholder="Thứ tự"
            className="w-full"
            defaultValue="desc"
            // Sửa lỗi tại đây bằng cách ép kiểu value
            onChange={(v: ProductSaleListParams["sort_order"]) => loadData({ sort_order: v })}
          >
            <Select.Option value="asc">Tăng dần</Select.Option>
            <Select.Option value="desc">Giảm dần</Select.Option>
          </Select>
        </Col>

        <Col span={6} className="text-right">
          <Button type="primary" onClick={openModal}>
            Thêm sản phẩm sale
          </Button>
        </Col>
      </Row>

      <Divider />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) =>
            loadData({ page, limit: pageSize }),
        }}
      />

      {/* MODAL */}
      <Modal
        title={editingSale ? "Cập nhật sản phẩm sale" : "Thêm sản phẩm sale"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Sản phẩm"
            name="product_id"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              onChange={(id: number) => {
                const p = products.find((x) => x.id === id);
                if (p) form.setFieldValue("original_price", p.price);
              }}
            >
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Giá gốc" name="original_price">
            <InputNumber className="w-full" disabled />
          </Form.Item>

          <Form.Item
            label="Giá sale"
            name="sale_price"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item label="Thời gian hiệu lực" name="date">
            <DatePicker.RangePicker className="w-full" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}