"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Select, Button, Card } from "antd";
import { AxiosError } from "axios";
import TopicService from "@/services/TopicService";
import { useToast } from "@/context/ToastProvider";

interface TopicFormValues {
  name: string;
  slug: string;
  status: number;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export default function AddTopicPage() {
  const router = useRouter();
  const toast = useToast(); // <-- Sử dụng toast
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<TopicFormValues>();

  const handleSubmit = async (values: TopicFormValues) => {
    try {
      setLoading(true);

      await TopicService.create({
        name: values.name,
        slug: values.slug,
        status: values.status,
      });

      toast.success("Thêm Topic thành công!");
      router.push("/admin/topics");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Thêm Topic thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card title="Thêm Topic" className="w-full max-w-lg p-6 shadow-md">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 1 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên Topic" }]}
          >
            <Input
              placeholder="Nhập tên Topic"
              onChange={(e) =>
                form.setFieldsValue({
                  slug: generateSlug(e.target.value),
                })
              }
            />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}
          >
            <Input placeholder="Slug tự động" />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Select.Option value={1}>Hiển thị</Select.Option>
              <Select.Option value={0}>Ẩn</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu
            </Button>
            <Button
              className="ml-2"
              onClick={() => router.push("/admin/topics")}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
