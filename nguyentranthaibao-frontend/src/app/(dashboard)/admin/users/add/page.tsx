"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Button, Upload, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import UserService from "@/services/UserService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const { Option } = Select;

interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  password: string;
}

export default function UserAddPage() {
  const router = useRouter();
  const toast = useToast(); // <-- hook toast
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("role", values.role);
      formData.append("password", values.password);
      formData.append("status", "1");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await UserService.create(formData);

      toast.success("Thêm người dùng thành công!"); // <-- toast success
      router.push("/admin/users");
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi tạo người dùng!"); // <-- toast error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <Card title="Thêm người dùng" className="w-full max-w-md">
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Tên" name="name" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Điện thoại"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item label="Vai trò" name="role" initialValue="customer">
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              beforeUpload={(file) => {
                setAvatarFile(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Thêm
          </Button>
        </Form>
      </Card>
    </div>
  );
}
