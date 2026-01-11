"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Card,
  Descriptions,
  Tag,
  Image,
  List,
  Avatar,
  Rate,
  Divider,
  Statistic,
  Typography,
  Space,
} from "antd";

import {
  LikeOutlined,
  DislikeOutlined,
  MessageOutlined,
  UserOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import ReviewService from "@/services/ReviewService";
import ReviewImageService from "@/services/ReviewImageService";
import ReviewReplyService from "@/services/ReviewReplyService";
import ReviewLikeService from "@/services/ReviewLikeService";
import UserService, { User as UserType } from "@/services/UserService";
import ProductService from "@/services/ProductService";

const { Title, Text } = Typography;

// ===============================
// INTERFACES
// ===============================
interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  status: string;
  content: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
}

interface ReviewImage {
  id: number;
  review_id: number;
  image_url: string;
}

interface ReviewReply {
  id: number;
  review_id: number;
  user_name: string;
  reply: string;
}

interface ReviewLike {
  id: number;
  review_id: number;
  type: "like" | "dislike";
}

export default function ReviewShowPage() {
  const { reviewId } = useParams();
  const id = Number(reviewId);

  const [review, setReview] = useState<Review | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // ===========================
  // IMAGE URL BUILDER (ĐÃ FIX)
  // ===========================
  const getImageSrc = (url: string | null | undefined) => {
    if (!url) return null;

    const base =
      process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

    // URL full
    if (url.startsWith("http")) return url;

    // URL dạng /uploads/reviews/images/xxx.jpg
    if (url.startsWith("/")) return `${base}${url}`;

    // URL dạng uploads/reviews/images/xxx.jpg
    return `${base}/${url}`;
  };

  // ===========================
  // STATUS TAG
  // ===========================
  const getStatusTag = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      approved: <Tag color="green">Đã duyệt</Tag>,
      pending: <Tag color="gold">Chờ duyệt</Tag>,
      rejected: <Tag color="red">Từ chối</Tag>,
    };
    return map[status] ?? <Tag>Không rõ</Tag>;
  };

  // ===========================
  // FETCH DATA
  // ===========================
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. REVIEW
      const reviewRes = await ReviewService.detail(id);
      const reviewData: Review = reviewRes.data;
      setReview(reviewData);

      // 2. USER
      if (reviewData.user_id) {
        const userData = await UserService.detail(reviewData.user_id);
        setUser(userData);
      }

      // 3. PRODUCT
      if (reviewData.product_id) {
        const productRes = await ProductService.get(reviewData.product_id);
        setProduct(productRes.data);
      }

      // 4. IMAGES
      const imgRes = await ReviewImageService.list({
        review_id: id,
        limit: 100,
      });

      setImages(imgRes.data.data || []);

      // 5. REPLIES
      const replyRes = await ReviewReplyService.list({
        review_id: id,
        limit: 100,
      });
      setReplies(replyRes.data.data || []);

      // 6. LIKE / DISLIKE
      const likeRes = await ReviewLikeService.list({
        review_id: id,
        limit: 500,
      });

      const likeList: ReviewLike[] = likeRes.data.data || [];

      setLikes(likeList.filter((x) => x.type === "like").length);
      setDislikes(likeList.filter((x) => x.type === "dislike").length);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reviewId]);

  // ===========================
  // LOADING / EMPTY
  // ===========================
  if (loading) return <p className="text-center p-6">Đang tải dữ liệu...</p>;
  if (!review)
    return (
      <p className="text-center p-6 text-red-600">
        Không tìm thấy đánh giá!
      </p>
    );

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card variant="outlined" className="shadow-md rounded-xl">
        <Title level={2}>Chi tiết đánh giá #{id}</Title>

        <Divider />

        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Người đánh giá">
            <Space>
              <Avatar icon={<UserOutlined />} />
              {user?.name ?? "Không có dữ liệu"}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Sản phẩm">
            <Space>
              <Avatar icon={<ShoppingOutlined />} />
              {product?.name ?? "Không có dữ liệu"}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Rating">
            <Rate disabled value={review.rating} />
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {getStatusTag(review.status)}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {review.created_at}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Card variant="borderless" title="Nội dung đánh giá">
          <Text style={{ fontSize: 16 }}>{review.content}</Text>
        </Card>

        <Divider />

        {/* HÌNH ẢNH */}
        {images.length > 0 && (
          <>
            <Title level={4}>Hình ảnh</Title>

            <Image.PreviewGroup>
              <Space wrap>
                {images.map((img) => {
                  const src = getImageSrc(img.image_url);
                  if (!src) return null;

                  return (
                    <Image
                      key={img.id}
                      width={130}
                      height={130}
                      src={src}
                      alt="Review image"
                      fallback="/no-image.png"
                      style={{
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  );
                })}
              </Space>
            </Image.PreviewGroup>

            <Divider />
          </>
        )}

        <Space size="large">
          <Statistic title="Lượt thích" value={likes} prefix={<LikeOutlined />} />
          <Statistic
            title="Lượt không thích"
            value={dislikes}
            prefix={<DislikeOutlined />}
          />
        </Space>

        <Divider />

        <Title level={4}>Trả lời</Title>

        {replies.length > 0 ? (
          <List
            bordered
            dataSource={replies}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<MessageOutlined />} />}
                  title={<strong>{item.user_name}</strong>}
                  description={item.reply}
                />
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">Chưa có trả lời</Text>
        )}
      </Card>
    </div>
  );
}
