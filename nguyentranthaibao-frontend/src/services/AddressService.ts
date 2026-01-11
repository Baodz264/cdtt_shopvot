// services/AddressService.ts
import api from "./api"; // import từ file api axios bạn đã tạo

// Định nghĩa interface cho Address
export interface Address {
  id: number;
  user_id: number;
  fullname: string;
  phone: string;
  address_line: string;
  city: string;
  district: string;
  ward: string;
  type?: "billing" | "shipping" | null;
  is_default?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

// Interface cho kết quả phân trang
export interface PaginatedAddresses {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Address[];
}

const AddressService = {
  // Lấy danh sách địa chỉ với phân trang và search
  async list(params?: { user_id?: number; search?: string; page?: number; limit?: number }): Promise<PaginatedAddresses> {
    const response = await api.get("/addresses", { params });
    return response.data;
  },

  // Lấy chi tiết một địa chỉ
  async get(id: number): Promise<Address> {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Thêm địa chỉ mới
  async create(data: Omit<Address, "id" | "created_at" | "updated_at">): Promise<Address> {
    const response = await api.post("/addresses", data);
    return response.data;
  },

  // Cập nhật địa chỉ
  async update(id: number, data: Partial<Omit<Address, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Address> {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  // Xóa địa chỉ
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};

export default AddressService;
