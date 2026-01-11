"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Space, Button, Input, Pagination, message } from "antd";
import { useRouter } from "next/navigation";

import ReviewService from "@/services/ReviewService";
import UserService, { User } from "@/services/UserService";
import ProductService from "@/services/ProductService";

interface Review {
  id: number;
  user_id?: number;
  user_name: string;
  product_id?: number;
  product_name: string;
  rating: number;
  content?: string;
  status: "pending" | "approved" | "rejected";
  likes: number;
  dislikes: number;
  created_at: string;
}

export default function ReviewListPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const enrichWithUserAndProduct = async (items: Review[]) => {
    const enriched = await Promise.all(
      items.map(async (review) => {
        let userName = review.user_name;
        let productName = review.product_name;

        if (!review.user_name && review.user_id) {
          try {
            const user: User = await UserService.detail(review.user_id);
            userName = user.name ?? "Không rõ";
          } catch {
            userName = "Không rõ";
          }
        }

        if (!review.product_name && review.product_id) {
          try {
            const res = await ProductService.get(review.product_id);
            productName = res.data?.name ?? "Không rõ";
          } catch {
            productName = "Không rõ";
          }
        }

        return { ...review, user_name: userName, product_name: productName };
      })
    );

    return enriched;
  };

  const fetchReviews = useCallback(
    async (page = 1, limit = pageSize, keyword = search) => {
      try {
        setLoading(true);

        const params: Record<string, string | number> = { page, limit };
        if (keyword) params.search = keyword;

        const res = await ReviewService.list(params);

        const rawData: Review[] = res.data.data ?? [];
        const meta = res.data.meta ?? {
          current_page: page,
          per_page: limit,
          total: rawData.length,
        };

        const finalData = await enrichWithUserAndProduct(rawData);

        setReviews(finalData);
        setTotal(meta.total);
        setCurrentPage(meta.current_page);
        setPageSize(meta.per_page);
      } catch (error) {
        console.error(error);
        message.error("Không tải được danh sách đánh giá!");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, search]
  );

  useEffect(() => {
    fetchReviews(1, pageSize);
  }, [fetchReviews, pageSize]);

  const getStatusTag = (status: Review["status"]) => {
    const colors = {
      approved: "green",
      pending: "gold",
      rejected: "red",
    };
    return <Tag color={colors[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Tag>;
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Người đánh giá", dataIndex: "user_name", key: "user_name" },
    { title: "Sản phẩm", dataIndex: "product_name", key: "product_name" },
    {
      title: "Rating",
      key: "rating",
      render: (_: unknown, record: Review) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < record.rating ? "text-yellow-400" : "text-gray-300"}>
              ★
            </span>
          ))}
          <span className="ml-1 text-gray-600 text-sm">{record.rating}/5</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: unknown, record: Review) => getStatusTag(record.status),
    },
    {
      title: "Like/Dislike",
      key: "likes",
      render: (_: unknown, record: Review) => (
        <Space size="small">
          <Tag color="green">👍 {record.likes}</Tag>
          <Tag color="red">👎 {record.dislikes}</Tag>
        </Space>
      ),
    },
    { title: "Ngày tạo", dataIndex: "created_at", key: "created_at" },

    // 🔥 Chỉ giữ Xem và Sửa
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: Review) => (
        <Space size="small">
          <Button type="link" onClick={() => router.push(`/admin/reviews/${record.id}/show`)}>
            Xem
          </Button>
          <Button type="link" onClick={() => router.push(`/admin/reviews/${record.id}/edit`)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>

        <Input.Search
          placeholder="Tìm người đánh giá hoặc sản phẩm..."
          allowClear
          onSearch={(value) => fetchReviews(1, pageSize, value)}
          style={{ width: 260 }}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={reviews}
        loading={loading}
        pagination={false}
        bordered
        size="small"
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={["5", "10", "20", "50"]}
          onChange={(page, size) => fetchReviews(page, size, search)}
          onShowSizeChange={(current, size) => fetchReviews(1, size, search)}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} đánh giá`}
        />
      </div>
    </div>
  );
}
