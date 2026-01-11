"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Select, Button, Card } from "antd";
import { AxiosError } from "axios";
import TopicService, { Topic } from "@/services/TopicService";
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

export default function EditTopicPage() {
  const { topicId } = useParams();
  const router = useRouter();
  const toast = useToast(); // <-- sử dụng toast
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<TopicFormValues>();

  // Load dữ liệu Topic
  useEffect(() => {
    if (!topicId) return;

    (async () => {
      try {
        const data: Topic = await TopicService.detail(Number(topicId));
        form.setFieldsValue({
          name: data.name,
          slug: data.slug || "",
          status: data.status ?? 1,
        });
      } catch {
        toast.error("Không tải được dữ liệu Topic");
      }
    })();
  }, [topicId, form, toast]);

  const handleSubmit = async (values: TopicFormValues) => {
    try {
      setLoading(true);

      await TopicService.update(Number(topicId), {
        name: values.name,
        slug: values.slug,
        status: values.status,
      });

      toast.success("Cập nhật Topic thành công!");
      router.push("/admin/topics");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card
        title={`Chỉnh sửa Topic #${topicId}`}
        className="w-full max-w-lg p-6 shadow-md"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <Input />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Select.Option value={1}>Hiển thị</Select.Option>
              <Select.Option value={0}>Ẩn</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
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
