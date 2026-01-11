import api from "./api";

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

const PostService = {
  /**
   * Lấy danh sách post (phân trang + search + type)
   */
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: "post" | "page";
  }) => api.get<PostListResponse>("/posts", { params }),

  /**
   * Chi tiết bài viết
   */
  detail: (id: number) => api.get<Post>(`/posts/${id}`),

  detailBySlug: (slug: string) => api.get<Post>(`/posts/slug/${slug}`),

  /**
   * Thêm bài viết (có upload ảnh)
   */
  create: (data: FormData) =>
    api.post<Post>("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  /**
   * Tăng lượt xem bài viết
   */
  increaseView: (id: number) =>
    api.post<{ success: boolean; views: number }>(`/posts/${id}/increase-view`),

  /**
   * Cập nhật bài viết
   */
  update: (id: number, data: FormData) =>
    api.post<Post>(`/posts/${id}?_method=PUT`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Xóa bài viết
   */
  delete: (id: number) => api.delete(`/posts/${id}`),
};

export default PostService;
