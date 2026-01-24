// services/ImportService.ts
import api from "./api";

/* ================= INTERFACES ================= */

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

/* ===== Params đúng với ImportController@index ===== */
export interface ImportListParams {
  user_id?: number;
  keyword?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  sort_by?: "created_at" | "id";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/* ================= SERVICE ================= */

const ImportService = {
  /* ========== LIST ========== */
  async list(params?: ImportListParams): Promise<PaginatedImport> {
    const response = await api.get("/imports", { params });
    return response.data;
  },

  /* ========== DETAIL ========== */
  async get(id: number): Promise<Import> {
    const response = await api.get(`/imports/${id}`);
    return response.data;
  },

  /* ========== CREATE ========== */
  async create(data: {
    user_id?: number;
    note?: string;
  }): Promise<Import> {
    const response = await api.post("/imports", data);
    return response.data;
  },

  /* ========== UPDATE ========== */
  async update(
    id: number,
    data: {
      user_id?: number;
      note?: string;
    }
  ): Promise<Import> {
    const response = await api.put(`/imports/${id}`, data);
    return response.data;
  },

  /* ========== DELETE ========== */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/imports/${id}`);
    return response.data;
  },
};

export default ImportService;
