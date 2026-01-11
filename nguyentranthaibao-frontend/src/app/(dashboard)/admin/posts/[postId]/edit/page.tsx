"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

import PostService, { Post } from "@/services/PostService";
import TopicService, { Topic } from "@/services/TopicService";
import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000";
const { TextArea } = Input;

interface PostFormValues {
  title: string;
  topic_id?: number;
  excerpt?: string;
  content: string;
  status: boolean;
}

export default function EditPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const toast = useToast();
  const [form] = Form.useForm<PostFormValues>();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetchTopics();
    fetchPost();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await TopicService.list();
      setTopics(res.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách topic");
    }
  };

  const fetchPost = async () => {
    try {
      const res = await PostService.detail(Number(postId));
      const post: Post = res.data;

      form.setFieldsValue({
        title: post.title,
        topic_id: post.topic_id,
        excerpt: post.excerpt,
        content: post.content,
        status: Boolean(post.status),
      });

      if (post.image) {
        setImageFile({
          uid: "-1",
          name: "image.png",
          status: "done",
          url: `${IMAGE_BASE}/${post.image.replace(/^\/?uploads\//, "uploads/")}`,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Không tải được bài viết!");
    }
  };

  /* ================= SUBMIT ================= */
  const onFinish = async (values: PostFormValues) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("content", values.content);
      formData.append("status", values.status ? "1" : "0");

      if (values.topic_id) formData.append("topic_id", values.topic_id.toString());
      if (values.excerpt) formData.append("excerpt", values.excerpt);
      if (imageFile?.originFileObj) formData.append("image", imageFile.originFileObj);

      await PostService.update(Number(postId), formData);
      toast.success("Cập nhật bài viết thành công!");
      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="✏️ Chỉnh sửa bài viết">
      <Form<PostFormValues> layout="vertical" form={form} onFinish={onFinish}>
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
            fileList={imageFile ? [imageFile] : []}
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
            Cập nhật
          </Button>
          <Button className="ml-2" onClick={() => router.back()}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
