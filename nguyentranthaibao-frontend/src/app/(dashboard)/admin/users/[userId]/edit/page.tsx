"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Select, Button, Upload, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import UserService, { User } from "@/services/UserService";
import { useToast } from "@/context/ToastProvider"; // <-- import toast

const { Option } = Select;

interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function UserEditPage() {
  const { userId } = useParams();
  const uid = Number(userId);

  const router = useRouter();
  const toast = useToast(); // <-- hook toast
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  // ---- LOAD DATA ----
  useEffect(() => {
    (async () => {
      try {
        const data: User = await UserService.detail(uid);

        form.setFieldsValue({
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
        });
      } catch (err) {
        console.error(err);
        toast.error("Không tải được thông tin người dùng!"); // <-- toast error
      }
    })();
  }, [uid, form, toast]);

  // ---- SUBMIT FORM ----
  const handleSubmit = async (values: UserFormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("role", values.role);
      formData.append("status", "1");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await UserService.update(uid, formData);

      toast.success("Cập nhật người dùng thành công!"); // <-- toast success
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật người dùng!"); // <-- toast error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <Card title="Chỉnh sửa người dùng" className="w-full max-w-md">
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="customer">Customer</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Avatar mới (nếu đổi)">
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
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
    </div>
  );
}
