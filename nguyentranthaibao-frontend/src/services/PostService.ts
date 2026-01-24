import api from "./api";

/* ================= INTERFACES ================= */

export interface Topic {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  topic_id?: number;
  user_id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  type: "post" | "page";
  status?: number;
  views?: number;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
  updated_at?: string;

  topic?: Topic;
  user?: User;
}

export interface PostListResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Post[];
}

/* ================= SERVICE ================= */

const PostService = {
  /**
   * Lấy danh sách post
   * (pagination + search + filter + sort)
   */
  list: (params?: {
    page?: number;
    limit?: number;

    // search
    keyword?: string;

    // filter
    type?: "post" | "page";
    status?: number;
    topic_id?: number;
    user_id?: number;
    min_views?: number;
    max_views?: number;
    from_date?: string; // yyyy-mm-dd
    to_date?: string;   // yyyy-mm-dd

    // sort
    sort_by?: "created_at" | "views" | "title";
    sort_order?: "asc" | "desc";
  }) => api.get<PostListResponse>("/posts", { params }),

  /**
   * Chi tiết bài viết theo ID
   */
  detail: (id: number) =>
    api.get<Post>(`/posts/${id}`),

  /**
   * Chi tiết bài viết theo slug
   */
  detailBySlug: (slug: string) =>
    api.get<Post>(`/posts/slug/${slug}`),

  /**
   * Thêm bài viết (multipart/form-data)
   */
  create: (data: FormData) =>
    api.post<Post>("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Cập nhật bài viết
   */
  update: (id: number, data: FormData) =>
    api.post<Post>(`/posts/${id}?_method=PUT`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Tăng lượt xem
   */
  increaseView: (id: number) =>
    api.post<{ success: boolean; views: number }>(
      `/posts/${id}/increase-view`
    ),

  /**
   * Xóa bài viết
   */
  delete: (id: number) =>
    api.delete(`/posts/${id}`),
};

export default PostService;
