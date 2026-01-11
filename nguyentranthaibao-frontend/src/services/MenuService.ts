// services/MenuService.ts
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

export interface ApiResponseMessage {
  status: boolean;
  message: string;
}

const MenuService = {
  // Lấy danh sách
  async list(
    params?: Partial<{
      page: number;
      limit: number;
      search: string;
      status: number;
    }>
  ): Promise<MenuListResponse> {
    const response = await api.get<MenuListResponse>("/menus", { params });
    return response.data;
  },

  // Chi tiết
  async detail(id: number): Promise<MenuDetailResponse> {
    const response = await api.get<MenuDetailResponse>(`/menus/${id}`);
    return response.data;
  },

  // Thêm menu
  async create(data: MenuCreateRequest): Promise<MenuDetailResponse> {
    const response = await api.post<MenuDetailResponse>("menus", data);
    return response.data;
  },

  // Cập nhật menu
  async update(
    id: number,
    data: Partial<MenuCreateRequest>
  ): Promise<MenuDetailResponse> {
    const response = await api.put<MenuDetailResponse>(`/menus/${id}`, data);
    return response.data;
  },

  // Xóa menu
  async delete(id: number): Promise<ApiResponseMessage> {
    const response = await api.delete<ApiResponseMessage>(`/menus/${id}`);
    return response.data;
  }
};

export default MenuService;
