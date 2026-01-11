"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Switch,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import PostService from "@/services/PostService";
import TopicService, { Topic } from "@/services/TopicService";
import AuthService from "@/services/AuthService";
import { User } from "@/services/UserService";
import { useToast } from "@/context/ToastProvider";

const { TextArea } = Input;

interface PostFormValues {
  title: string;
  topic_id?: number;
  excerpt?: string;
  content: string;
  status: boolean;
}

export default function AddPostPage() {
  const router = useRouter();
  const toast = useToast(); // <-- Dùng toast thay message
  const [form] = Form.useForm<PostFormValues>();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);

  // ---- Thêm state user ----
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Lấy danh sách topic
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await TopicService.list();
        setTopics(res.data ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được danh sách topic");
      }
    };
    fetchTopics();
  }, [toast]);

  // Lấy thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.me();
        setUser(res);
      } catch {
        toast.error("Không thể lấy thông tin người dùng");
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router, toast]);

  const onFinish = async (values: PostFormValues) => {
    if (!user?.id) {
      toast.error("Chưa đăng nhập");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("type", "post");
      formData.append("status", values.status ? "1" : "0");
      formData.append("user_id", user.id.toString());

      if (values.topic_id) formData.append("topic_id", values.topic_id.toString());
      if (values.excerpt) formData.append("excerpt", values.excerpt);
      if (imageFile?.originFileObj) formData.append("image", imageFile.originFileObj);

      await PostService.create(formData);
      toast.success("Thêm bài viết thành công!");
      router.push("/admin/posts");
    } catch (err) {
      console.error(err);
      toast.error("Thêm bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card title="➕ Thêm bài viết">
      <Form<PostFormValues>
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{ status: true }}
      >
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="topic_id" label="Topic">
          <Select
            allowClear
            placeholder="Chọn topic"
            options={topics.map((t) => ({ value: t.id, label: t.name }))}
          />
        </Form.Item>

        <Form.Item name="excerpt" label="Mô tả ngắn">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
          <TextArea rows={6} />
        </Form.Item>

        <Form.Item label="Ảnh đại diện">
          <Upload
            maxCount={1}
            beforeUpload={() => false}
            onChange={({ fileList }) => setImageFile(fileList[0] || null)}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="status" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu
          </Button>
          <Button className="ml-2" onClick={() => router.back()}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
