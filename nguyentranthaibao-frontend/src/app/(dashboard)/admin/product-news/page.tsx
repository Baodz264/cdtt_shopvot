"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Select,
  Space,
  Input,
} from "antd";
import dayjs from "dayjs";

import ProductNewService, {
  ProductNewPayload,
} from "@/services/ProductNewService";
import ProductService from "@/services/ProductService";
import { useToast } from "@/context/ToastProvider";

/* ================= TYPES ================= */
interface Product {
  id: number;
  name: string;
}

interface ProductNew {
  id: number;
  product_id: number;
  product_name: string;
  created_at: string;
}

interface ProductNewResponse {
  id: number;
  product_id: number;
  created_at: string;
}

interface FormValues {
  product_id: number;
}

/* ================= COMPONENT ================= */
export default function ProductNewManager() {
  const toast = useToast();
  const [form] = Form.useForm<FormValues>();

  const [data, setData] = useState<ProductNew[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductNew | null>(null);
  const [searchText, setSearchText] = useState("");

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

  /* ================= LOAD PRODUCT NEWS ================= */
  const loadData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchText
  ) => {
    try {
      setLoading(true);

      const res = await ProductNewService.list({
        page,
        limit: pageSize,
        search: search || undefined,
      });

      const productMap = new Map<number, string>();
      products.forEach((p) => productMap.set(p.id, p.name));

      const mappedData: ProductNew[] = (
        res.data.data as ProductNewResponse[]
      ).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: productMap.get(item.product_id) || "Unknown",
        created_at: item.created_at,
      }));

      setData(mappedData);
      setPagination({
        current: page,
        pageSize,
        total: res.data.total, // backend trả total
      });
    } catch {
      toast.error("Không tải được danh sách sản phẩm mới");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      loadData(1, pagination.pageSize);
    }
  }, [products]);

  /* ================= MODAL ================= */
  const openModal = (item?: ProductNew) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue({ product_id: item.product_id });
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload: ProductNewPayload = {
        product_id: values.product_id,
      };

      if (editingItem) {
        await ProductNewService.update(editingItem.id, payload);
        toast.success("Cập nhật sản phẩm mới thành công");
      } else {
        await ProductNewService.create(payload);
        toast.success("Thêm sản phẩm mới thành công");
      }

      setModalVisible(false);
      setEditingItem(null);
      loadData(pagination.current, pagination.pageSize);
    } catch {
      toast.error("Lỗi khi lưu sản phẩm mới");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    try {
      await ProductNewService.delete(id);
      toast.success("Xóa sản phẩm mới thành công");
      loadData(pagination.current, pagination.pageSize);
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "ID", dataIndex: "id", width: 70 },
    { title: "Tên sản phẩm", dataIndex: "product_name" },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      render: (_: unknown, record: ProductNew) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
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

  /* ================= RENDER ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input.Search
          placeholder="Tìm kiếm theo tên sản phẩm"
          allowClear
          enterButton
          style={{ width: 300 }}
          onSearch={(value) => {
            setSearchText(value);
            loadData(1, pagination.pageSize, value);
          }}
        />

        <Button type="primary" onClick={() => openModal()}>
          Thêm sản phẩm mới
        </Button>
      </div>

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
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (page, pageSize) => loadData(page, pageSize),
        }}
      />

      <Modal
        title={editingItem ? "Sửa sản phẩm mới" : "Thêm sản phẩm mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Sản phẩm"
            name="product_id"
            rules={[{ required: true, message: "Chọn sản phẩm" }]}
          >
            <Select placeholder="Chọn sản phẩm">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
