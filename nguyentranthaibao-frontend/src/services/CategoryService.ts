import api from "./api";

/* ================= INTERFACES ================= */

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

export interface CategoryListParams {
  search?: string;
  status?: 0 | 1;
  from_date?: string;
  to_date?: string;
  sort_by?: "id" | "name" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/* ================= SERVICE ================= */

const CategoryService = {
  /* ========== LIST ========== */
  async list(params?: CategoryListParams): Promise<PaginatedCategories> {
    const response = await api.get("/categories", { params });
    return response.data;
  },

  /* ========== DETAIL ========== */
  async get(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /* ========== CREATE ========== */
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
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  /* ========== UPDATE ========== */
  async update(
    id: number,
    data: {
      name?: string;
      slug?: string;
      image?: File;
      status?: 0 | 1;
    }
  ): Promise<Category> {
    const formData = new FormData();

    if (data.name !== undefined) formData.append("name", data.name);
    if (data.slug !== undefined) formData.append("slug", data.slug);
    if (data.image) formData.append("image", data.image);
    if (data.status !== undefined)
      formData.append("status", data.status.toString());

    const response = await api.post(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      params: { _method: "PUT" }, // Chuẩn Laravel khi upload file
    });

    return response.data;
  },

  /* ========== DELETE ========== */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default CategoryService;
