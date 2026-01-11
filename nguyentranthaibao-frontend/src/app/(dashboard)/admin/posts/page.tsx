"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Space, Popconfirm, Input, Pagination, Tag, Card, Modal } from "antd";
import PostService, { Post, PostListResponse } from "@/services/PostService";
import { useToast } from "@/context/ToastProvider";

const IMAGE_BASE = "http://localhost:8000";

export default function PostsPage() {
  const router = useRouter();
  const toast = useToast(); // <-- dùng toast thay message

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  // Modal xem ảnh
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const showPreview = (src: string) => {
    setPreviewImage(src);
    setPreviewVisible(true);
  };

  const fetchPosts = useCallback(
    async (page = 1, limit = pageSize, keyword = search) => {
      try {
        setLoading(true);
        const res = await PostService.list({ page, limit, search: keyword, type: "post" });
        const data: PostListResponse = res.data;

        setPosts(data.data);
        setTotal(data.total);
        setCurrentPage(data.page);
        setPageSize(data.limit);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được danh sách bài viết!");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, search, toast]
  );

  useEffect(() => {
    fetchPosts(1, pageSize);
  }, [fetchPosts, pageSize]);

  const toggleStatus = async (post: Post) => {
    try {
      const newStatus = post.status ? 0 : 1;
      const formData = new FormData();
      formData.append("status", newStatus.toString());
      await PostService.update(post.id!, formData);
      toast.success("Cập nhật trạng thái thành công!");
      fetchPosts(currentPage, pageSize);
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const deletePost = async (id: number) => {
    try {
      await PostService.delete(id);
      toast.success("Xóa bài viết thành công!");
      const nextPage = posts.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      fetchPosts(nextPage, pageSize);
    } catch (error) {
      console.error(error);
      toast.error("Xóa bài viết thất bại!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Ảnh",
      key: "image",
      render: (_: unknown, record: Post) => {
        const src = record.image
          ? `${IMAGE_BASE}/${record.image.replace(/^\/?uploads\//, "uploads/")}`
          : "/images/placeholder.png";
        return (
          <img
            src={src}
            alt={record.title}
            style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 4, cursor: "pointer" }}
            onClick={() => showPreview(src)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
            }}
          />
        );
      },
    },
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Topic",
      key: "topic",
      render: (_: unknown, record: Post) => <Tag color="blue">{record.topic?.name || "Chưa có"}</Tag>,
    },
    {
      title: "Tác giả",
      key: "user",
      render: (_: unknown, record: Post) => <Tag color="green">{record.user?.name || "Chưa có"}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, record: Post) => (
        <Button type={record.status ? "primary" : "default"} size="small" onClick={() => toggleStatus(record)}>
          {record.status ? "Hiển thị" : "Ẩn"}
        </Button>
      ),
    },
    { title: "Views", dataIndex: "views", key: "views", width: 80 },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => (text ? new Date(text).toLocaleString() : ""),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: unknown, record: Post) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => router.push(`/admin/posts/${record.id}/show`)}>
            Xem
          </Button>
          <Button type="link" size="small" onClick={() => router.push(`/admin/posts/${record.id}/edit`)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa bài viết này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deletePost(record.id!)}
          >
            <Button type="link" danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-4 shadow-sm">
      {/* Header + Search + Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách Bài viết</h2>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Tìm bài viết..."
            allowClear
            onSearch={(value) => {
              setSearch(value);
              fetchPosts(1, pageSize, value);
            }}
            style={{ width: 200 }}
          />
          <Button type="primary" size="small" onClick={() => router.push("/admin/posts/add")}>
            + Thêm
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table rowKey={(record) => record.id!} columns={columns} dataSource={posts} loading={loading} pagination={false} />

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchPosts(page, size, search)}
          onShowSizeChange={(current, size) => fetchPosts(1, size, search)}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} bài viết`}
        />
      </div>

      {/* Modal xem ảnh */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width={800}
      >
        <img src={previewImage} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} alt="Preview" />
      </Modal>
    </Card>
  );
}
