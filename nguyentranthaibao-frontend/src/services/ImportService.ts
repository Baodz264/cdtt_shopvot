// services/ImportService.ts
import api from "./api";

export interface Import {
  id: number;
  user_id?: number | null;
  note?: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedImport {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Import[];
}

const ImportService = {
  // Lấy danh sách import có phân trang
  async list(params?: { page?: number; limit?: number }): Promise<PaginatedImport> {
    const response = await api.get("/imports", { params });
    return response.data;
  },

  // Lấy chi tiết một import
  async get(id: number): Promise<Import> {
    const response = await api.get(`/imports/${id}`);
    return response.data;
  },

  // Tạo mới import
  async create(data: { user_id?: number; note?: string }): Promise<Import> {
    const response = await api.post("/imports", data);
    return response.data;
  },

  // Cập nhật import
  async update(id: number, data: { user_id?: number; note?: string }): Promise<Import> {
    const response = await api.put(`/imports/${id}`, data);
    return response.data;
  },

  // Xóa import
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/imports/${id}`);
    return response.data;
  },
};

export default ImportService;
