// services/BannerService.ts
import api from "./api";

export interface Banner {
  id: number;
  name: string;
  link?: string | null;
  image: string;
  position: string;
  status?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

// Kết quả phân trang
export interface PaginatedBanners {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Banner[];
}

const BannerService = {
  // Lấy danh sách banner với phân trang, search và filter status
  async list(params?: { search?: string; status?: 0 | 1; page?: number; limit?: number }): Promise<PaginatedBanners> {
    const response = await api.get("/banners", { params });
    return response.data;
  },

  // Lấy chi tiết banner
  async get(id: number): Promise<Banner> {
    const response = await api.get(`/banners/${id}`);
    return response.data;
  },

  // Thêm mới banner (upload ảnh)
  async create(data: {
    name: string;
    link?: string;
    image: File;
    position: string;
    status?: 0 | 1;
  }): Promise<Banner> {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.link) formData.append("link", data.link);
    formData.append("image", data.image);
    formData.append("position", data.position);
    if (data.status !== undefined) formData.append("status", data.status.toString());

    const response = await api.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Cập nhật banner (có thể thay ảnh)
  async update(
    id: number,
    data: {
      name?: string;
      link?: string;
      image?: File;
      position?: string;
      status?: 0 | 1;
    }
  ): Promise<Banner> {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.link) formData.append("link", data.link);
    if (data.image) formData.append("image", data.image);
    if (data.position) formData.append("position", data.position);
    if (data.status !== undefined) formData.append("status", data.status.toString());

    const response = await api.post(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // Laravel có thể cần _method=PUT nếu dùng POST + _method
      params: { _method: "PUT" },
    });
    return response.data;
  },

  // Xóa banner
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};

export default BannerService;
