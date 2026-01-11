"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Spin,
  Rate,
  Avatar,
  Image,
  Typography,
  Tag,
  Button,
  Space,
} from "antd";
import {
  UserOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

import { Review } from "@/types/review";
import ReviewImageService from "@/services/ReviewImageService";
import ReviewLikeService from "@/services/ReviewLikeService";
import ReviewReplyService from "@/services/ReviewReplyService";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastProvider";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text, Paragraph } = Typography;
const IMAGE_BASE = "http://localhost:8000";

/* =========================
    TYPES
========================= */
interface ReviewImage {
  id: number;
  image: string;
}

interface ReviewLike {
  id: number;
  type: "like" | "dislike";
  user_id: number;
  review_id: number;
}

interface ReviewReply {
  id: number;
  reply: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
  };
}

interface LikeSummary {
  like: number;
  dislike: number;
}

type Star = 1 | 2 | 3 | 4 | 5;
type StarSummary = Record<Star, number>;

/* =========================
    Utils
========================= */
const resolveImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
}

export default function ReviewList({ reviews, loading }: ReviewListProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [images, setImages] = useState<Record<number, string[]>>({});
  const [likes, setLikes] = useState<Record<number, LikeSummary>>({});
  const [replies, setReplies] = useState<Record<number, ReviewReply[]>>({});
  const [likeLoading, setLikeLoading] = useState<number | null>(null);

  /* FILTER */
  const [filterStar, setFilterStar] = useState<Star | null>(null);

  /* REPLY UI */
  const [replyOpen, setReplyOpen] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyLoading, setReplyLoading] = useState(false);

  /* =========================
      LOAD IMAGE / LIKE / REPLY
  ========================== */
  useEffect(() => {
    if (!reviews.length) return;

    const loadAll = async () => {
      const imageMap: Record<number, string[]> = {};
      const likeMap: Record<number, LikeSummary> = {};
      const replyMap: Record<number, ReviewReply[]> = {};

      await Promise.all(
        reviews.map(async (r) => {
          if (!r.id) return;

          const [imgRes, likeRes, replyRes] = await Promise.allSettled([
            ReviewImageService.list({ review_id: r.id }),
            ReviewLikeService.list({ review_id: r.id }),
            ReviewReplyService.list({ review_id: r.id }),
          ]);

          const imgs: ReviewImage[] =
            imgRes.status === "fulfilled" ? imgRes.value.data?.data || [] : [];
          imageMap[r.id] = imgs
            .map((i) => resolveImageUrl(i.image))
            .filter((i): i is string => Boolean(i));

          const likeList: ReviewLike[] =
            likeRes.status === "fulfilled"
              ? likeRes.value.data?.data || []
              : [];
          likeMap[r.id] = {
            like: likeList.filter((i) => i.type === "like").length,
            dislike: likeList.filter((i) => i.type === "dislike").length,
          };

          replyMap[r.id] =
            replyRes.status === "fulfilled" ? replyRes.value.data?.data || [] : [];
        })
      );

      setImages(imageMap);
      setLikes(likeMap);
      setReplies(replyMap);
    };

    loadAll();
  }, [reviews]);

  /* =========================
      SUMMARY
  ========================== */
  const summary = useMemo(() => {
    const stars: StarSummary = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = reviews.length;
    let sum = 0;

    reviews.forEach((r) => {
      const rating = Number(r.rating) as Star;
      if (rating >= 1 && rating <= 5) {
        stars[rating]++;
        sum += rating;
      }
    });

    return {
      total,
      avg: total ? Number((sum / total).toFixed(1)) : 0,
      stars,
    };
  }, [reviews]);

  /* =========================
      FILTERED REVIEWS
  ========================== */
  const filteredReviews = useMemo(() => {
    if (!filterStar) return reviews;
    return reviews.filter((r) => Number(r.rating) === filterStar);
  }, [reviews, filterStar]);

  /* =========================
      LIKE / DISLIKE
  ========================== */
  const handleLike = async (reviewId: number, type: "like" | "dislike") => {
    if (!user) return toast.warning("Vui lòng đăng nhập");

    try {
      setLikeLoading(reviewId);
      await ReviewLikeService.create({
        review_id: reviewId,
        user_id: user.id,
        type,
      });

      const res = await ReviewLikeService.list({ review_id: reviewId });
      const list: ReviewLike[] = res.data?.data || [];

      setLikes((prev) => ({
        ...prev,
        [reviewId]: {
          like: list.filter((i) => i.type === "like").length,
          dislike: list.filter((i) => i.type === "dislike").length,
        },
      }));
    } catch {
      toast.error("Không thể thực hiện");
    } finally {
      setLikeLoading(null);
    }
  };

  /* =========================
      SEND REPLY
  ========================== */
  const handleReply = async (reviewId: number) => {
    const text = replyText[reviewId]?.trim();
    if (!user) return toast.warning("Vui lòng đăng nhập");
    if (!text) return toast.warning("Nhập nội dung trả lời");

    try {
      setReplyLoading(true);
      const res = await ReviewReplyService.create({
        review_id: reviewId,
        user_id: user.id,
        reply: text,
      });

      setReplies((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), res.data],
      }));

      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      setReplyOpen(null);
    } catch {
      toast.error("Không thể trả lời");
    } finally {
      setReplyLoading(false);
    }
  };

  /* =========================
      RENDER
  ========================== */
  if (loading)
    return (
      <div className="py-10 text-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <div className="bg-white p-5 rounded-xl border">
        <div className="flex gap-6 items-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">
              {summary.avg}
            </div>
            <Rate disabled allowHalf value={summary.avg} />
            <div className="text-gray-500 text-sm">{summary.total} đánh giá</div>
          </div>

          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm">
                <span className="w-10">{s}⭐</span>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div
                    className="bg-orange-400 h-2 rounded"
                    style={{
                      width: summary.total
                        ? `${(summary.stars[s as Star] / summary.total) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="w-8 text-right">{summary.stars[s as Star]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FILTER */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag
            color={!filterStar ? "processing" : "default"}
            className="cursor-pointer px-3 py-1"
            onClick={() => setFilterStar(null)}
          >
            Tất cả
          </Tag>
          {[5, 4, 3, 2, 1].map((s) => (
            <Tag
              key={s}
              color={filterStar === s ? "processing" : "default"}
              className="cursor-pointer px-3 py-1 flex items-center gap-1"
              onClick={() => setFilterStar(s as Star)}
            >
              {s} <Rate disabled value={1} count={1} />
            </Tag>
          ))}
        </div>
      </div>

      {/* LIST */}
      {filteredReviews.map((r) => {
        const avatar = resolveImageUrl(r.user?.avatar);
        const reviewImages = images[r.id] || [];
        const likeInfo = likes[r.id] || { like: 0, dislike: 0 };
        const replyList = replies[r.id] || [];

        return (
          <div key={r.id} className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Avatar src={avatar} icon={<UserOutlined />} />
                <div>
                  <Text strong>{r.user?.name ?? "Người dùng"}</Text>
                  <Rate disabled value={Number(r.rating)} />
                </div>
              </div>
              <Text type="secondary" className="text-xs">
                {dayjs(r.created_at).fromNow()}
              </Text>
            </div>

            <Paragraph className="mt-3">{r.content}</Paragraph>

            {reviewImages.length > 0 && (
              <Image.PreviewGroup>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {reviewImages.map((img, i) => (
                    <Image key={i} src={img} width={80} />
                  ))}
                </div>
              </Image.PreviewGroup>
            )}

            <Space className="mt-3">
              <Button
                size="small"
                icon={<LikeOutlined />}
                loading={likeLoading === r.id}
                onClick={() => handleLike(r.id, "like")}
              >
                {likeInfo.like}
              </Button>
              <Button
                size="small"
                icon={<DislikeOutlined />}
                loading={likeLoading === r.id}
                onClick={() => handleLike(r.id, "dislike")}
              >
                {likeInfo.dislike}
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => setReplyOpen(replyOpen === r.id ? null : r.id)}
              >
                Trả lời
              </Button>
            </Space>

            {replyOpen === r.id && (
              <div className="mt-3">
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={replyText[r.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))
                  }
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button size="small" onClick={() => setReplyOpen(null)}>
                    Hủy
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    loading={replyLoading}
                    onClick={() => handleReply(r.id)}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            )}

            {replyList.length > 0 && (
              <div className="mt-4 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                {replyList.map((rep) => (
                  <div key={rep.id} className="mb-2">
                    <Tag color="processing">Phản hồi shop</Tag>
                    <Text strong>{rep.user?.name ?? "Quản trị viên"}</Text>
                    <div className="italic mt-1">“{rep.reply}”</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
