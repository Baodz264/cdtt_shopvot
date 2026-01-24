"use client";
import React, { useEffect, useState } from "react";
import PostService, { Post } from "@/services/PostService";
import TopicService, { Topic } from "@/services/TopicService";
import PostImageService, { PostImage } from "@/services/PostImageService";
import { ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react";

/* ================= CONFIG ================= */

const IMAGE_BASE = "http://localhost:8000";
const PAGE_SIZE = 9;

const getImageUrl = (path?: string) => {
  if (!path)
    return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000";
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}/${path.replace(/^\/+/, "")}`;
};

/* ================= ROOT ================= */

export default function BlogModule() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  return (
    <div className="w-full bg-white min-h-screen">
      {view === "list" ? (
        <PostListView
          onSelectPost={(id) => {
            setSelectedPostId(id);
            setView("detail");
            window.scrollTo({ top: 0 });
          }}
        />
      ) : (
        <PostDetailView
          id={selectedPostId!}
          onBack={() => setView("list")}
        />
      )}
    </div>
  );
}

/* ================= LIST VIEW ================= */

function PostListView({ onSelectPost }: { onSelectPost: (id: number) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);

  /* Load topic */
  useEffect(() => {
    let cancelled = false;
    const fetchTopics = async () => {
      try {
        const res = await TopicService.list({ status: 1, limit: 100 });
        if (!cancelled) setTopics(res.data);
      } catch (error) {
        console.error("Failed to fetch topics", error);
      }
    };
    fetchTopics();
    return () => { cancelled = true; };
  }, []);

  /* Load post */
  useEffect(() => {
    let cancelled = false;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await PostService.list({
          type: "post",
          topic_id: topicId,
          page,
          limit: PAGE_SIZE,
          sort_by: "created_at",
          sort_order: "desc",
        });
        if (!cancelled) {
          setPosts(res.data.data);
          setTotalPage(res.data.totalPage);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPosts();
    return () => { cancelled = true; };
  }, [topicId, page]);

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} /> Discovery Journal
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900">
            Sáng Tạo <span className="text-blue-500">&</span> Cảm Hứng
          </h1>
        </div>

        <select
          value={topicId ?? ""}
          onChange={(e) => {
            setTopicId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="h-12 px-6 rounded-full border text-sm font-bold bg-white"
        >
          <option value="">Tất cả chủ đề</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* FEATURED */}
      {featuredPost && (
        <section
          onClick={() => onSelectPost(featuredPost.id)}
          className="cursor-pointer mb-24 rounded-[3rem] p-6 shadow-xl hover:shadow-blue-200 transition bg-slate-50"
        >
          <img
            src={getImageUrl(featuredPost.image)}
            alt={featuredPost.title}
            className="w-full h-[500px] object-cover rounded-[2.5rem]"
          />
          <h2 className="text-4xl font-black mt-8 px-4">
            {featuredPost.title}
          </h2>
        </section>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {remainingPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post.id)}
            className="cursor-pointer group"
          >
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6">
              <img
                src={getImageUrl(post.image)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <h3 className="text-xl font-black group-hover:text-blue-600 transition">
              {post.title}
            </h3>
          </article>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 mt-20">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-6 py-3 rounded-full border font-black disabled:opacity-30 hover:bg-slate-50"
        >
          Trước
        </button>
        <span className="font-black text-sm">{page} / {totalPage}</span>
        <button
          disabled={page === totalPage}
          onClick={() => setPage(page + 1)}
          className="px-6 py-3 rounded-full border font-black disabled:opacity-30 hover:bg-slate-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

/* ================= DETAIL VIEW ================= */

function PostDetailView({ id, onBack }: { id: number; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null);
  const [gallery, setGallery] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [postRes, galleryRes] = await Promise.all([
          PostService.detail(id),
          PostImageService.list({ post_id: id, limit: 20 }),
        ]);

        if (!cancelled) {
          setPost(postRes.data);
          // Đảm bảo lấy đúng mảng data từ response
          setGallery(galleryRes.data.data || []);
          PostService.increaseView(id);
        }
      } catch (error) {
        console.error("Error loading detail:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!post) return <div className="p-20 text-center font-bold">Không tìm thấy bài viết.</div>;

  return (
    <div className="bg-white pb-20">
      {/* Nút quay lại */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 bg-white/80 backdrop-blur p-3 rounded-full shadow-lg hover:bg-white transition"
      >
        <ArrowLeft />
      </button>

      {/* Ảnh bìa (Banner) */}
      <div className="w-full h-[70vh] relative">
        <img
          src={getImageUrl(post.image)}
          className="w-full h-full object-cover"
          alt={post.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10 bg-white rounded-t-[3rem] pt-16 shadow-2xl">
        <div className="px-4 md:px-10">
          <h1 className="text-4xl md:text-6xl font-black mb-10 text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Nội dung bài viết */}
          <article
            className="prose prose-slate prose-xl max-w-none 
              prose-headings:font-black prose-a:text-blue-600 
              prose-img:rounded-3xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* GALLERY - ẢNH PHỤ */}
          {gallery.length > 0 && (
            <div className="mt-20 border-t pt-16">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <ImageIcon size={24} />
                </div>
                <h2 className="text-3xl font-black">Bộ sưu tập hình ảnh</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gallery.map((img, index) => (
                  <div 
                    key={img.id} 
                    className={`overflow-hidden rounded-[2rem] shadow-md group ${
                      index % 3 === 0 ? "md:col-span-2" : ""
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image)}
                      alt={`Gallery ${index}`}
                      className="w-full h-full min-h-[300px] max-h-[600px] object-cover group-hover:scale-105 transition duration-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= LOADING ================= */

function LoadingSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 animate-pulse">
      <div className="h-4 w-32 bg-slate-100 mb-4 rounded"></div>
      <div className="h-16 w-3/4 bg-slate-100 mb-10 rounded-xl"></div>
      <div className="h-[500px] bg-slate-100 rounded-[3rem] mb-20"></div>
      <div className="grid grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-50 rounded-3xl"></div>)}
      </div>
    </div>
  );
}