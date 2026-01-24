import api from "./api";

export interface Menu {
  id: number;
  name: string;
  link?: string | null;
  type: "category" | "topic" | "post" | "custom";
  parent_id?: number | null;
  position: string;
  status: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenuDetailResponse {
  status: boolean;
  data: Menu;
}

export interface MenuListResponse {
  status: boolean;
  data: Menu[];
  total: number;
  limit: number;
  page: number;
  totalPage: number;
  message: string;
}

export interface MenuCreateRequest {
  name: string;
  link?: string | null;
  type: "category" | "topic" | "post" | "custom";
  parent_id?: number | null;
  position: string;
  status?: number;
}

export interface MenuListParams {
  page?: number;
  limit?: number;
  search?: string;

  status?: number;
  type?: "category" | "topic" | "post" | "custom";
  position?: string;
  parent_id?: number;

  from_date?: string;
  to_date?: string;

  sort_by?: "id" | "name" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface ApiResponseMessage {
  status: boolean;
  message: string;
}

const MenuService = {
  // ================= LIST =================
  async list(params?: MenuListParams): Promise<MenuListResponse> {
    const response = await api.get<MenuListResponse>("/menus", { params });
    return response.data;
  },

  // ================= DETAIL =================
  async detail(id: number): Promise<MenuDetailResponse> {
    const response = await api.get<MenuDetailResponse>(`/menus/${id}`);
    return response.data;
  },

  // ================= CREATE =================
  async create(data: MenuCreateRequest): Promise<MenuDetailResponse> {
    const response = await api.post<MenuDetailResponse>("/menus", data);
    return response.data;
  },

  // ================= UPDATE =================
  async update(
    id: number,
    data: Partial<MenuCreateRequest>
  ): Promise<MenuDetailResponse> {
    const response = await api.put<MenuDetailResponse>(`/menus/${id}`, data);
    return response.data;
  },

  // ================= DELETE =================
  async delete(id: number): Promise<ApiResponseMessage> {
    const response = await api.delete<ApiResponseMessage>(`/menus/${id}`);
    return response.data;
  }
};

export default MenuService;
