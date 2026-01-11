"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PostService, { Post } from "@/services/PostService";

// Laravel public URL
const IMAGE_BASE = "http://localhost:8000";

export default function PostSection({
  title,
  type = "post",
}: {
  title: string;
  type?: "post" | "page";
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await PostService.list({
          type,
          page: 1,
          limit: 3,
        });
        setPosts(res.data.data);
      } catch (err) {
        console.error("Không tải được bài viết:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [type]);

  // Chuẩn hoá URL ảnh
  const getImageUrl = (path?: string) => {
    if (!path) return "/no-image.jpg";
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Format ngày an toàn
  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center text-gray-400 animate-pulse">
        Đang tải {title.toLowerCase()}...
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <div className="hidden sm:block h-1 flex-grow mx-4 bg-gray-100 rounded-full" />
      </div>

      {/* Danh sách bài viết */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group flex flex-col bg-white rounded-2xl transition-all"
          >
            {/* Ảnh */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 border">
              <img
                src={getImageUrl(post.image)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {post.topic && (
                <span className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-lg text-[11px] font-bold text-blue-600 uppercase">
                  {post.topic.name}
                </span>
              )}
            </div>

            {/* Nội dung */}
            <div className="pt-4 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                {post.title}
              </h3>

              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {post.excerpt || "Xem chi tiết bài viết để biết thêm thông tin..."}
              </p>

              <div className="mt-4 pt-4 border-t flex justify-between text-[12px] text-gray-400">
                <span className="font-semibold text-gray-700">
                  {post.user?.name || "Admin"}
                </span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
