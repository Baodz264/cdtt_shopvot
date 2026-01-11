"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Space,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { VoucherService } from "@/services/VoucherService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const { Option } = Select;

interface Voucher {
  id: number;
  code: string;
  name: string;
  type: "percent" | "fixed";
  discount_value: number;
  max_discount?: number;
  min_order: number;
  quantity: number;
  used: number;
  start_date: string;
  end_date: string;
  status: number;
}

export default function VoucherListPage() {
  const toast = useToast(); // <-- dùng useToast hook
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const [form] = Form.useForm();

  // ------------------- Load voucher -------------------
  useEffect(() => {
    fetchVouchers(pagination.current, pagination.pageSize);
  }, []);

  const fetchVouchers = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      const res = await VoucherService.list({ page, limit });
      setVouchers(res.data);
      setPagination(prev => ({ ...prev, total: res.total, current: page }));
    } catch (error) {
      console.error(error);
      toast.error("Lấy danh sách voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Modal -------------------
  const openAddModal = () => {
    form.resetFields();
    setEditingVoucher(null);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    form.setFieldsValue({
      ...voucher,
      start_date: dayjs(voucher.start_date),
      end_date: dayjs(voucher.end_date),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        start_date: values.start_date.format("YYYY-MM-DD"),
        end_date: values.end_date.format("YYYY-MM-DD"),
      };

      if (editingVoucher) {
        await VoucherService.update(editingVoucher.id, payload);
        toast.success("Voucher đã được cập nhật");
      } else {
        await VoucherService.create(payload);
        toast.success("Voucher mới đã được thêm");
      }

      setIsModalOpen(false);
      fetchVouchers(pagination.current, pagination.pageSize);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Lưu voucher thất bại");
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa voucher này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await VoucherService.delete(id);
          toast.success("Đã xóa voucher");
          fetchVouchers(pagination.current, pagination.pageSize);
        } catch (error: unknown) {
          console.error(error);
          toast.error("Xóa voucher thất bại");
        }
      },
    });
  };

  // ------------------- Columns Table -------------------
  const columns = [
    { title: "Mã", dataIndex: "code", key: "code" },
    { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: "percent" | "fixed") => (
        <Tag color={type === "percent" ? "green" : "blue"}>
          {type === "percent" ? "Giảm %" : "Giảm cố định"}
        </Tag>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_value",
      key: "discount_value",
      render: (_value: number, record: Voucher) =>
        record.discount_value + (record.type === "percent" ? "%" : "đ"),
    },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Đã dùng", dataIndex: "used", key: "used" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) =>
        status ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngưng</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: Voucher) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => openEditModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="primary"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // ------------------- Render -------------------
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Danh sách Voucher</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={openAddModal}
        className="mb-4"
      >
        Thêm Voucher
      </Button>

      <Table
        columns={columns}
        dataSource={vouchers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchVouchers(page, pageSize),
        }}
      />

      <Modal
        title={editingVoucher ? "Chỉnh sửa Voucher" : "Thêm Voucher"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã voucher"
                name="code"
                rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tên voucher"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên voucher" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Loại" name="type" initialValue="percent">
                <Select>
                  <Option value="percent">Giảm %</Option>
                  <Option value="fixed">Giảm cố định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giá trị giảm"
                name="discount_value"
                rules={[{ required: true, message: "Nhập giá trị giảm" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giảm tối đa" name="max_discount">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Đơn tối thiểu"
                name="min_order"
                rules={[{ required: true, message: "Nhập đơn tối thiểu" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Nhập số lượng" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status" initialValue={1}>
                <Select>
                  <Option value={1}>Hoạt động</Option>
                  <Option value={0}>Ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="start_date"
                rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="end_date"
                rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
