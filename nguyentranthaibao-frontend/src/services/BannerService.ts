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

export interface PaginatedBanners {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Banner[];
}

export interface BannerListParams {
  search?: string;
  status?: 0 | 1;
  position?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: "id" | "name" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

const BannerService = {
  /* ================= LIST ================= */
  async list(params?: BannerListParams): Promise<PaginatedBanners> {
    const response = await api.get("/banners", { params });
    return response.data;
  },

  /* ================= DETAIL ================= */
  async get(id: number): Promise<Banner> {
    const response = await api.get(`/banners/${id}`);
    return response.data;
  },

  /* ================= CREATE ================= */
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
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  /* ================= UPDATE ================= */
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

    if (data.name !== undefined) formData.append("name", data.name);
    if (data.link !== undefined) formData.append("link", data.link);
    if (data.image) formData.append("image", data.image);
    if (data.position !== undefined)
      formData.append("position", data.position);
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post(`/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" }, // chuẩn Laravel
    });

    return response.data;
  },

  /* ================= DELETE ================= */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/banners/${id}`);
    return response.data;
  },
};

export default BannerService;
