// services/BrandService.ts
import api from "./api";

/* =======================
 * INTERFACES
 * ======================= */
export interface Brand {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  status?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface BrandPagination {
  total: number;
  per_page: number;
  current: number;
  last_page: number;
}

export interface BrandListResponse {
  data: Brand[];
  pagination: BrandPagination;
}

/* =======================
 * SERVICE
 * ======================= */
const BrandService = {
  /**
   * Lấy danh sách Brand
   * GET /api/brands
   */
  async list(params?: {
    search?: string;
    status?: 0 | 1;
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
  }): Promise<BrandListResponse> {
    const response = await api.get("/brands", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết Brand
   * GET /api/brands/{id}
   */
  async get(id: number): Promise<Brand> {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  /**
   * Thêm Brand mới
   * POST /api/brands
   */
  async create(data: {
    name: string;
    slug?: string;
    image?: File;
    status?: 0 | 1;
  }): Promise<Brand> {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.image) formData.append("image", data.image);
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post("/brands", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  /**
   * Cập nhật Brand
   * PUT /api/brands/{id}
   */
  async update(
    id: number,
    data: {
      name?: string;
      slug?: string;
      image?: File;
      status?: 0 | 1;
    }
  ): Promise<Brand> {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.image) formData.append("image", data.image);
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post(`/brands/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" }, // Laravel upload file
    });

    return response.data;
  },

  /**
   * Xóa Brand
   * DELETE /api/brands/{id}
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

export default BrandService;
