import api from "./api";

/**
 * Interface Topic theo API Laravel
 */
export interface Topic {
  id?: number;
  name: string;
  slug?: string;
  status?: number; // 0 | 1
  created_at?: string;
  updated_at?: string;
}

/**
 * Response phân trang
 */
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: T[];
}

/**
 * Response khi xóa
 */
export interface ApiMessage {
  message: string;
}

/**
 * Topic Service
 */
const TopicService = {
  /**
   * Lấy danh sách topic (search + status + phân trang)
   */
  async list(
    params?: Partial<{
      search: string;
      status: number;
      page: number;
      limit: number;
    }>
  ): Promise<PaginatedResponse<Topic>> {
    const res = await api.get("/topics", { params });
    return res.data;
  },

  /**
   * Chi tiết topic
   */
  async detail(id: number): Promise<Topic> {
    const res = await api.get(`/topics/${id}`);
    return res.data;
  },

  /**
   * Thêm topic
   */
  async create(data: {
    name: string;
    slug?: string;
    status?: number;
  }): Promise<Topic> {
    const res = await api.post("/topics", data);
    return res.data;
  },

  /**
   * Cập nhật topic
   */
  async update(
    id: number,
    data: Partial<{
      name: string;
      slug: string;
      status: number;
    }>
  ): Promise<Topic> {
    const res = await api.put(`/topics/${id}`, data);
    return res.data;
  },

  /**
   * Xóa topic
   */
  async delete(id: number): Promise<ApiMessage> {
    const res = await api.delete(`/topics/${id}`);
    return res.data;
  },
};

export default TopicService;
