import api from "./api";

export interface Post {
  id: number;
  title: string;
  slug: string;
}

export interface PostImage {
  id: number;
  post_id: number;
  image: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;

  post?: Post;
}

export interface PostImageListResponse {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: PostImage[];
}

const PostImageService = {
  /**
   * Danh sách ảnh bài viết
   */
  list: (params?: {
    page?: number;
    limit?: number;
    post_id?: number;
  }) => api.get<PostImageListResponse>("/post-images", { params }),

  /**
   * Thêm ảnh mới (có upload file)
   */
  create: (data: FormData) =>
    api.post<PostImage>("/post-images", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Chi tiết ảnh
   */
  detail: (id: number) => api.get<PostImage>(`/post-images/${id}`),

  /**
   * Cập nhật ảnh
   * (dùng _method=PUT vì Laravel không xử lý multipart trực tiếp)
   */
  update: (id: number, data: FormData) =>
    api.post<PostImage>(`/post-images/${id}?_method=PUT`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Xóa ảnh
   */
  delete: (id: number) => api.delete(`/post-images/${id}`),
};

export default PostImageService;
