// services/ContactService.ts
import api from "./api";

export interface Contact {
  id: number;
  fullname: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  reply?: string | null;
  status?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedContacts {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Contact[];
}

const ContactService = {
  // Lấy danh sách contact với phân trang và filter status
  async list(params?: { status?: 0 | 1; page?: number; limit?: number }): Promise<PaginatedContacts> {
    const response = await api.get("/contacts", { params });
    return response.data;
  },

  // Lấy chi tiết contact
  async get(id: number): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Thêm contact
  async create(data: {
    fullname: string;
    email?: string;
    phone?: string;
    message: string;
    reply?: string;
    status?: 0 | 1;
  }): Promise<Contact> {
    const response = await api.post("/contacts", data);
    return response.data;
  },

  // Cập nhật contact
  async update(id: number, data: {
    fullname?: string;
    email?: string;
    phone?: string;
    message?: string;
    reply?: string;
    status?: 0 | 1;
  }): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  // Xóa contact
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

export default ContactService;
