"use client";
import React, { useEffect, useState } from 'react';
import PostService, { Post } from '@/services/PostService';
import PostImageService, { PostImage } from '@/services/PostImageService';
import { ArrowLeft, Clock, Eye, Share2, ArrowRight, User, Sparkles } from 'lucide-react';

const IMAGE_BASE = "http://localhost:8000";

const getImageUrl = (path?: string) => {
  if (!path) return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000';
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE}/${path.replace(/^\/+/, "")}`;
};

export default function BlogModule() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const openDetail = (id: number) => {
    setSelectedPostId(id);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-600">
      {view === 'list' ? (
        <PostListView onSelectPost={openDetail} />
      ) : (
        <PostDetailView id={selectedPostId!} onBack={() => setView('list')} />
      )}
    </div>
  );
}

// --- VIEW: DANH SÁCH BÀI VIẾT (BRIGHT EDITORIAL) ---
function PostListView({ onSelectPost }: { onSelectPost: (id: number) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PostService.list({ limit: 13, type: 'post' })
      .then((res) => setPosts(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
      {/* Header Section Sáng Sủa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.4em]">
            <Sparkles size={14} /> Discovery Journal
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900">
            Sáng Tạo <span className="text-blue-500">&</span><br /> Cảm Hứng.
          </h1>
        </div>
        <div className="max-w-xs border-l-2 border-blue-50 pl-6">
          <p className="text-slate-400 text-sm leading-relaxed">
            Nơi hội tụ những bài viết về thiết kế, lối sống và công nghệ với góc nhìn đa chiều và tươi mới mỗi ngày.
          </p>
        </div>
      </div>

      {/* Featured Card - Soft Shadow & White Base */}
      {featuredPost && (
        <section 
          className="relative group cursor-pointer mb-32 bg-white rounded-[3rem] p-4 md:p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(59,130,246,0.15)] transition-all duration-700"
          onClick={() => onSelectPost(featuredPost.id)}
        >
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-2/3 overflow-hidden rounded-[2.5rem]">
              <img 
                src={getImageUrl(featuredPost.image)} 
                className="w-full h-[400px] lg:h-[550px] object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt={featuredPost.title}
              />
            </div>
            <div className="lg:w-1/3 pr-8 py-4">
              <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest mb-4 inline-block">Tiêu điểm hôm nay</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-6 group-hover:text-blue-600 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-slate-500 text-lg mb-8 line-clamp-3 font-serif">
                {featuredPost.excerpt || "Khám phá chiều sâu của nội dung và những giá trị ẩn giấu phía sau câu chuyện này..."}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  {featuredPost.user?.name?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{featuredPost.user?.name}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    {new Date(featuredPost.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Grid - Clean & Bright */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
        {remainingPosts.map((post) => (
          <article 
            key={post.id} 
            className="group cursor-pointer"
            onClick={() => onSelectPost(post.id)}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 bg-slate-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.2)] transition-all">
              <img 
                src={getImageUrl(post.image)} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                alt={post.title}
              />
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {post.topic && (
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">
                  {post.topic.name}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {new Date(post.created_at || '').toLocaleDateString('vi-VN')}
              </span>
              <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                Đọc thêm <ArrowRight size={14} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// --- VIEW: CHI TIẾT (LUXURY WHITE STYLE) ---
function PostDetailView({ id, onBack }: { id: number; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null);
  const [gallery, setGallery] = useState<PostImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postRes, imgRes] = await Promise.all([
          PostService.detail(id),
          PostImageService.list({ post_id: id })
        ]);
        setPost(postRes.data);
        setGallery(imgRes.data.data || []);
        PostService.increaseView(id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !post) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white">
      {/* Top Fixed Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-slate-900">
            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <ArrowLeft size={16} />
            </div>
            Quay lại
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">Đang đọc</span>
          </div>
          <button className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-all"><Share2 size={18} /></button>
        </div>
      </nav>

      {/* Header Profile - Modern & Bright */}
      <header className="max-w-4xl mx-auto px-6 pt-40 pb-20">
        <div className="flex flex-col items-center text-center">
          {post.topic && (
            <span className="px-6 py-2 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-[0.5em] mb-10 rounded-full shadow-sm">
              {post.topic.name}
            </span>
          )}
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-12">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-6 p-2 bg-slate-50 rounded-full pr-8">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
              {post.user?.name?.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tác giả</p>
              <p className="font-bold text-slate-900">{post.user?.name}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 ml-4"></div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Lượt xem</p>
              <p className="font-bold text-slate-900">{post.views?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Large Featured Image with Curve */}
      <div className="max-w-[1300px] mx-auto px-6 mb-24">
        <div className="rounded-[4rem] overflow-hidden aspect-[16/9] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]">
          <img src={getImageUrl(post.image)} className="w-full h-full object-cover" alt="" />
        </div>
      </div>

      {/* Clean Reading Experience */}
      <main className="max-w-3xl mx-auto px-6">
        <article 
          className="prose prose-slate prose-xl max-w-none 
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-10 prose-p:font-medium
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tighter
          prose-img:rounded-[2.5rem] prose-img:shadow-2xl
          prose-blockquote:border-none prose-blockquote:text-center prose-blockquote:bg-blue-50/50 prose-blockquote:py-16 prose-blockquote:rounded-[3rem] prose-blockquote:px-12 prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-blue-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Gallery Sáng Sủa */}
        {gallery.length > 0 && (
          <div className="mt-32 pt-24 border-t border-slate-50">
            <div className="flex flex-col items-center mb-20">
              <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-transparent mb-6"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">Bộ Sưu Tập Hình Ảnh</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 md:gap-10">
              {gallery.map((img, idx) => (
                <div key={img.id} className={`overflow-hidden rounded-[2.5rem] group shadow-lg ${idx % 3 === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                  <img src={getImageUrl(img.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt="" />
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-40 pb-40 text-center">
          <p className="text-slate-400 text-sm mb-10 italic">Cảm ơn bạn đã đọc câu chuyện này.</p>
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-200"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Về trang danh sách
          </button>
        </footer>
      </main>
    </div>
  );
}

// --- LOADING SKELETON BRIGHT ---
function LoadingSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 animate-pulse bg-white">
      <div className="h-32 bg-slate-50 w-2/3 mb-16 rounded-[2rem]"></div>
      <div className="h-[600px] bg-slate-50 w-full mb-32 rounded-[4rem]"></div>
      <div className="grid grid-cols-3 gap-12">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-8">
            <div className="aspect-[4/5] bg-slate-50 rounded-[3rem]"></div>
            <div className="h-6 bg-slate-50 w-3/4 rounded-full"></div>
            <div className="h-4 bg-slate-50 w-1/2 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}