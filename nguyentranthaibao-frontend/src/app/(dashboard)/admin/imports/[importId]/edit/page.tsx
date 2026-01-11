"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Input, Button, Card, Select, Spin } from "antd";
import ImportService from "@/services/ImportService";
import UserService, { User } from "@/services/UserService";
import { useToast } from "@/context/ToastProvider";

export default function ImportEditPage() {
  const { importId } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [form] = Form.useForm();

  // Load danh sách user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UserService.list({ role: "admin", limit: 100 });
        setUsers(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Không thể lấy danh sách người dùng");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // Load dữ liệu import
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ImportService.get(Number(importId));
        form.setFieldsValue({
          user_id: data.user_id,
          note: data.note,
        });
      } catch (error) {
        console.error(error);
        toast.error("Không tải được dữ liệu import!");
      }
    };
    fetchData();
  }, [importId, form, toast]);

  const onFinish = async (values: { user_id: number; note: string }) => {
    try {
      setLoading(true);
      await ImportService.update(Number(importId), {
        user_id: values.user_id,
        note: values.note,
      });
      toast.success("Cập nhật import thành công!");
      router.push("/admin/imports");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center">
      <Card
        title={`Chỉnh sửa Import #${importId}`}
        className="w-full max-w-lg shadow-md"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Người tạo"
            name="user_id"
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
          >
            <Select
              placeholder="Chọn người dùng"
              options={users.map((u) => ({
                value: u.id,
                label: u.name || u.email,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Ghi chú"
            name="note"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
          >
            Cập nhật
          </Button>
        </Form>
      </Card>
    </div>
  );
}
