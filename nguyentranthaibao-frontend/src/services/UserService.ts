import api from "./api";

/**
 * Interface User theo API Laravel
 */
export interface User {
  id?: number;
  name?: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  status: 0 | 1;
  avatar?: string;
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
  from?: number;
  to?: number;
  data: T[];
}

/**
 * Response message
 */
export interface ApiMessage {
  message: string;
}

/**
 * Params list user
 */
export interface UserListParams {
  search?: string;
  role?: "customer" | "admin";
  status?: 0 | 1;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  sort_by?: "id" | "name" | "email" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * User Service
 */
const UserService = {
  /**
   * Lấy danh sách user (search + filter + sort + phân trang)
   */
  async list(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const res = await api.get("/users", { params });
    return res.data;
  },

  /**
   * Lấy chi tiết user
   */
  async detail(id: number): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  /**
   * Thêm user (upload avatar)
   */
  async create(formData: FormData): Promise<User> {
    const res = await api.post("/users", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Cập nhật user (có upload avatar)
   * Laravel: PUT không gửi file → dùng POST + _method=PUT
   */
  async update(id: number, formData: FormData): Promise<User> {
    const res = await api.post(`/users/${id}?_method=PUT`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Xóa user
   */
  async delete(id: number): Promise<ApiMessage> {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export default UserService;
