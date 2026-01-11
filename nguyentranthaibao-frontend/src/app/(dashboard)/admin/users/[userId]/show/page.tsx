"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Spin,
} from "antd";
import type { TableProps } from "antd/es/table";

import UserService, { User as UserAPI } from "@/services/UserService";
import AddressService, { Address as AddressAPI } from "@/services/AddressService";
import { useToast } from "@/context/ToastProvider"; // ✅ sử dụng toast

const { Option } = Select;

export default function UserShowPage() {
  const params = useParams();
  const userId = Number(params.userId);
  const toast = useToast(); // ✅ hook toast

  const [user, setUser] = useState<UserAPI | null>(null);
  const [addresses, setAddresses] = useState<AddressAPI[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressAPI | null>(null);
  const [form] = Form.useForm<Omit<AddressAPI, "id" | "user_id" | "created_at" | "updated_at">>();

  // --- Lấy user ---
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const res = await UserService.detail(userId);
        setUser(res);
      } catch {
        toast.error("Lấy thông tin user thất bại!"); // ✅ toast
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [userId, toast]);

  // --- Lấy danh sách địa chỉ ---
  const fetchAddresses = async () => {
    if (!userId) return;
    try {
      setLoadingAddress(true);
      const res = await AddressService.list({ user_id: userId });
      setAddresses(res.data);
    } catch {
      toast.error("Lấy địa chỉ thất bại!"); // ✅ toast
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  // --- Modal thêm/sửa ---
  const openAddModal = () => {
    form.resetFields();
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressAPI) => {
    form.setFieldsValue(addr);
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa địa chỉ này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await AddressService.delete(id);
          toast.success("Xóa địa chỉ thành công!"); // ✅ toast
          fetchAddresses();
        } catch {
          toast.error("Xóa địa chỉ thất bại!"); // ✅ toast
        }
      },
    });
  };

  const handleSubmit = async (
    values: Omit<AddressAPI, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    if (!userId) return;
    try {
      if (editingAddress) {
        await AddressService.update(editingAddress.id, values);
        toast.success("Cập nhật địa chỉ thành công!"); // ✅ toast
      } else {
        await AddressService.create({ ...values, user_id: userId });
        toast.success("Thêm địa chỉ thành công!"); // ✅ toast
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch {
      toast.error("Lưu địa chỉ thất bại!"); // ✅ toast
    }
  };

  const columns: TableProps<AddressAPI>["columns"] = [
    { title: "Tên", dataIndex: "fullname", key: "fullname", align: "center" },
    { title: "Điện thoại", dataIndex: "phone", key: "phone", align: "center" },
    { title: "Địa chỉ", dataIndex: "address_line", key: "address_line", align: "center" },
    { title: "Thành phố", dataIndex: "city", key: "city", align: "center" },
    { title: "Quận/Huyện", dataIndex: "district", key: "district", align: "center" },
    { title: "Phường/Xã", dataIndex: "ward", key: "ward", align: "center" },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type: "shipping" | "billing" | null) => (
        <Tag color={type === "shipping" ? "blue" : "green"}>{type}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_: unknown, record: AddressAPI) => (
        <Space>
          <Button type="default" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (!userId) return <p>Không tìm thấy user ID!</p>;

  return (
    <div className="p-6">
      {loadingUser ? (
        <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
      ) : user ? (
        <>
          <Card title={`Chi tiết người dùng #${user.id}`} className="mb-6">
            <p>
              <strong>Tên:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Điện thoại:</strong> {user.phone}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </Card>

          <Card
            title="Địa chỉ"
            extra={<Button type="primary" onClick={openAddModal}>Thêm địa chỉ</Button>}
          >
            <Spin spinning={loadingAddress}>
              <Table
                dataSource={addresses}
                columns={columns}
                rowKey="id"
                bordered
                pagination={false}
              />
            </Spin>
          </Card>

          <Modal
            title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Tên"
                name="fullname"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Điện thoại"
                name="phone"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ"
                name="address_line"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Thành phố"
                name="city"
                rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Quận/Huyện"
                name="district"
                rules={[{ required: true, message: "Vui lòng nhập quận/huyện!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Phường/Xã"
                name="ward"
                rules={[{ required: true, message: "Vui lòng nhập phường/xã!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Loại"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại địa chỉ!" }]}
              >
                <Select>
                  <Option value="shipping">Shipping</Option>
                  <Option value="billing">Billing</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                  <Button type="primary" htmlType="submit">
                    {editingAddress ? "Cập nhật" : "Thêm"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </>
      ) : (
        <p>Không tìm thấy user!</p>
      )}
    </div>
  );
}
