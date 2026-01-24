"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostService, { Post } from "@/services/PostService";
import PostImageService, { PostImage } from "@/services/PostImageService";
import { Clock, Eye, Share2, ChevronLeft } from "lucide-react";

const IMAGE_BASE = "http://localhost:8000";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [gallery, setGallery] = useState<PostImage[]>([]);
  const [recommended, setRecommended] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path?: string) => {
    if (!path)
      return "https://images.unsplash.com/photo-1499750310107-5fef28a66643";
    return path.startsWith("http")
      ? path
      : `${IMAGE_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    let slug = params?.postSlug;
    if (Array.isArray(slug)) slug = slug[0];
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const postRes = await PostService.detailBySlug(slug);
        const postData = postRes.data;
        setPost(postData);

        // tăng view (không block UI)
        PostService.increaseView(postData.id).catch(() => {});

        // gallery
        const galleryRes = await PostImageService.list({
          post_id: postData.id,
        });
        setGallery(galleryRes.data.data || []);

        // tin tức đề xuất (cùng topic)
        if (postData.topic_id) {
          const relatedRes = await PostService.list({
            topic_id: postData.topic_id,
            type: "post",
            limit: 5,
            sort_by: "created_at",
            sort_order: "desc",
          });

          const filtered = relatedRes.data.data.filter(
            (p) => p.id !== postData.id
          );

          setRecommended(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.postSlug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );

  if (!post) return null;

  return (
    <div className="bg-white text-slate-900">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft size={18} /> Quay lại
          </button>
          <Share2 size={18} className="text-slate-400" />
        </div>
      </nav>

      {/* HEADER */}
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        {post.topic && (
          <span className="text-blue-600 text-xs font-bold uppercase">
            {post.topic.name}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-8">
          {post.title}
        </h1>

        <div className="flex justify-between border-y py-6">
          <div>
            <p className="font-bold">{post.user?.name || "Tác giả"}</p>
            <p className="text-xs text-slate-400">
              {formatDate(post.created_at)}
            </p>
          </div>
          <div className="flex gap-6 text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {post.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> 5 phút đọc
            </span>
          </div>
        </div>
      </header>

      {/* IMAGE */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <img
          src={getImageUrl(post.image)}
          className="w-full aspect-[16/9] object-cover rounded-2xl"
        />
      </div>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto px-6">
        <article
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* GALLERY */}
        {gallery.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold mb-6">Hình ảnh liên quan</h3>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((img) => (
                <img
                  key={img.id}
                  src={getImageUrl(img.image)}
                  className="rounded-xl object-cover aspect-square"
                />
              ))}
            </div>
          </div>
        )}

        {/* 🔥 RECOMMENDED POSTS */}
        {recommended.length > 0 && (
          <section className="mt-24">
            <h3 className="text-xl font-extrabold mb-8">
              Tin tức đề xuất
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {recommended.map((item) => (
                <article
                  key={item.id}
                  onClick={() => router.push(`/posts/${item.slug}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border hover:shadow-lg transition"
                >
                  <img
                    src={getImageUrl(item.image)}
                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                  />
                  <div className="p-5">
                    <h4 className="font-bold line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="mt-32 mb-24 text-center">
          <button
            onClick={() => router.push("/blog")}
            className="px-8 py-3 bg-slate-900 text-white rounded-full"
          >
            Xem thêm bài viết
          </button>
        </footer>
      </main>
    </div>
  );
}
