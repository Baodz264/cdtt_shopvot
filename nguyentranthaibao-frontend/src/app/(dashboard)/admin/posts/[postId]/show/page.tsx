"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Spin,
  Upload,
  Image,
  Tag,
  Card,
  Descriptions,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import PostService, { Post } from "@/services/PostService";
import PostImageService, { PostImage } from "@/services/PostImageService";
import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000";

/* ===== HELPER URL ẢNH ===== */
const getImageUrl = (path?: string) => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}/${path.replace(/^\/+/, "")}`;
};

export default function ShowPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [gallery, setGallery] = useState<PostImage[]>([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!postId) return;

    (async () => {
      try {
        setLoading(true);

        const postRes = await PostService.detail(Number(postId));
        setPost(postRes.data);

        const galleryRes = await PostImageService.list({
          post_id: Number(postId),
        });
        setGallery(galleryRes.data.data);
      } catch {
        toast.error("Không tải được dữ liệu bài viết");
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  /* ================= UPDATE MAIN IMAGE ================= */
  const uploadMainImage = async (file: File) => {
    if (!post) return false;

    try {
      const form = new FormData();
      form.append("image", file);

      const res = await PostService.update(post.id, form);

      setPost(prev =>
        prev ? { ...prev, image: res.data.image } : prev
      );

      toast.success("Đã cập nhật ảnh chính");
    } catch {
      toast.error("Cập nhật ảnh thất bại");
    }

    return false; // chặn auto upload của AntD
  };

  /* ================= ADD GALLERY ================= */
  const uploadGalleryImage = async (file: File) => {
    try {
      const form = new FormData();
      form.append("post_id", String(postId));
      form.append("image", file);

      const res = await PostImageService.create(form);
      setGallery(prev => [res.data, ...prev]);

      toast.success("Đã thêm ảnh");
    } catch {
      toast.error("Upload ảnh thất bại");
    }

    return false;
  };

  /* ================= DELETE GALLERY ================= */
  const deleteGalleryImage = async (id: number) => {
    try {
      await PostImageService.delete(id);
      setGallery(prev => prev.filter(img => img.id !== id));
      toast.success("Đã xoá ảnh");
    } catch {
      toast.error("Xoá ảnh thất bại");
    }
  };

  /* ================= LOADING ================= */
  if (loading || !post) {
    return (
      <div className="flex justify-center mt-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chi tiết bài viết</h1>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/admin/posts")}
        >
          Quay lại
        </Button>
      </div>

      {/* ===== MAIN INFO ===== */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IMAGE */}
          <div>
            <Image
              src={getImageUrl(post.image)}
              style={{
                width: "100%",
                height: 300,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />

            <Upload showUploadList={false} beforeUpload={uploadMainImage}>
              <Button icon={<UploadOutlined />} className="mt-3">
                Đổi ảnh chính
              </Button>
            </Upload>
          </div>

          {/* INFO */}
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tiêu đề">
              {post.title}
            </Descriptions.Item>
            <Descriptions.Item label="Slug">
              {post.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Topic">
              {post.topic ? <Tag color="blue">{post.topic.name}</Tag> : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tác giả">
              {post.user ? <Tag color="green">{post.user.name}</Tag> : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={post.status ? "success" : "error"}>
                {post.status ? "Hiển thị" : "Ẩn"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Lượt xem">
              {post.views ?? 0}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      {/* ===== CONTENT ===== */}
      <Card title="Nội dung">
        <div className="prose max-w-full">{post.content}</div>
      </Card>

      {/* ===== GALLERY ===== */}
      <Card
        title="Gallery ảnh"
        extra={
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={uploadGalleryImage}
          >
            <Button type="dashed" icon={<PlusOutlined />}>
              Thêm nhiều ảnh
            </Button>
          </Upload>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map(img => (
            <div
              key={img.id}
              className="relative group"
              style={{
                height: 180,
                overflow: "hidden",
                borderRadius: 8,
              }}
            >
              <Image
                src={getImageUrl(img.image)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => deleteGalleryImage(img.id)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
