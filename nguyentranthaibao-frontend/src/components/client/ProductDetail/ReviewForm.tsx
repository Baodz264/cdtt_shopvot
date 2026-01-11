"use client";

import { Rate, Input, Button, message, Avatar, Card, Upload } from "antd";
import { useState } from "react";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import ReviewService from "@/services/ReviewService";
import ReviewImageService from "@/services/ReviewImageService";
import { useAuth } from "@/context/AuthContext";

const IMAGE_BASE = "http://localhost:8000";

interface ReviewFormProps {
  productId: number;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // fileList kiểu UploadFile<RcFile>[]
  const [fileList, setFileList] = useState<UploadFile<RcFile>[]>([]);

  const handleSubmit = async () => {
    if (!user) return message.error("Bạn cần đăng nhập để đánh giá");
    if (!content.trim()) return message.warning("Nhập nội dung đánh giá");

    setLoading(true);
    try {
      // 1️⃣ Tạo review
      const reviewRes = await ReviewService.create({
        user_id: user.id,
        product_id: productId,
        rating,
        content,
        status: "pending",
      });

      const reviewId = reviewRes.data.id;

      // 2️⃣ Upload nhiều ảnh
      if (fileList.length > 0) {
        await Promise.all(
          fileList.map((file) =>
            ReviewImageService.create({ review_id: reviewId, image: file.originFileObj as File })
          )
        );
      }

      message.success("Đánh giá đã gửi, đang chờ duyệt");
      setContent("");
      setRating(5);
      setFileList([]);
    } catch (error) {
      console.error(error);
      message.error("Gửi đánh giá thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <Card className="bg-gray-50 text-center py-6 border-dashed rounded-lg">
        <p className="text-gray-500 mb-3">
          Đăng nhập để chia sẻ trải nghiệm sản phẩm
        </p>
        <Button type="primary" ghost href="/login">
          Đăng nhập ngay
        </Button>
      </Card>
    );
  }

  const avatarUrl = user.avatar ? `${IMAGE_BASE}${user.avatar}` : undefined;

  return (
    <Card className="mb-6 shadow-sm rounded-xl p-4 bg-white">
      <div className="flex items-start gap-4">
        <Avatar
          size={48}
          src={avatarUrl}
          icon={!avatarUrl ? <UserOutlined /> : undefined}
        >
          {!avatarUrl && user.name?.charAt(0)}
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">{user.name}</span>
            <Rate value={rating} onChange={setRating} />
          </div>

          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Sản phẩm này thế nào? Chia sẻ cho mọi người nhé..."
            className="rounded-lg border-gray-200 focus:ring-1 focus:ring-blue-400 transition"
          />

          {/* Upload nhiều ảnh */}
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={(file: RcFile) => {
              setFileList((prev) => [...prev, file as UploadFile]);
              return false; // không tự động upload
            }}
            onRemove={(file) => {
              setFileList((prev) =>
                prev.filter((f) => f.uid !== file.uid)
              );
            }}
          >
            <div>
              <PlusOutlined />
              <div style={{ fontSize: 12 }}>Thêm ảnh</div>
            </div>
          </Upload>

          <div className="flex justify-end">
            <Button
              type="primary"
              loading={loading}
              onClick={handleSubmit}
              className="rounded-full px-6"
            >
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
