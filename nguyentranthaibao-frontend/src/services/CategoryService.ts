// services/CategoryService.ts
import api from "./api";


export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  status?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedCategories {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Category[];
}

const CategoryService = {
  // Lấy danh sách category với phân trang, search và filter status
  async list(params?: { search?: string; status?: 0 | 1; page?: number; limit?: number }): Promise<PaginatedCategories> {
    const response = await api.get("/categories", { params });
    return response.data;
  },

  // Lấy chi tiết category
  async get(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Thêm category mới (có upload ảnh)
  async create(data: {
    name: string;
    slug?: string;
    image?: File;
    status?: 0 | 1;
  }): Promise<Category> {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.image) formData.append("image", data.image);
    if (data.status !== undefined) formData.append("status", data.status.toString());

    const response = await api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Cập nhật category (có thể thay ảnh)
  async update(id: number, data: {
    name?: string;
    slug?: string;
    image?: File;
    status?: 0 | 1;
  }): Promise<Category> {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.image) formData.append("image", data.image);
    if (data.status !== undefined) formData.append("status", data.status.toString());

    const response = await api.post(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" }, // Laravel dùng POST + _method=PUT để update khi upload file
    });
    return response.data;
  },

  // Xóa category
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default CategoryService;
