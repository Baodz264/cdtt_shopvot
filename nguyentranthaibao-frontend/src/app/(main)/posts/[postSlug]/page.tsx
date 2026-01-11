"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostService, { Post } from "@/services/PostService";
import PostImageService, { PostImage } from "@/services/PostImageService";
import { ArrowLeft, Clock, Eye, Share2, ChevronLeft } from "lucide-react";

const IMAGE_BASE = "http://localhost:8000";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [gallery, setGallery] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Logic giữ nguyên để đảm bảo code chạy
  const getImageUrl = (path?: string) => {
    if (!path) return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000";
    return path.startsWith("http") ? path : `${IMAGE_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    let postSlug = params?.postSlug;
    if (Array.isArray(postSlug)) postSlug = postSlug[0];
    if (!postSlug) return;

    const fetchPostAndGallery = async () => {
      try {
        setLoading(true);
        const postRes = await PostService.detailBySlug(postSlug);
        const postData = postRes.data as Post;
        setPost(postData);
        
        PostService.increaseView(postData.id).catch(console.error);
        const galleryRes = await PostImageService.list({ post_id: postData.id });
        setGallery(galleryRes.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndGallery();
  }, [params?.postSlug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return null;

  return (
    <div className="bg-white text-slate-900 antialiased">
      {/* 1. TOP NAV - Tối giản */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-900 transition-colors"><Share2 size={18}/></button>
          </div>
        </div>
      </nav>

      {/* 2. HEADER - Tập trung vào tiêu đề */}
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        {post.topic && (
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 block">
            {post.topic.name}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-8 tracking-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-between border-y border-slate-100 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
              {post.user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.user?.name || "Tác giả"}</p>
              <p className="text-xs text-slate-400">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Eye size={14} /> {post.views?.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Clock size={14} /> 5 phút đọc
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURED IMAGE - To, sắc nét */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <img
          src={getImageUrl(post.image)}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover rounded-2xl shadow-sm bg-slate-100"
        />
      </div>

      {/* 4. CONTENT - Typography tinh tế */}
      <main className="max-w-3xl mx-auto px-6">
        <article 
          className="prose prose-slate prose-lg max-w-none
            prose-p:text-slate-700 prose-p:leading-relaxed
            prose-headings:text-slate-900 prose-headings:font-bold
            prose-strong:text-slate-900
            prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 5. GALLERY - Lưới đều đặn, tối giản */}
        {gallery.length > 0 && (
          <div className="mt-20">
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
              Hình ảnh liên quan
              <span className="flex-1 h-px bg-slate-100"></span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((img) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img 
                    src={getImageUrl(img.image)} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
                    alt="Gallery visual" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FOOTER - Gọn gàng */}
        <footer className="mt-24 mb-32 pt-12 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm mb-8 italic">
            Cảm ơn bạn đã dành thời gian đọc bài viết này.
          </p>
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Xem các bài viết khác
          </button>
        </footer>
      </main>
    </div>
  );
}