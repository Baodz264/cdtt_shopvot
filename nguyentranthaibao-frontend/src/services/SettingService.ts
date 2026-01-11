import api from "./api";

/**
 * Kiểu dữ liệu Setting theo đúng cấu trúc API Laravel
 */
export interface Setting {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  hotline?: string;
  address?: string;
  logo?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Kiểu dữ liệu cho response phân trang
 */
export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  from: number;
  to: number;
  data: T[];
}

/**
 * Response khi xóa hoặc trả về tin nhắn từ API Laravel
 */
export interface ApiMessage {
  message: string;
}

/**
 * Service xử lý API Setting
 */
const SettingService = {
  /**
   * Lấy danh sách Setting (search + phân trang)
   */
  async list(
    params?: Partial<{
      search: string;
      page: number;
      limit: number;
    }>
  ): Promise<PaginatedResponse<Setting>> {
    const response = await api.get("/settings", { params });
    return response.data;
  },

  /**
   * Chi tiết Setting theo ID
   */
  async detail(id: number): Promise<Setting> {
    const response = await api.get(`/settings/${id}`);
    return response.data;
  },

  /**
   * Thêm Setting (có upload file)
   */
  async create(formData: FormData): Promise<Setting> {
    const response = await api.post("/settings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Cập nhật Setting (có upload file)
   * PUT không gửi được FormData → dùng POST + _method=PUT
   */
  async update(id: number, formData: FormData): Promise<Setting> {
    const response = await api.post(`/settings/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Xóa Setting theo ID
   */
  async delete(id: number): Promise<ApiMessage> {
    const response = await api.delete(`/settings/${id}`);
    return response.data;
  },
};

export default SettingService;
